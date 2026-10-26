import { SidebarTrigger } from "@/components/ui/sidebar";

/** Top bar of a signed-in page: the sidebar toggle and the page's title. */
export function PageHeader({ title }: { title?: React.ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <SidebarTrigger />
      {title && <h1 className="truncate text-sm font-medium">{title}</h1>}
    </header>
  );
}
