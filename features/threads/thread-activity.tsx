"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { OwnedThreadSummary } from "@/lib/threads";

/** A thread messaged here, or null once it's deleted. */
type ThreadActivity = Record<string, OwnedThreadSummary | null>;

type ThreadActivityContextValue = {
  activity: ThreadActivity;
  /** Records a message in this thread now, so the sidebar moves it to the top. */
  touchThread: (thread: Pick<OwnedThreadSummary, "id" | "title">) => void;
  /** Hides a deleted thread from the sidebar. */
  removeThread: (id: string) => void;
};

const ThreadActivityContext = createContext<ThreadActivityContextValue | null>(
  null,
);

/**
 * Threads messaged or deleted since the sidebar loaded. The sidebar merges
 * these over the server's list, so it updates without refetching the route.
 */
export function ThreadActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activity, setActivity] = useState<ThreadActivity>({});

  const touchThread = useCallback(
    ({ id, title }: Pick<OwnedThreadSummary, "id" | "title">) =>
      setActivity((prev) => ({
        ...prev,
        [id]: { id, title, lastMessageAt: new Date() },
      })),
    [],
  );

  const removeThread = useCallback(
    (id: string) => setActivity((prev) => ({ ...prev, [id]: null })),
    [],
  );

  return (
    <ThreadActivityContext value={{ activity, touchThread, removeThread }}>
      {children}
    </ThreadActivityContext>
  );
}

export function useThreadActivity() {
  const context = useContext(ThreadActivityContext);
  if (!context) {
    throw new Error(
      "useThreadActivity must be used inside ThreadActivityProvider",
    );
  }
  return context;
}

/** A thread's current title: the one from the page, or a newer one set here. */
export function useThreadTitle(id: string, title: string) {
  const { activity } = useThreadActivity();
  return activity[id]?.title ?? title;
}

/** A thread's title, updated live when its first message names it. */
export function ThreadTitle({ id, title }: { id: string; title: string }) {
  return useThreadTitle(id, title);
}

/** The server's threads with local activity applied, newest activity first. */
export function mergeThreadActivity(
  threads: OwnedThreadSummary[],
  activity: ThreadActivity,
): OwnedThreadSummary[] {
  const local = Object.values(activity);
  if (local.length === 0) return threads;

  const untouched = threads.filter((thread) => !(thread.id in activity));
  const touched = local.filter((thread) => thread !== null);
  return [...touched, ...untouched].sort(
    (a, b) =>
      (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
  );
}
