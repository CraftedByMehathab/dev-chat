"use server";

import { signIn, signOut } from "@/auth";
import { dashboardPath, homePath } from "@/lib/paths";

/**
 * Reads callbackUrl from the form rather than a closure, so the button can sit
 * in the prerendered shell (closure arguments are encrypted with a random IV).
 * Auth.js's default redirect callback only allows same-origin URLs.
 */
export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
  await signIn("github", {
    redirectTo:
      typeof callbackUrl === "string" && callbackUrl
        ? callbackUrl
        : dashboardPath(),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: homePath() });
}
