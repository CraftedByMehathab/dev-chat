"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { THEME_PREFERENCES, type ThemePreference } from "./theme";
import { setThemePreference, useThemePreference } from "./use-theme";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] satisfies { value: ThemePreference; label: string; icon: typeof SunIcon }[];

const isThemePreference = (value: string): value is ThemePreference =>
  (THEME_PREFERENCES as readonly string[]).includes(value);

function ThemeRadioItems() {
  const preference = useThemePreference();

  return (
    <DropdownMenuRadioGroup
      value={preference}
      onValueChange={(value) => {
        if (isThemePreference(value)) setThemePreference(value);
      }}
    >
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <DropdownMenuRadioItem key={value} value={value}>
          <Icon />
          {label}
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

/** Sun in light mode, moon in dark. CSS picks, so it matches before hydration. */
function ThemeIcon() {
  return (
    <>
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </>
  );
}

/** "Theme" submenu for an existing dropdown, such as the profile menu. */
export function ThemeSubMenu() {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ThemeIcon />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-40">
        <ThemeRadioItems />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

/** Standalone icon button, for pages without the profile menu. */
export function ThemeToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <ThemeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <ThemeRadioItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
