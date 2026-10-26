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

import type { ChatMessage } from "./messages";

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const align = message.role === "user" ? "end" : "start";
  return (
    <Message align={align}>
      <MessageContent>
        <Bubble
          align={align}
          // AI replies read as plain text; a lime bubble would be too loud
          variant={message.role === "user" ? "muted" : "ghost"}
        >
          <BubbleContent>
            {message.isError ? (
              <span className="text-destructive">⚠️ {message.content}</span>
            ) : (
              message.content
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor
              >
                <ChatMessageBubble message={message} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
