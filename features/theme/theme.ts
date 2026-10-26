export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, "system">;

// No stored value means "system", so a new visitor follows the OS
const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs in <head> before first paint, so a stored or OS-dark theme never
 * flashes light. Keep it in step with `resolveTheme` and `applyTheme`.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Storage can be blocked (privacy settings); fall back to the OS
    return "system";
  }
}

export function writeThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Still applies for this page view, just isn't remembered
  }
}

/** True when `event` is a cross-tab change to the stored theme. */
export const isThemeStorageEvent = (event: StorageEvent) =>
  event.key === STORAGE_KEY || event.key === null;

export const systemDarkQuery = () => window.matchMedia(DARK_QUERY);

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference !== "system") return preference;
  return systemPrefersDark ? "dark" : "light";
}

export function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  // Native controls and scrollbars follow the theme too
  root.style.colorScheme = theme;
}
