"use client";

import { UserRound, Users } from "lucide-react";

type UserListProps = {
  currentUser: string;
  onSelectUser: (username: string) => void;
  selectedUser: string | null;
  users: string[];
};

function UserList({ currentUser, onSelectUser, selectedUser, users }: UserListProps) {
  const onlineUsers = users.filter((activeUser) => activeUser !== currentUser);

  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-stone-400">
          <Users className="h-4 w-4" />
          People Online
        </p>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
          {onlineUsers.length}
        </span>
      </div>

      <div className="flex min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {onlineUsers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
            <Users className="mb-3 h-8 w-8 text-stone-300" />
            No one else is here yet.
          </div>
        ) : (
          onlineUsers.map((activeUser) => {
            const isSelected = activeUser === selectedUser;

            return (
              <button
                key={activeUser}
                className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                  isSelected
                    ? "border-stone-900 bg-stone-900 text-white shadow-[0_22px_35px_-28px_rgba(15,23,42,0.85)]"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-900 hover:bg-white"
                }`}
                onClick={() => {
                  onSelectUser(activeUser);
                }}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isSelected ? "bg-white/15 text-white" : "bg-white text-stone-600"
                    }`}
                  >
                    <UserRound className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold">@{activeUser}</p>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isSelected ? "bg-emerald-300" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <p className={`mt-1 text-sm ${isSelected ? "text-stone-200" : "text-stone-500"}`}>
                      {isSelected ? "You are chatting here" : "Tap to start talking"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UserList;
