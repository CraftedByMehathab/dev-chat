// Creates a new chat thread owned by the signed-in user.
import { auth } from "@/auth";
import { jsonError } from "@/lib/http";
import { langgraphClient } from "@/lib/langgraph";

import { prisma } from "@/prisma";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

export async function POST() {
  // ── 1. Authentication ─────────────────────────────
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return jsonError("Unauthorized", 401);

  // ── 2. Create the thread in LangGraph ─────────────
  let langgraphThreadId: string;
  try {
    const langgraphThread = await langgraphClient.threads.create({
      metadata: { userId },
    });
    langgraphThreadId = langgraphThread.thread_id;
  } catch (err) {
    console.error("threads: LangGraph create failed", err);
    return jsonError("Could not create thread", 502);
  }

  // ── 3. Save ownership in our database ─────────────
  try {
    const thread = await prisma.chatThread.create({
      data: { id: langgraphThreadId, userId },
      select: { id: true },
    });
    return Response.json({ threadId: thread.id }, { status: 201 });
  } catch (err) {
    console.error("threads: database create failed", err);

    // Clean up so LangGraph doesn't keep a thread nobody owns
    await langgraphClient.threads
      .delete(langgraphThreadId)
      .catch((cleanupErr) => {
        console.error("threads: LangGraph cleanup failed", cleanupErr);
      });

    return jsonError("Could not create thread", 500);
  }
}
