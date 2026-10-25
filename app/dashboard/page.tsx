import { SignOut } from "@/features/auth/signout";
import { Chat } from "@/features/chat";

export default function Dashboard() {
  return (
    <>
      <SignOut />
      <Chat />
    </>
  );
}
