"use client";

import { useRouter } from "next/navigation";

import { ChatComposer } from "./chat-composer";
import { ChatEmptyState } from "./chat-empty-state";
import { MessageList } from "./message-list";
import { useChat } from "./use-chat";

type ChatProps = {
  /** The thread to chat in; it's created up front by the New chat button. */
  threadId: string;
};

export function Chat({ threadId }: ChatProps) {
  const router = useRouter();
  const { messages, isStreaming, sendMessage, stop } = useChat({
    threadId,
    // Re-renders the server sidebar so this thread's activity shows; client state is kept
    onReplySettled: router.refresh,
  });

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 ? (
        <ChatEmptyState onPick={sendMessage} />
      ) : (
        <MessageList messages={messages} />
      )}
      <ChatComposer
        isStreaming={isStreaming}
        onSend={sendMessage}
        onStop={stop}
      />
    </div>
  );
}
