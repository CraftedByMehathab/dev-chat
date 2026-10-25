import { Chat } from "@/features/chat";
import SignIn from "@/features/signin";

export default function Home() {
  return (
    <div className="border-2">
      <SignIn />
      <Chat />
    </div>
  );
}
