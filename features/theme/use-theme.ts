"use client";

import { useSyncExternalStore } from "react";

import {
  applyTheme,
  isThemeStorageEvent,
  readThemePreference,
  resolveTheme,
  systemDarkQuery,
  writeThemePreference,
  type ThemePreference,
} from "./theme";

// `storage` events only fire in other tabs, so same-tab writes notify these
const listeners = new Set<() => void>();

function subscribePreference(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (isThemeStorageEvent(event)) onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeSystem(onChange: () => void) {
  const query = systemDarkQuery();
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The user's choice. Reads "system" during SSR and hydration. */
export function useThemePreference() {
  return useSyncExternalStore(
    subscribePreference,
    readThemePreference,
    () => "system" as const,
  );
}

export function useSystemPrefersDark() {
  return useSyncExternalStore(
    subscribeSystem,
    () => systemDarkQuery().matches,
    () => false,
  );
}

export function setThemePreference(preference: ThemePreference) {
  writeThemePreference(preference);
  withoutTransitions(() =>
    applyTheme(resolveTheme(preference, systemDarkQuery().matches)),
  );
  listeners.forEach((listener) => listener());
}

/** Swap every colour at once instead of each element easing at its own speed. */
function withoutTransitions(update: () => void) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  update();
  // Force a style recalc so the new colours land before transitions return
  void getComputedStyle(document.body).color;
  requestAnimationFrame(() => style.remove());
}
