import { getSessionUser } from "@/lib/session";

import { UserMenuButton } from "./user-menu-button";

/** Sidebar footer profile menu. Reads the session, so render it inside Suspense. */
export async function UserMenu() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <UserMenuButton name={user.name} email={user.email} image={user.image} />
  );
}
