// components/chat/Chat.tsx
"use client";

import { useRef, useState } from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { readChatStream } from "@/lib/chat-stream/client";
import {
  CHAT_STREAM_EVENT,
  MAX_USER_MESSAGE_CHARS,
} from "@/lib/chat-stream/shared";

import { PromptInput } from "./prompt-input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

type ChatProps = {
  /** Pass an existing thread to continue it; omit to start a new one on first send. */
  initialThreadId?: string;
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

export function Chat({ initialThreadId }: ChatProps) {
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = (message: Omit<ChatMessage, "id">) =>
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...message }]);

  const showError = (content: string) =>
    addMessage({ role: "assistant", content, isError: true });

  /** Session is gone: reload so the proxy redirects to sign-in. */
  const handleUnauthorized = () => window.location.reload();

  /** Replaces an AI message's text by id, or adds it if new (stream sends full text so far). */
  const upsertAssistantMessage = (id: string, content: string) =>
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === id);
      if (index === -1) return [...prev, { id, role: "assistant", content }];
      const next = [...prev];
      next[index] = { ...next[index], content };
      return next;
    });

  /** Returns the current thread id, creating a thread on the first message. */
  async function getOrCreateThreadId(): Promise<string> {
    if (threadId) return threadId;

    const res = await fetch("/api/threads", { method: "POST" });
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error("Your session expired. Redirecting to sign in…");
    }
    if (!res.ok)
      throw new Error(
        await readErrorMessage(res, "Could not start a new chat."),
      );

    const { threadId: newThreadId } = (await res.json()) as {
      threadId: string;
    };
    setThreadId(newThreadId);
    return newThreadId;
  }

  async function sendMessage(rawText: string) {
    const message = rawText.trim();
    if (!message || isStreaming) return;

    if (message.length > MAX_USER_MESSAGE_CHARS) {
      showError(
        `Message is too long (max ${MAX_USER_MESSAGE_CHARS} characters).`,
      );
      return;
    }

    addMessage({ role: "user", content: message });
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const currentThreadId = await getOrCreateThreadId();

      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: currentThreadId, message }), // text only
        signal: abortController.signal,
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      // 4xx/5xx before streaming starts come back as JSON, not SSE
      if (!res.ok || !res.body) {
        showError(
          await readErrorMessage(
            res,
            "Something went wrong. Please try again.",
          ),
        );
        return;
      }

      await readChatStream(res.body, ({ event, payload }) => {
        switch (event) {
          case CHAT_STREAM_EVENT.TOKEN:
            for (const m of payload) upsertAssistantMessage(m.id, m.content);
            break;
          case CHAT_STREAM_EVENT.ERROR:
            showError(payload.error);
            break;
          case CHAT_STREAM_EVENT.DONE:
            break;
        }
      });
    } catch (err) {
      // Stop button: keep the partial reply, show nothing extra
      if (abortController.signal.aborted) return;
      console.error(err);
      showError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  const stopStreaming = () => abortControllerRef.current?.abort();

  return (
    <div className="flex h-dvh flex-col">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {messages.map((msg) => {
                const align = msg.role === "user" ? "end" : "start";
                return (
                  <MessageScrollerItem
                    key={msg.id}
                    messageId={msg.id}
                    scrollAnchor
                  >
                    <Message align={align}>
                      <MessageContent>
                        <Bubble
                          align={align}
                          variant={msg.role === "user" ? "muted" : undefined}
                        >
                          <BubbleContent>
                            {msg.isError ? (
                              <span className="text-destructive">
                                ⚠️ {msg.content}
                              </span>
                            ) : (
                              msg.content
                            )}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="flex items-end gap-2 p-2">
        <div className="flex-1">
          <PromptInput
            disabled={isStreaming}
            onSubmit={(text: string) => void sendMessage(text)}
          />
        </div>
        {isStreaming && (
          <button
            type="button"
            onClick={stopStreaming}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
