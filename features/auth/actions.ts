"use server";

import { signOut } from "@/auth";
import { homePath } from "@/lib/paths";

export async function signOutAction() {
  await signOut({ redirectTo: homePath() });
}
