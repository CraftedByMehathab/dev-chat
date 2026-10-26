// Browser transport for the chat: the only module here that knows about our HTTP routes.
import {
  readChatStream,
  type ChatStreamMessage,
} from "@/lib/chat-stream/client";

/** An expected failure whose message is safe to show the user. */
export class ChatApiError extends Error {}

/** The session is gone (401); the caller should send the user to sign in. */
export class UnauthorizedError extends ChatApiError {
  constructor() {
    super("Your session expired. Redirecting to sign in…");
  }
}

export type StreamReplyRequest = {
  threadId: string;
  message: string;
  signal: AbortSignal;
};

/** What useChat needs from the backend, so it can be swapped (e.g. for a fake in tests). */
export type ChatApi = {
  streamReply(
    request: StreamReplyRequest,
    onEvent: (event: ChatStreamMessage) => void,
  ): Promise<void>;
};

/** Reads { error } from a failed JSON response, with a fallback. */
async function readErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    return typeof body.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export const httpChatApi: ChatApi = {
  async streamReply({ threadId, message, signal }, onEvent) {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, message }), // text only
      signal,
    });
    if (res.status === 401) throw new UnauthorizedError();

    // 4xx/5xx before streaming starts come back as JSON, not SSE
    if (!res.ok || !res.body)
      throw new ChatApiError(
        await readErrorMessage(res, "Something went wrong. Please try again."),
      );

    await readChatStream(res.body, onEvent);
  },
};
