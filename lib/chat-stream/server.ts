// lib/chat-stream/server.ts
// Server-only helpers for /api/chat-stream.
import "server-only";
import { z } from "zod";
import {
  MAX_USER_MESSAGE_CHARS,
  type ChatStreamEvent,
  type ChatStreamPayload,
  type HistoryMessage,
  type StreamedAIMessage,
} from "./shared";

const textEncoder = new TextEncoder();

/**
 * LangGraph stream events that carry message content.
 * Only partials: the last partial already holds the full text. "messages/complete"
 * resends it under the provider's id (msg_…, not run-…), which would show as a
 * second bubble, and also replays messages already in the thread's state.
 */
const LANGGRAPH_MESSAGE_EVENTS: readonly string[] = ["messages/partial"];

/** LangGraph message types produced by the AI (excludes human, tool, system). */
const LANGGRAPH_AI_MESSAGE_TYPES: readonly string[] = ["ai", "AIMessageChunk"];

/** The only request body the route accepts. Extra keys are rejected. */
export const ChatStreamRequestSchema = z
  .object({
    threadId: z.string().min(1, "threadId is required"),
    message: z
      .string()
      .trim()
      .min(1, "message is required")
      .max(
        MAX_USER_MESSAGE_CHARS,
        `message exceeds ${MAX_USER_MESSAGE_CHARS} characters`,
      ),
  })
  .strict();

export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;

/**
 * True when LangGraph refused the run because another run is active on the
 * thread (multitaskStrategy: "reject" → HTTP 409 Conflict).
 */
export const isThreadBusyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  (err as { status?: unknown }).status === 409; // LangGraph SDK's HTTPError has .status

/** Returns a typed function that writes one SSE event to the stream. */
export const createChatStreamWriter =
  (controller: ReadableStreamDefaultController<Uint8Array>) =>
  <E extends ChatStreamEvent>(event: E, payload: ChatStreamPayload[E]) =>
    controller.enqueue(
      textEncoder.encode(
        `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`,
      ),
    );

/** True when a LangGraph stream chunk carries message content. */
export const isLangGraphMessageEvent = (event: string) =>
  LANGGRAPH_MESSAGE_EVENTS.includes(event);

type LangGraphAIMessage = { id?: string; type: string; content: unknown };

const isLangGraphAIMessage = (value: unknown): value is LangGraphAIMessage =>
  typeof value === "object" &&
  value !== null &&
  LANGGRAPH_AI_MESSAGE_TYPES.includes(
    (value as { type?: unknown }).type as string,
  );

/** LangChain content can be a string or an array of parts. Keeps text parts only. */
const messageContentToText = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        part?.type === "text" && typeof part.text === "string" ? part.text : "",
      )
      .join("");
  }
  return "";
};

/**
 * From a LangGraph message chunk, keep only AI messages that have an id and text.
 * Drops human, tool and system messages, tool-call args, and metadata.
 */
export const extractStreamedAIMessages = (
  chunkData: unknown,
): StreamedAIMessage[] =>
  (Array.isArray(chunkData) ? chunkData : []).flatMap((message) => {
    if (!isLangGraphAIMessage(message)) return [];
    const content = messageContentToText(message.content);
    return message.id && content ? [{ id: message.id, content }] : [];
  });

/** LangGraph message types kept in history, mapped to chat roles. */
const HISTORY_ROLES: Record<string, HistoryMessage["role"]> = {
  human: "user",
  ai: "assistant",
};

/**
 * From a thread's saved state, keep only human and AI text, in order.
 * Same rule as streaming: tool and system messages, tool calls and metadata
 * are dropped, and so are AI messages that only called a tool.
 */
export const extractHistoryMessages = (values: unknown): HistoryMessage[] => {
  const messages = (values as { messages?: unknown } | null)?.messages;
  return (Array.isArray(messages) ? messages : []).flatMap((message, index) => {
    const role = HISTORY_ROLES[(message as { type?: unknown })?.type as string];
    if (!role) return [];
    const content = messageContentToText(message.content);
    // Ids come from LangGraph; the index fallback only keeps React keys unique
    const id = typeof message.id === "string" ? message.id : `history-${index}`;
    return content ? [{ id, role, content }] : [];
  });
};
