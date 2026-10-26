"use client";

import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { signOutAction } from "./actions";

type UserMenuButtonProps = {
  name: string | null;
  email: string | null;
  image: string | null;
};

/** "Mehathab" → "ME"; falls back to the email, then "?". */
const initials = (label: string) => label.slice(0, 2).toUpperCase() || "?";

export function UserMenuButton({ name, email, image }: UserMenuButtonProps) {
  const { isMobile } = useSidebar();
  const [isSigningOut, startSignOut] = useTransition();
  const label = name ?? email ?? "Account";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={label}
              aria-label="Account menu"
            >
              <Avatar className="size-8">
                {image && <AvatarImage src={image} alt="" />}
                <AvatarFallback className="text-xs font-semibold text-primary">
                  {initials(label)}
                </AvatarFallback>
              </Avatar>
              <span className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate font-medium">{label}</span>
                {email && email !== label && (
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                )}
              </span>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : "right"}
            align="end"
            className="w-56"
          >
            <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onSelect={() => startSignOut(() => signOutAction())}
            >
              <LogOutIcon />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
