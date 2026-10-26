// Pure message logic: no React, no fetch, so it's easy to reason about and test.
import { MAX_USER_MESSAGE_CHARS } from "@/lib/chat-stream/shared";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

export type UserMessageCheck =
  { ok: true; message: string } | { ok: false; error?: string };

/** Trims the input and checks it can be sent; an empty message fails without an error. */
export function checkUserMessage(rawText: string): UserMessageCheck {
  const message = rawText.trim();
  if (!message) return { ok: false };
  if (message.length > MAX_USER_MESSAGE_CHARS) {
    return {
      ok: false,
      error: `Message is too long (max ${MAX_USER_MESSAGE_CHARS} characters).`,
    };
  }
  return { ok: true, message };
}

export const appendMessage = (
  messages: ChatMessage[],
  message: Omit<ChatMessage, "id">,
): ChatMessage[] => [...messages, { id: crypto.randomUUID(), ...message }];

/** Replaces an AI message's text by id, or adds it if new (stream sends full text so far). */
export function upsertAssistantMessage(
  messages: ChatMessage[],
  id: string,
  content: string,
): ChatMessage[] {
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return [...messages, { id, role: "assistant", content }];
  const next = [...messages];
  next[index] = { ...next[index], content };
  return next;
}
