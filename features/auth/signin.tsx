import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { dashboardPath } from "@/lib/paths";
import { FaGithub } from "react-icons/fa";

type SignInProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignIn({ searchParams }: SignInProps) {
  const { callbackUrl } = await searchParams;
  // Auth.js's default redirect callback only allows same-origin URLs
  const redirectTo =
    typeof callbackUrl === "string" ? callbackUrl : dashboardPath();

  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo });
      }}
    >
      <Button type="submit">
        <FaGithub />
        Signin with GitHub
      </Button>
    </form>
  );
}
