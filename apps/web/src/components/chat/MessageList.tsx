"use client";

import type { RefObject } from "react";

export type ChatThreadMessage = {
  from: string;
  message: string;
  timestamp: number;
  to: string;
};

type MessageListProps = {
  bottomAnchorRef?: RefObject<HTMLDivElement | null>;
  currentUser: string;
  messages: ChatThreadMessage[];
  typingUser?: string | null;
};

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function MessageList({ bottomAnchorRef, currentUser, messages, typingUser = null }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.from === currentUser;

        return (
          <div
            key={`${message.timestamp}-${index}`}
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.35)] sm:max-w-[70%] ${
                isCurrentUser
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-stone-50 text-stone-800"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                    isCurrentUser ? "text-stone-300" : "text-stone-400"
                  }`}
                >
                  {isCurrentUser ? "You" : `@${message.from}`}
                </p>
                <span className="text-xs text-stone-400">{formatTimestamp(message.timestamp)}</span>
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">
                {message.message}
              </p>
            </div>
          </div>
        );
      })}

      {typingUser ? (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-[1.4rem] border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-emerald-900 shadow-[0_20px_40px_-30px_rgba(16,185,129,0.35)] sm:max-w-[70%]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              @{typingUser}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot animation-delay-150" />
                <span className="typing-dot animation-delay-300" />
              </div>
              <span className="text-sm font-medium text-emerald-700">typing...</span>
            </div>
          </div>
        </div>
      ) : null}

      <div ref={bottomAnchorRef} />
    </div>
  );
}

export default MessageList;
