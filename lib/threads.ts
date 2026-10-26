// Thread ownership: creating threads and checking who owns them.
import "server-only";
import { extractHistoryMessages } from "@/lib/chat-stream/server";
import type { StreamedAIMessage } from "@/lib/chat-stream/shared";
import { LANGGRAPH_MODEL_NODE, langgraphClient } from "@/lib/langgraph";
import { prisma } from "@/prisma";

/** Returns the thread only if it belongs to the user, else null (treat as not found). */
export const findOwnedThread = (threadId: string, userId: string) =>
  prisma.chatThread.findFirst({
    where: { id: threadId, userId },
    select: { id: true, title: true },
  });

/**
 * The user's threads for the sidebar, newest activity first. Hides archived
 * threads and ones that were never messaged. Served by the
 * [userId, archived, lastMessageAt] index.
 */
export const listOwnedThreads = (userId: string) =>
  prisma.chatThread.findMany({
    where: { userId, archived: false, lastMessageAt: { not: null } },
    orderBy: { lastMessageAt: "desc" },
    select: { id: true, title: true, lastMessageAt: true },
  });

/**
 * The thread's past human and AI messages, oldest first. Call only after
 * findOwnedThread: this reads LangGraph directly and checks no ownership.
 */
export async function getThreadHistory(threadId: string) {
  const { values } = await langgraphClient.threads.getState(threadId);
  return extractHistoryMessages(values);
}

/**
 * After Stop: waits for the run to stop, then saves the partial reply the user
 * saw. LangGraph doesn't, and without it the thread ends on an unanswered
 * human message, so the next run answers that one instead of the new message.
 * Skipped when the run got to save the reply itself.
 */
export async function savePartialReply(
  threadId: string,
  runId: string,
  reply: StreamedAIMessage,
) {
  await langgraphClient.runs
    .cancel(threadId, runId, true, "interrupt")
    // Already finished or cancelled: just make sure it's done
    .catch(() => langgraphClient.runs.join(threadId, runId));

  const { values } = await langgraphClient.threads.getState(threadId);
  const messages =
    (values as { messages?: { id?: string; type?: string }[] } | null)
      ?.messages ?? [];
  const alreadySaved =
    messages.at(-1)?.type === "ai" || messages.some((m) => m.id === reply.id);
  if (alreadySaved) return;

  await langgraphClient.threads.updateState(threadId, {
    values: {
      messages: [{ type: "ai", id: reply.id, content: reply.content }],
    },
    asNode: LANGGRAPH_MODEL_NODE,
  });
}

export type OwnedThreadSummary = Awaited<
  ReturnType<typeof listOwnedThreads>
>[number];

/**
 * Deletes the thread if it belongs to the user; returns false if it doesn't.
 * The row goes first, since it's what grants access. The LangGraph thread is
 * cleaned up after, and if that fails nobody can reach it anyway.
 */
export async function deleteOwnedThread(
  threadId: string,
  userId: string,
): Promise<boolean> {
  const { count } = await prisma.chatThread.deleteMany({
    where: { id: threadId, userId },
  });
  if (count === 0) return false;

  await langgraphClient.threads.delete(threadId).catch((err) => {
    console.error("threads: LangGraph delete failed", err);
  });
  return true;
}

/**
 * Creates the LangGraph thread first, then the ChatThread row that records
 * ownership. If the row fails, deletes the LangGraph thread so nobody is left
 * holding an orphan. Returns the shared thread id.
 */
export async function createOwnedThread(userId: string): Promise<string> {
  const { thread_id: threadId } = await langgraphClient.threads.create({
    metadata: { userId },
  });

  try {
    await prisma.chatThread.create({ data: { id: threadId, userId } });
    return threadId;
  } catch (err) {
    await langgraphClient.threads.delete(threadId).catch((cleanupErr) => {
      console.error("threads: LangGraph cleanup failed", cleanupErr);
    });
    throw err;
  }
}
