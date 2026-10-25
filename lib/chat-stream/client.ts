// Browser helper: reads the SSE response from /api/chat-stream.
import {
  CHAT_STREAM_EVENT,
  type ChatStreamEvent,
  type ChatStreamPayload,
} from "./shared";

/** One parsed event, typed by its name: { event: "token", payload: StreamedAIMessage[] }, etc. */
export type ChatStreamMessage = {
  [E in ChatStreamEvent]: { event: E; payload: ChatStreamPayload[E] };
}[ChatStreamEvent];

const KNOWN_EVENTS: readonly string[] = Object.values(CHAT_STREAM_EVENT);

const isKnownEvent = (event: string): event is ChatStreamEvent =>
  KNOWN_EVENTS.includes(event);

/**
 * Reads an SSE body chunk by chunk and calls onMessage for each complete event.
 * fetch is used instead of EventSource because EventSource can't send a POST body.
 */
export async function readChatStream(
  body: ReadableStream<Uint8Array>,
  onMessage: (message: ChatStreamMessage) => void,
): Promise<void> {
  const reader = body.getReader();
  // { stream: true } keeps multi-byte characters (é, 👋) intact across chunks
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // A blank line (\n\n) ends one SSE event; chunks can split events anywhere
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      let event = "";
      let data = "";
      for (const line of rawEvent.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }

      if (!isKnownEvent(event) || !data) continue;

      try {
        onMessage({ event, payload: JSON.parse(data) } as ChatStreamMessage);
      } catch (err) {
        console.error("chat-stream: could not parse event", event, err);
      }
    }
  }
}
