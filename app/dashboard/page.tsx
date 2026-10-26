import { SignOut } from "@/features/auth/signout";
import { NewChatButton } from "@/features/chat";

export default function Dashboard() {
  return (
    <>
      <SignOut />
      <NewChatButton />
    </>
  );
}
