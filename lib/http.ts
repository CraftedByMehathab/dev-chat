// Small helpers for building API route responses.
import "server-only";

/** JSON error response, e.g. jsonError("Unauthorized", 401). */
export const jsonError = (error: string, status: number) =>
  Response.json({ error }, { status });
