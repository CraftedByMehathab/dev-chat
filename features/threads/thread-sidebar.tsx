import Image from "next/image";
import { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOut } from "@/features/auth/signout";
import { NewChatButton } from "@/features/chat";

import { CloseSidebarOnNavigate } from "./close-sidebar-on-navigate";
import { ThreadList } from "./thread-list";

// Collapses to an icon rail on desktop and a sheet on mobile
export function ThreadSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Reads the URL, which is request data on dynamic routes */}
      <Suspense fallback={null}>
        <CloseSidebarOnNavigate />
      </Suspense>
      <SidebarHeader className="gap-4 py-4">
        <div className="flex h-8 items-center gap-2 px-2 group-data-[collapsible=icon]:px-0">
          <Image
            src="/favicon.png"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0"
          />
          <span className="truncate font-heading text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Dev Chat
          </span>
        </div>
        <NewChatButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* The list reads the session, so it streams in behind a boundary */}
            <Suspense fallback={<ThreadListSkeleton />}>
              <ThreadList />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter>
        <SignOut />
      </SidebarFooter>
    </Sidebar>
  );
}

// Fixed widths: SidebarMenuSkeleton's Math.random() can't be prerendered
const SKELETON_WIDTHS = ["w-3/4", "w-2/3", "w-4/5"];

function ThreadListSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2 group-data-[collapsible=icon]:hidden">
      {SKELETON_WIDTHS.map((width) => (
        <Skeleton key={width} className={`h-10 ${width}`} />
      ))}
    </div>
  );
}
