import { auth } from "@/auth";
import {
  ChatStreamRequestSchema,
  createChatStreamWriter,
  extractStreamedAIMessages,
  isLangGraphMessageEvent,
  isThreadBusyError,
} from "@/lib/chat-stream/server";
import {
  CHAT_STREAM_ERROR_CODE,
  CHAT_STREAM_EVENT,
} from "@/lib/chat-stream/shared";
import {
  DEFAULT_THREAD_TITLE,
  threadTitleFromMessage,
} from "@/lib/thread-title";
import { findOwnedThread } from "@/lib/threads";
import { jsonError } from "@/lib/http";
import { LANGGRAPH_ASSISTANT_ID, langgraphClient } from "@/lib/langgraph";
import { prisma } from "@/prisma";

export const maxDuration = 300;

export async function POST(req: Request) {
  // ── 1. Authentication ─────────────────────────────
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return jsonError("Unauthorized", 401);

  // ── 2. Accept ONLY { threadId, message } ──────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = ChatStreamRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }
  const { threadId, message } = parsed.data;

  // ── 3. Ownership check ────────────────────────────
  const thread = await findOwnedThread(threadId, userId);
  if (!thread) return jsonError("Thread not found", 404);

  // Mark activity now, so Stop or a late failure can't skip it.
  // An untitled thread is named after this message (the client does the same).
  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      lastMessageAt: new Date(),
      ...(thread.title === DEFAULT_THREAD_TITLE && {
        title: threadTitleFromMessage(message),
      }),
    },
  });

  // ── 4. Server builds the input ────────────────────
  // Always one human message. Client can't inject
  // ai/system/tool messages or other state keys.
  const runInput = { messages: [{ type: "human", content: message }] };

  // ── 5. Stream AI text to the browser ──────────────
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sendEvent = createChatStreamWriter(controller);

      try {
        const runStream = langgraphClient.runs.stream(
          threadId,
          LANGGRAPH_ASSISTANT_ID,
          {
            input: runInput,
            streamMode: ["messages"],
            multitaskStrategy: "reject", // 2nd run on a busy thread → 409
            signal: req.signal,
            onDisconnect: "cancel",
          },
        );

        for await (const chunk of runStream) {
          if (!isLangGraphMessageEvent(chunk.event)) continue;

          // Only forward AI text: no tool args, metadata, or internal state
          const messages = extractStreamedAIMessages(chunk.data);
          if (messages.length) sendEvent(CHAT_STREAM_EVENT.TOKEN, messages);
        }

        sendEvent(CHAT_STREAM_EVENT.DONE, {});
      } catch (err) {
        if (req.signal.aborted) return; // user left or clicked Stop

        if (isThreadBusyError(err)) {
          sendEvent(CHAT_STREAM_EVENT.ERROR, {
            code: CHAT_STREAM_ERROR_CODE.THREAD_BUSY,
            error:
              "Still replying to your last message. Wait for it to finish, or stop it first.",
          });
        } else {
          console.error("chat-stream error", err);
          sendEvent(CHAT_STREAM_EVENT.ERROR, {
            code: CHAT_STREAM_ERROR_CODE.STREAM_FAILED,
            error: "Something went wrong. Please try again.",
          });
        }
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
