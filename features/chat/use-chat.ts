"use client";

import { useRef, useState } from "react";
import { CHAT_STREAM_EVENT } from "@/lib/chat-stream/shared";

import {
  ChatApiError,
  httpChatApi,
  UnauthorizedError,
  type ChatApi,
} from "./chat-api";
import {
  appendMessage,
  checkUserMessage,
  upsertAssistantMessage,
  type ChatMessage,
} from "./messages";

type UseChatOptions = {
  /** Pass an existing thread to continue it; omit to start a new one on first send. */
  initialThreadId?: string;
  api?: ChatApi;
  /** Session is gone. Defaults to a reload so the proxy redirects to sign-in. */
  onUnauthorized?: () => void;
};

const reloadPage = () => window.location.reload();

/** Owns the conversation: message list, streaming state, and Stop. */
export function useChat({
  initialThreadId,
  api = httpChatApi,
  onUnauthorized = reloadPage,
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  // Not rendered, so a ref: no re-render, and no stale value inside streamReply
  const threadIdRef = useRef<string | null>(initialThreadId ?? null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showError = (content: string) =>
    setMessages((prev) =>
      appendMessage(prev, { role: "assistant", content, isError: true }),
    );

  /** Returns the current thread id, creating a thread on the first message. */
  async function getOrCreateThreadId(): Promise<string> {
    threadIdRef.current ??= await api.createThread();
    return threadIdRef.current;
  }

  async function streamReply(message: string) {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const threadId = await getOrCreateThreadId();
      await api.streamReply(
        { threadId, message, signal: abortController.signal },
        ({ event, payload }) => {
          switch (event) {
            case CHAT_STREAM_EVENT.TOKEN:
              setMessages((prev) =>
                payload.reduce(
                  (acc, m) => upsertAssistantMessage(acc, m.id, m.content),
                  prev,
                ),
              );
              break;
            case CHAT_STREAM_EVENT.ERROR:
              showError(payload.error);
              break;
            case CHAT_STREAM_EVENT.DONE:
              break;
          }
        },
      );
    } catch (err) {
      // Stop button: keep the partial reply, show nothing extra
      if (abortController.signal.aborted) return;
      if (err instanceof UnauthorizedError) {
        showError(err.message);
        onUnauthorized();
        return;
      }
      if (!(err instanceof ChatApiError)) console.error(err);
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

  // Returns whether the message was accepted, so the input knows to clear
  function sendMessage(rawText: string): boolean {
    if (isStreaming) return false;

    const check = checkUserMessage(rawText);
    if (!check.ok) {
      if (check.error) showError(check.error);
      return false;
    }

    setMessages((prev) =>
      appendMessage(prev, { role: "user", content: check.message }),
    );
    setIsStreaming(true);
    void streamReply(check.message);
    return true;
  }

  const stop = () => abortControllerRef.current?.abort();

  return { messages, isStreaming, sendMessage, stop };
}
