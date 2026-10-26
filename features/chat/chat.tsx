"use client";

import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";
import { useChat } from "./use-chat";

type ChatProps = {
  /** The thread to chat in; it's created up front by the New chat button. */
  threadId: string;
};

export function Chat({ threadId }: ChatProps) {
  const { messages, isStreaming, sendMessage, stop } = useChat({ threadId });

  return (
    <div className="flex h-dvh flex-col">
      <MessageList messages={messages} />
      <ChatComposer
        isStreaming={isStreaming}
        onSend={sendMessage}
        onStop={stop}
      />
    </div>
  );
}
