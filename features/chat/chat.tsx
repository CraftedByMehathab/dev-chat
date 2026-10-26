"use client";

import {
  useThreadActivity,
  useThreadTitle,
} from "@/features/threads/thread-activity";
import {
  DEFAULT_THREAD_TITLE,
  threadTitleFromMessage,
} from "@/lib/thread-title";

import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./messages";
import { useChat } from "./use-chat";

type ChatProps = {
  /** The thread to chat in; it's created up front by the New chat button. */
  threadId: string;
  /** The thread's title when the page loaded. */
  title: string;
  /** Messages already in the thread, loaded by the page. */
  initialMessages?: ChatMessage[];
};

export function Chat({ threadId, title, initialMessages }: ChatProps) {
  const { touchThread } = useThreadActivity();
  const currentTitle = useThreadTitle(threadId, title);
  const { messages, isStreaming, sendMessage, stop } = useChat({
    threadId,
    initialMessages,
  });

  // Updates the sidebar and header locally, mirroring what the server saves:
  // activity now, and a title from the message if the thread has none
  function send(rawText: string): boolean {
    const sent = sendMessage(rawText);
    if (sent) {
      touchThread({
        id: threadId,
        title:
          currentTitle === DEFAULT_THREAD_TITLE
            ? threadTitleFromMessage(rawText)
            : currentTitle,
      });
    }
    return sent;
  }

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 ? (
        <ChatEmptyState onPick={send} />
      ) : (
        <MessageList messages={messages} />
      )}
      <ChatComposer isStreaming={isStreaming} onSend={send} onStop={stop} />
    </div>
  );
}
