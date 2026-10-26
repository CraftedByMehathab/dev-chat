// Thread titles. Safe to import from both client and server code.

/** Title of a thread before its first message; matches the schema default. */
export const DEFAULT_THREAD_TITLE = "New chat";

const MAX_THREAD_TITLE_CHARS = 60;

/** A title from the thread's first message: one line, cut at a word boundary. */
export function threadTitleFromMessage(message: string): string {
  const line = message.replace(/\s+/g, " ").trim();
  if (!line) return DEFAULT_THREAD_TITLE;
  if (line.length <= MAX_THREAD_TITLE_CHARS) return line;

  const cut = line.slice(0, MAX_THREAD_TITLE_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  // Fall back to a hard cut when the only space is near the start
  const words =
    lastSpace > MAX_THREAD_TITLE_CHARS / 2 ? cut.slice(0, lastSpace) : cut;
  return `${words.trimEnd()}…`;
}
