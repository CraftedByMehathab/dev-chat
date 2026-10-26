import { LogOutIcon } from "lucide-react";
import { signOut } from "@/auth";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { homePath } from "@/lib/paths";

/** Sidebar footer item; shrinks to an icon with the sidebar. */
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({
          redirectTo: homePath(),
        });
      }}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            type="submit"
            tooltip="Sign out"
            className="hover:text-destructive"
          >
            <LogOutIcon />
            <span>Sign out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </form>
  );
}
