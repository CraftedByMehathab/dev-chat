import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { homePath } from "@/lib/paths";

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
      <Button variant="destructive" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
