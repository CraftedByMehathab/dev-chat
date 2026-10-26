"use client";

import { MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { chatsPath } from "@/lib/paths";
import type { OwnedThreadSummary } from "@/lib/threads";

const lastActivityFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function ThreadListItems({
  threads,
}: {
  threads: OwnedThreadSummary[];
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {threads.map((thread) => {
        const href = chatsPath(thread.id);
        const isActive = pathname === href;
        const lastActivity =
          thread.lastMessageAt &&
          lastActivityFormat.format(thread.lastMessageAt);

        return (
          <SidebarMenuItem key={thread.id}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              // Collapsed to icons, the tooltip carries what the row can't show
              tooltip={
                lastActivity
                  ? `${thread.title} · ${lastActivity}`
                  : thread.title
              }
              className="h-auto"
            >
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                <MessageSquareIcon
                  className={
                    isActive ? "text-primary" : "text-muted-foreground"
                  }
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{thread.title}</span>
                  {thread.lastMessageAt && (
                    // Server and browser time zones can differ
                    <time
                      dateTime={thread.lastMessageAt.toISOString()}
                      className="text-xs font-normal text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {lastActivity}
                    </time>
                  )}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
