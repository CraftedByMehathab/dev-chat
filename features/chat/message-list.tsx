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
          variant={message.role === "user" ? "muted" : undefined}
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
          <MessageScrollerContent>
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
