import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThreadSidebar } from "@/features/threads/thread-sidebar";

/** Signed-in pages: the thread sidebar plus the page on the right. Each page renders its own PageHeader. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <ThreadSidebar />
      <SidebarInset className="h-svh overflow-hidden">{children}</SidebarInset>
    </SidebarProvider>
  );
}
