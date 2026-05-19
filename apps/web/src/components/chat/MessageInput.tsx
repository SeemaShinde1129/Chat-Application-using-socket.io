"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquareText, SendHorizontal, Sparkles } from "lucide-react";
import { sendMessage, sendTyping } from "@/lib/socket";

type MessageInputProps = {
  onError: (message: string) => void;
  onMessageSent?: () => void;
  selectedUser: string | null;
};

function MessageInput({ onError, onMessageSent, selectedUser }: MessageInputProps) {
  const [draftMessage, setDraftMessage] = useState("");
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTypingTargetRef = useRef<string | null>(null);
  const isDisabled = !selectedUser;

  function clearStopTypingTimeout() {
    if (stopTypingTimeoutRef.current === null) {
      return;
    }

    clearTimeout(stopTypingTimeoutRef.current);
    stopTypingTimeoutRef.current = null;
  }

  function emitTypingStatus(targetUser: string, isTyping: boolean) {
    try {
      sendTyping({
        isTyping,
        to: targetUser,
      });
      activeTypingTargetRef.current = isTyping ? targetUser : null;
    } catch {
      if (!isTyping) {
        activeTypingTargetRef.current = null;
      }
    }
  }

  function stopTyping(targetUser = activeTypingTargetRef.current) {
    clearStopTypingTimeout();

    if (!targetUser) {
      return;
    }

    emitTypingStatus(targetUser, false);
  }

  function scheduleStopTyping(targetUser: string) {
    clearStopTypingTimeout();
    stopTypingTimeoutRef.current = setTimeout(() => {
      stopTyping(targetUser);
    }, 1200);
  }

  useEffect(() => {
    const activeTypingTarget = activeTypingTargetRef.current;

    if (!activeTypingTarget || activeTypingTarget === selectedUser) {
      return;
    }

    if (stopTypingTimeoutRef.current !== null) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }

    try {
      sendTyping({
        isTyping: false,
        to: activeTypingTarget,
      });
    } catch {
      // Ignore typing cleanup failures while switching conversations.
    }

    activeTypingTargetRef.current = null;
  }, [selectedUser]);

  useEffect(() => {
    return () => {
      if (stopTypingTimeoutRef.current !== null) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }

      const activeTypingTarget = activeTypingTargetRef.current;

      if (!activeTypingTarget) {
        return;
      }

      try {
        sendTyping({
          isTyping: false,
          to: activeTypingTarget,
        });
      } catch {
        // Ignore typing cleanup failures while tearing down the input.
      }

      activeTypingTargetRef.current = null;
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();

    if (!selectedUser) {
      onError("Pick someone first.");
      return;
    }

    if (!trimmedMessage) {
      onError("Write something first.");
      return;
    }

    try {
      stopTyping(selectedUser);
      sendMessage({
        message: trimmedMessage,
        to: selectedUser,
      });
      setDraftMessage("");
      onError("");
      onMessageSent?.();
    } catch {
      onError("You are offline right now.");
    }
  }

  return (
    <form className="mt-5 border-t border-stone-200 pt-5" onSubmit={handleSubmit}>
      <div className="rounded-[1.65rem] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(249,246,239,0.96)_100%)] p-3 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.32)] sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
              <MessageSquareText className="h-4 w-4" />
              Say Something
            </p>
            <p className="mt-1.5 text-sm text-stone-500">
              {selectedUser
                ? `This message will go to @${selectedUser}.`
                : "Choose someone on the left to start chatting."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedUser ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
              }`}
            >
              {selectedUser ? `To @${selectedUser}` : "No one selected"}
            </span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
              Press Enter
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Type your message</span>
            <input
              className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-stone-50 px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100"
              disabled={isDisabled}
              onChange={(event) => {
                const nextDraftMessage = event.target.value;

                setDraftMessage(nextDraftMessage);
                onError("");

                if (!selectedUser) {
                  return;
                }

                const trimmedDraftMessage = nextDraftMessage.trim();
                const activeTypingTarget = activeTypingTargetRef.current;

                if (!trimmedDraftMessage) {
                  if (activeTypingTarget === selectedUser) {
                    stopTyping(selectedUser);
                  }
                  return;
                }

                if (activeTypingTarget && activeTypingTarget !== selectedUser) {
                  stopTyping(activeTypingTarget);
                }

                emitTypingStatus(selectedUser, true);
                scheduleStopTyping(selectedUser);
              }}
              onBlur={() => {
                if (selectedUser && activeTypingTargetRef.current === selectedUser) {
                  stopTyping(selectedUser);
                }
              }}
              placeholder={
                selectedUser ? `Write to @${selectedUser}` : "Pick someone to start"
              }
              type="text"
              value={draftMessage}
            />
          </label>

          <button
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[1.2rem] bg-stone-900 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.72)] transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-300 sm:min-w-[140px]"
            disabled={isDisabled}
            type="submit"
          >
            <SendHorizontal className="h-4 w-4" />
            Send
          </button>
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
          <Sparkles className="h-4 w-4 text-amber-500" />
          {selectedUser
            ? "Your message will go out right away over the live connection."
            : "This box wakes up as soon as you pick someone."}
        </p>
      </div>
    </form>
  );
}

export default MessageInput;
