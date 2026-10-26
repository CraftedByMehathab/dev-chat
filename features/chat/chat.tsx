"use client";

import { useThreadActivity } from "@/features/threads/thread-activity";

import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./messages";
import { useChat } from "./use-chat";

type ChatProps = {
  /** The thread to chat in; it's created up front by the New chat button. */
  threadId: string;
  /** Shown in the sidebar once the thread has a message. */
  title: string;
  /** Messages already in the thread, loaded by the page. */
  initialMessages?: ChatMessage[];
};

export function Chat({ threadId, title, initialMessages }: ChatProps) {
  const { touchThread } = useThreadActivity();
  const { messages, isStreaming, sendMessage, stop } = useChat({
    threadId,
    initialMessages,
  });

  // Moves this thread to the top of the sidebar locally, mirroring the
  // activity the server records, without refetching the route
  function send(rawText: string): boolean {
    const sent = sendMessage(rawText);
    if (sent) touchThread({ id: threadId, title });
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
