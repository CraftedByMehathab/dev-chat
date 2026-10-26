// Thread ownership: creating threads and checking who owns them.
import "server-only";
import { langgraphClient } from "@/lib/langgraph";
import { prisma } from "@/prisma";

/** Returns the thread only if it belongs to the user, else null (treat as not found). */
export const findOwnedThread = (threadId: string, userId: string) =>
  prisma.chatThread.findFirst({
    where: { id: threadId, userId },
    select: { id: true },
  });

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
