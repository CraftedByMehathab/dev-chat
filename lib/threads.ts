// Thread ownership: creating threads and checking who owns them.
import "server-only";
import { extractHistoryMessages } from "@/lib/chat-stream/server";
import { langgraphClient } from "@/lib/langgraph";
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

export type OwnedThreadSummary = Awaited<
  ReturnType<typeof listOwnedThreads>
>[number];

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
