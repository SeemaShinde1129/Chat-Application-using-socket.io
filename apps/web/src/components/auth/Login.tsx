"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageSquare, Sparkles, User, UserPlus } from "lucide-react";
import { GenericInput } from "@/components/ui/GenericInput";
import {
  getStoredUsername,
  getStoredUsernameServerSnapshot,
  setStoredUsername,
  subscribeToStoredUsername,
} from "@/lib/storage";

function Login() {
  const router = useRouter();
  const storedUsername = useSyncExternalStore(
    subscribeToStoredUsername,
    getStoredUsername,
    getStoredUsernameServerSnapshot,
  );
  const [draftUsername, setDraftUsername] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const username = draftUsername ?? storedUsername ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter your name.");
      return;
    }

    setStoredUsername(trimmedUsername);
    setError("");

    startTransition(() => {
      router.push("/chat");
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,214,170,0.9),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(132,230,186,0.42),_transparent_38%),linear-gradient(160deg,_#fffaf2_0%,_#f8f1e8_48%,_#edf6f1_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1460px] flex-col justify-center px-4 py-6 sm:px-5 lg:grid lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 lg:px-6 xl:px-8">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 p-7 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-10 lg:mb-0">
          <div className="absolute -left-14 top-8 h-28 w-28 rounded-full bg-amber-200/60 blur-2xl" />
          <div className="absolute bottom-8 right-0 h-36 w-36 rounded-full bg-emerald-200/50 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-stone-50">
                <MessageSquare className="h-3.5 w-3.5" />
                Quick Talk
              </span>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                  A simple place to say hello.
                </h1>
                <p className="max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
                  Pick a name, step in, and start talking right away. No signup. No friction. Just
                  a clean little chat space.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  <UserPlus className="h-4 w-4" />
                  Jump In
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Choose a name and join in. No account setup, no waiting around.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  <MessageSquare className="h-4 w-4" />
                  Talk Live
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  See people come online, send a message, and get replies in real time.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                  <Sparkles className="h-4 w-4" />
                  Keep It Easy
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Everything stays light, clear, and easy to use on any screen.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="relative rounded-[2rem] border border-stone-200/70 bg-white/88 p-6 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400" />

          <div className="space-y-8">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-stone-400">
                <Sparkles className="h-4 w-4" />
                Welcome
              </p>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-stone-900">Pick your chat name</h2>
                <p className="text-sm leading-6 text-stone-500">
                  Use any name you like. That is how people will see you in the chat.
                </p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <GenericInput
                autoComplete="nickname"
                error={error}
                helperText="This is the name other people will see."
                label="Your Name"
                leftAdornment={<User />}
                maxLength={24}
                name="username"
                onChange={(event) => {
                  setDraftUsername(event.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder="seema"
                value={username}
              />

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-stone-900 px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white shadow-[0_22px_40px_-28px_rgba(15,23,42,0.8)] transition duration-200 hover:-translate-y-0.5 hover:bg-stone-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-400"
                disabled={isPending}
                type="submit"
              >
                <ArrowRight className="h-4 w-4" />
                {isPending ? "Joining..." : "Start Chatting"}
              </button>
            </form>

            <div className="rounded-[1.35rem] border border-stone-200 bg-stone-50/90 p-4 text-sm leading-6 text-stone-500">
              <div className="mb-2 flex items-center gap-2 font-semibold text-stone-700">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Quick Flow
              </div>
              <span className="block text-stone-700">
                Pick a name, enter the room, and start talking.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
