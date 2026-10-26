import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Chat } from "@/features/chat";
import { PageHeader } from "@/features/threads/page-header";
import { getSessionUserId } from "@/lib/session";
import { findOwnedThread } from "@/lib/threads";

export default function ChatPage({ params }: PageProps<"/chat/[threadId]">) {
  return (
    // params and the session are request data, so they stream in behind a boundary
    <Suspense fallback={<PageHeader />}>
      <OwnedChat params={params} />
    </Suspense>
  );
}

async function OwnedChat({
  params,
}: Pick<PageProps<"/chat/[threadId]">, "params">) {
  const { threadId } = await params;
  const userId = await getSessionUserId();

  // Unknown and other users' threads look the same: not found
  const thread = userId && (await findOwnedThread(threadId, userId));
  if (!thread) notFound();

  return (
    <>
      <PageHeader title={thread.title} />
      <div className="min-h-0 flex-1">
        {/* key: switching threads starts a fresh Chat instead of reusing state */}
        <Chat key={threadId} threadId={threadId} />
      </div>
    </>
  );
}
