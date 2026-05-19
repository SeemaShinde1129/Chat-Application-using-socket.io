"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import Chat from "@/components/chat/Chat";
import {
  clearStoredUsername,
  getStoredUsername,
  getStoredUsernameServerSnapshot,
  subscribeToStoredUsername,
} from "@/lib/storage";

function ChatPage() {
  const router = useRouter();
  const username = useSyncExternalStore(
    subscribeToStoredUsername,
    getStoredUsername,
    getStoredUsernameServerSnapshot,
  );

  useEffect(() => {
    if (username === "") {
      router.replace("/");
    }
  }, [router, username]);

  if (username === null || username === "") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fffaf2_0%,_#edf6f1_100%)] px-6">
        <div className="flex items-center gap-3 rounded-[1.6rem] border border-stone-200 bg-white/90 px-6 py-5 text-sm font-medium text-stone-500 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)]">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Preparing your chat space...
        </div>
      </main>
    );
  }

  return (
    <Chat
      onLogout={() => {
        clearStoredUsername();
        router.push("/");
      }}
      username={username}
    />
  );
}

export default ChatPage;
