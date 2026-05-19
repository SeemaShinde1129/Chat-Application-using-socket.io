"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import {
  LogOut,
  MessageSquare,
  Sparkles,
  UserRound,
  Users,
  Wifi,
} from "lucide-react";
import { disconnect, onMessage, requestUsers, connect, type SocketEvent } from "@/lib/socket";
import MessageInput from "@/components/chat/MessageInput";
import MessageList, { type ChatThreadMessage } from "@/components/chat/MessageList";
import UserList from "@/components/chat/UserList";

type ChatProps = {
  onLogout: () => void;
  username: string;
};

type ConnectionState = "connecting" | "connected" | "error";

type JoinPayload = {
  username: string;
};

type UsersPayload = {
  count: number;
  users: string[];
};

type TypingPayload = {
  from: string;
  isTyping: boolean;
  timestamp: number;
  to: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isChatMessage(payload: unknown): payload is ChatThreadMessage {
  return (
    isObject(payload) &&
    typeof payload.from === "string" &&
    typeof payload.to === "string" &&
    typeof payload.message === "string" &&
    typeof payload.timestamp === "number"
  );
}

function isUsersPayload(payload: unknown): payload is UsersPayload {
  return (
    isObject(payload) &&
    Array.isArray(payload.users) &&
    payload.users.every((user) => typeof user === "string") &&
    typeof payload.count === "number"
  );
}

function isJoinPayload(payload: unknown): payload is JoinPayload {
  return isObject(payload) && typeof payload.username === "string";
}

function isTypingPayload(payload: unknown): payload is TypingPayload {
  return (
    isObject(payload) &&
    typeof payload.from === "string" &&
    typeof payload.to === "string" &&
    typeof payload.isTyping === "boolean" &&
    typeof payload.timestamp === "number"
  );
}

function getErrorMessage(payload: unknown) {
  if (isObject(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return "Something went wrong. Try again in a moment.";
}

function Chat({ onLogout, username }: ChatProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, true>>({});
  const [users, setUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const otherUsers = useMemo(
    () => users.filter((activeUser) => activeUser !== username),
    [users, username],
  );
  const isSelectedUserTyping = selectedUser ? Boolean(typingUsers[selectedUser]) : false;

  const clearTypingTimeout = useEffectEvent((typingUser: string) => {
    const timeoutId = typingTimeoutsRef.current.get(typingUser);

    if (!timeoutId) {
      return;
    }

    clearTimeout(timeoutId);
    typingTimeoutsRef.current.delete(typingUser);
  });

  const removeTypingUser = useEffectEvent((typingUser: string) => {
    clearTypingTimeout(typingUser);
    setTypingUsers((currentTypingUsers) => {
      if (!currentTypingUsers[typingUser]) {
        return currentTypingUsers;
      }

      const nextTypingUsers = { ...currentTypingUsers };
      delete nextTypingUsers[typingUser];
      return nextTypingUsers;
    });
  });

  const markTypingUser = useEffectEvent((typingUser: string) => {
    clearTypingTimeout(typingUser);
    setTypingUsers((currentTypingUsers) => ({
      ...currentTypingUsers,
      [typingUser]: true,
    }));

    typingTimeoutsRef.current.set(
      typingUser,
      setTimeout(() => {
        removeTypingUser(typingUser);
      }, 3500),
    );
  });

  const clearAllTypingUsers = useEffectEvent(() => {
    for (const timeoutId of typingTimeoutsRef.current.values()) {
      clearTimeout(timeoutId);
    }

    typingTimeoutsRef.current.clear();
    setTypingUsers({});
  });

  const conversationMessages = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return messages.filter(
      (message) =>
        (message.from === username && message.to === selectedUser) ||
        (message.from === selectedUser && message.to === username),
    );
  }, [messages, selectedUser, username]);

  const handleSocketMessage = useEffectEvent((event: SocketEvent) => {
    switch (event.type) {
      case "join":
        if (isJoinPayload(event.payload) && event.payload.username === username) {
          setConnectionState("connected");
          setError("");
        }
        break;
      case "users":
        if (!isUsersPayload(event.payload)) {
          setError("We could not load the people online.");
          setConnectionState("error");
          break;
        }

        {
          const usersPayload = event.payload;
          const activeUsers = new Set(usersPayload.users);

          for (const typingUser of typingTimeoutsRef.current.keys()) {
            if (!activeUsers.has(typingUser)) {
              clearTypingTimeout(typingUser);
            }
          }

          setUsers(usersPayload.users);
          setTypingUsers((currentTypingUsers) => {
            return Object.fromEntries(
              Object.keys(currentTypingUsers)
                .filter((typingUser) => activeUsers.has(typingUser) && typingUser !== username)
                .map((typingUser) => [typingUser, true] as const),
            );
          });
          setSelectedUser((currentUser) => {
            if (
              currentUser &&
              usersPayload.users.includes(currentUser) &&
              currentUser !== username
            ) {
              return currentUser;
            }

            return usersPayload.users.find((activeUser: string) => activeUser !== username) ?? null;
          });
        }
        setConnectionState("connected");
        break;
      case "message":
        if (!isChatMessage(event.payload)) {
          setError("We could not read that message.");
          setConnectionState("error");
          break;
        }

        {
          const nextMessage = event.payload;
          setMessages((currentMessages) => [...currentMessages, nextMessage]);
          removeTypingUser(nextMessage.from);
        }
        setConnectionState("connected");
        setError("");
        break;
      case "typing":
        if (!isTypingPayload(event.payload) || event.payload.to !== username) {
          break;
        }

        if (event.payload.from === username) {
          break;
        }

        if (event.payload.isTyping) {
          markTypingUser(event.payload.from);
        } else {
          removeTypingUser(event.payload.from);
        }
        setConnectionState("connected");
        break;
      case "error":
        clearAllTypingUsers();
        setError(getErrorMessage(event.payload));
        setConnectionState("error");
        break;
      default:
        break;
    }
  });

  useEffect(() => {
    const unsubscribe = onMessage((event) => {
      handleSocketMessage(event);
    });

    const socket = connect(username);

    if (socket.readyState === WebSocket.OPEN) {
      requestUsers();
    }

    return () => {
      unsubscribe();
      clearAllTypingUsers();
      disconnect();
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversationMessages, isSelectedUserTyping]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf2_0%,_#edf6f1_100%)] px-4 py-5 text-stone-900 sm:px-5 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-[1520px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex flex-col rounded-[2rem] border border-stone-200/70 bg-white/92 p-5 shadow-[0_25px_70px_-42px_rgba(15,23,42,0.45)] sm:p-6">
          <div className="space-y-5 border-b border-stone-200 pb-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">
                You
              </p>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-[0_20px_35px_-25px_rgba(15,23,42,0.7)]">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold">@{username}</h1>
                  <p className="text-sm text-stone-500">Ready to chat</p>
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 rounded-[1.35rem] border px-4 py-3 text-sm ${
                connectionState === "connected"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : connectionState === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Wifi className="h-4 w-4" />
              {connectionState === "connected"
                ? "You are online"
                : connectionState === "error"
                  ? "We lost the connection"
                  : "Connecting..."}
            </div>

            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-stone-300 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-700 transition hover:border-stone-900 hover:text-stone-900"
              onClick={onLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Leave Chat
            </button>
          </div>

          <UserList
            currentUser={username}
            onSelectUser={(activeUser) => {
              setSelectedUser(activeUser);
              setError("");
            }}
            selectedUser={selectedUser}
            users={users}
          />
        </aside>

        <section className="relative flex min-h-[640px] flex-col overflow-hidden rounded-[2rem] border border-stone-200/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(250,247,241,0.96)_100%)] shadow-[0_25px_70px_-42px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.12),_transparent_34%)]" />

          <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-[1.35rem] shadow-[0_22px_35px_-24px_rgba(15,23,42,0.45)] ${
                  selectedUser
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-white text-stone-500"
                }`}
              >
                {selectedUser ? <UserRound className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </span>

              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">
                  <MessageSquare className="h-4 w-4" />
                  {selectedUser ? "Conversation" : "Messages"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
                  {selectedUser ? `@${selectedUser}` : "Pick someone and say hi"}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
                  {selectedUser
                    ? "Your conversation will show up here as messages come in."
                    : otherUsers.length > 0
                      ? `There ${otherUsers.length === 1 ? "is" : "are"} ${otherUsers.length} ${
                          otherUsers.length === 1 ? "person" : "people"
                        } online right now.`
                      : "No one else is here yet. When someone joins, you can start chatting."}
                </p>
                {selectedUser && isSelectedUserTyping ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
                    @{selectedUser} is typing...
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-medium sm:flex sm:items-center sm:gap-2 ${
                connectionState === "connected"
                  ? "bg-emerald-50 text-emerald-700"
                  : connectionState === "error"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              <Sparkles className="mr-2 inline h-4 w-4 sm:mr-0" />
              {connectionState === "connected"
                ? "Live"
                : connectionState === "error"
                  ? "Trying again"
                  : "Joining"}
            </div>
          </div>

          {error ? (
            <div className="relative border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 sm:px-6">
              {error}
            </div>
          ) : null}

          <div className="relative flex flex-1 flex-col overflow-hidden px-5 py-5 sm:px-6">
            <div className="flex-1 overflow-y-auto">
              {!selectedUser ? (
                <div className="flex h-full items-center justify-center py-6">
                  <div className="w-full max-w-lg rounded-[1.7rem] border border-stone-200/80 bg-white/82 px-6 py-8 text-center shadow-[0_24px_60px_-46px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:px-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-stone-900 text-white">
                      <Users className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-2xl font-semibold text-stone-900">
                      Choose a conversation
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-stone-500 sm:text-base">
                      Pick someone from the left and start the first message.
                    </p>

                    {otherUsers.length > 0 ? (
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {otherUsers.slice(0, 5).map((activeUser) => (
                          <button
                            key={activeUser}
                            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
                            onClick={() => {
                              setSelectedUser(activeUser);
                              setError("");
                            }}
                            type="button"
                          >
                            @{activeUser}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : conversationMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center py-6">
                  <div className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_30px_80px_-48px_rgba(15,23,42,0.38)] backdrop-blur-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-stone-900 text-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.8)]">
                      <UserRound className="h-7 w-7" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-stone-900">
                      Say hello to @{selectedUser}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-stone-500 sm:text-base">
                      Nothing here yet. Send the first message and this chat will come to life.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                      <Sparkles className="h-4 w-4" />
                      Ready when you are
                    </div>
                    {isSelectedUserTyping ? (
                      <div className="mt-6 flex justify-start text-left">
                        <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50/90 px-4 py-3 text-emerald-900 shadow-[0_20px_40px_-30px_rgba(16,185,129,0.35)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                            @{selectedUser}
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
                  </div>
                </div>
              ) : (
                <MessageList
                  bottomAnchorRef={messagesEndRef}
                  currentUser={username}
                  messages={conversationMessages}
                  typingUser={isSelectedUserTyping ? selectedUser : null}
                />
              )}
            </div>

            <MessageInput
              onError={(message) => {
                setError(message);
                if (!message) {
                  return;
                }

                setConnectionState("error");
              }}
              onMessageSent={() => {
                setConnectionState("connected");
              }}
              selectedUser={selectedUser}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default Chat;
