# Quick Talk Web App

This folder contains the Next.js frontend for the Quick Talk real-time chat application.

For the full project report, architecture, WebSocket explanation, backend details, and M.Tech project documentation, see the root [README.md](../../README.md).

## What This App Does

The web app provides:

- Login screen for choosing a chat username.
- Chat screen for viewing online users.
- One-to-one real-time messaging.
- Typing indicators.
- Connection and error states.
- Responsive UI built with Tailwind CSS.

## Main Files

```text
src/app/page.tsx                  -> Login route
src/app/chat/page.tsx             -> Chat route
src/components/auth/Login.tsx     -> Login UI
src/components/chat/Chat.tsx      -> Main chat state and layout
src/components/chat/UserList.tsx  -> Online users
src/components/chat/MessageList.tsx
src/components/chat/MessageInput.tsx
src/lib/socket.ts                 -> Browser WebSocket client
src/lib/storage.ts                -> sessionStorage username helper
```

## Development

Install dependencies from the repository root:

```bash
pnpm install
```

Run the default frontend:

```bash
pnpm --filter quick-talk dev
```

Open:

```text
http://localhost:3000
```

## Multiple Frontend Ports

The app can run on multiple ports for testing multiple users:

```bash
pnpm --dir apps/web dev:3000
pnpm --dir apps/web dev:3001
pnpm --dir apps/web dev:3002
pnpm --dir apps/web dev:3003
```

Each port uses a separate Next.js output directory such as `.next-3000` or `.next-3001`.

The frontend connects to the backend WebSocket server at:

```text
ws://localhost:5500/ws
```

Start the backend before testing real-time chat:

```bash
pnpm --filter quick-talk-backend dev
```
