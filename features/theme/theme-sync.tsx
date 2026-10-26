"use client";

import { useLayoutEffect } from "react";

import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  systemDarkQuery,
} from "./theme";
import { useSystemPrefersDark, useThemePreference } from "./use-theme";

/**
 * Keeps <html> in step after load: OS changes while on "system", choices made
 * in another tab, and the dev Strict Mode remount, which clears the class the
 * head script set. Renders nothing.
 */
export function ThemeSync() {
  const preference = useThemePreference();
  const systemPrefersDark = useSystemPrefersDark();

  useLayoutEffect(() => {
    // Read the sources, not the hook values: during hydration those are the
    // server defaults, and applying them would flash light for one frame
    applyTheme(resolveTheme(readThemePreference(), systemDarkQuery().matches));
  }, [preference, systemPrefersDark]);

  return null;
}
