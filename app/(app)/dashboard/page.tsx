import { PageHeader } from "@/features/threads/page-header";

export default function Dashboard() {
  return (
    <>
      <PageHeader />
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-center text-muted-foreground">
        Pick a chat from the sidebar, or start a new one.
      </div>
    </>
  );
}
