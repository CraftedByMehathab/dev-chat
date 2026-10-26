"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { OwnedThreadSummary } from "@/lib/threads";

type ThreadActivity = Record<string, OwnedThreadSummary>;

type ThreadActivityContextValue = {
  activity: ThreadActivity;
  /** Records a message in this thread now, so the sidebar moves it to the top. */
  touchThread: (thread: Pick<OwnedThreadSummary, "id" | "title">) => void;
};

const ThreadActivityContext = createContext<ThreadActivityContextValue | null>(
  null,
);

/**
 * Threads messaged since the sidebar loaded. The sidebar merges these over the
 * server's list, so a reply updates it without refetching the route.
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

  return (
    <ThreadActivityContext value={{ activity, touchThread }}>
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

/** The server's threads with local activity applied, newest activity first. */
export function mergeThreadActivity(
  threads: OwnedThreadSummary[],
  activity: ThreadActivity,
): OwnedThreadSummary[] {
  const touched = Object.values(activity);
  if (touched.length === 0) return threads;

  const untouched = threads.filter((thread) => !activity[thread.id]);
  return [...touched, ...untouched].sort(
    (a, b) =>
      (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
  );
}
