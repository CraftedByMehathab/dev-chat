"use client";

import { ChatComposer } from "./chat-composer";
import { MessageList } from "./message-list";
import { useChat } from "./use-chat";

type ChatProps = {
  /** Pass an existing thread to continue it; omit to start a new one on first send. */
  initialThreadId?: string;
};

export function Chat({ initialThreadId }: ChatProps) {
  const { messages, isStreaming, sendMessage, stop } = useChat({
    initialThreadId,
  });

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
