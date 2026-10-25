// lib/chat-stream/shared.ts
// Safe to import from both client and server code.

/** Max length of a user's chat message, enforced on server and client. */
export const MAX_USER_MESSAGE_CHARS = 8000;

/** SSE event names sent from /api/chat-stream to the browser. */
export const CHAT_STREAM_EVENT = {
  TOKEN: "token",
  DONE: "done",
  ERROR: "error",
} as const;

export type ChatStreamEvent =
  (typeof CHAT_STREAM_EVENT)[keyof typeof CHAT_STREAM_EVENT];

/** One AI message as sent in a TOKEN event (full text so far, not a delta). */
export type StreamedAIMessage = {
  id: string;
  content: string;
};

/** Machine-readable error codes, so the UI can react without parsing text. */
export const CHAT_STREAM_ERROR_CODE = {
  THREAD_BUSY: "THREAD_BUSY",
  STREAM_FAILED: "STREAM_FAILED",
} as const;

export type ChatStreamErrorCode =
  (typeof CHAT_STREAM_ERROR_CODE)[keyof typeof CHAT_STREAM_ERROR_CODE];

/** Payloads for each event, so client and server agree on shapes. */
export type ChatStreamPayload = {
  [CHAT_STREAM_EVENT.TOKEN]: StreamedAIMessage[];
  [CHAT_STREAM_EVENT.DONE]: Record<string, never>;
  [CHAT_STREAM_EVENT.ERROR]: { code: ChatStreamErrorCode; error: string };
};
