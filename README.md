# Quick Talk - Real-Time Chat Application

Quick Talk is a real-time one-to-one chat application developed as an M.Tech Computer Science project. The project demonstrates how a modern web frontend and a WebSocket backend can work together to provide live messaging, online-user tracking, typing indicators, and instant message delivery without refreshing the browser.

The application is built as a monorepo. The frontend is a Next.js application, the backend is a Fastify server, and the real-time communication layer uses WebSocket through `@fastify/websocket` on the server and the browser `WebSocket` API on the client.

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Completed Features](#completed-features)
- [Technology Stack](#technology-stack)
- [Tools and Technologies](#tools-and-technologies)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [WebSocket Architecture](#websocket-architecture)
- [Multiple Port Setup](#multiple-port-setup)
- [Application Flow](#application-flow)
- [API and WebSocket Contract](#api-and-websocket-contract)
- [How the Project Was Made](#how-the-project-was-made)
- [How the Project Is Completed](#how-the-project-is-completed)
- [How to Run the Project](#how-to-run-the-project)
- [Testing the Real-Time Chat](#testing-the-real-time-chat)
- [Current Limitations](#current-limitations)
- [Future Scope](#future-scope)
- [Academic Learning Outcomes](#academic-learning-outcomes)
- [Conclusion](#conclusion)

## Project Overview

Quick Talk is a lightweight real-time chat system where users can:

- Enter the application using a display name.
- Join a live chat room without a separate signup process.
- View people currently online.
- Select another online user.
- Send direct messages in real time.
- See typing indicators when another user is typing.
- Leave the chat and disconnect from the live session.

The purpose of the project is to show the practical working of full-stack real-time communication. Traditional HTTP requests are useful when the client asks for data and the server responds once. A chat application needs continuous communication. For that reason, this project uses WebSocket, where a persistent connection stays open between the browser and the backend server.

This project is not only a user interface project. It includes the full communication pipeline:

```text
Browser UI
  -> WebSocket client
  -> Fastify WebSocket endpoint
  -> Message validation
  -> User manager
  -> Receiver socket lookup
  -> Real-time response back to browser
```

## Problem Statement

In many communication systems, users expect messages to appear immediately. If a chat application depends only on normal HTTP polling, the client must repeatedly ask the server for new messages. This creates unnecessary network calls, delay, and poor user experience.

The problem solved by this project is:

> To design and implement a real-time chat application where multiple users can connect at the same time, see active users, exchange direct messages, and receive typing updates using a persistent WebSocket connection.

## Objectives

The main objectives of this project are:

- Build a responsive web interface for real-time chat.
- Use a backend server to manage WebSocket connections.
- Maintain an active online-user list.
- Prevent duplicate usernames during an active session.
- Send one-to-one messages from one user to another user.
- Echo sent messages back to the sender so both sides have the same conversation view.
- Show typing status while a user is writing a message.
- Cleanly remove users from the online list when they disconnect.
- Organize the project using a monorepo structure.
- Provide separate frontend and backend applications that run on different ports.

## Completed Features

The current implementation includes the following completed features:

| Feature                  | Status    | Description                                                                      |
| ------------------------ | --------- | -------------------------------------------------------------------------------- |
| Login screen             | Completed | User enters a display name before entering chat.                                 |
| Session username storage | Completed | Username is stored in browser `sessionStorage`.                                  |
| Chat screen              | Completed | Main chat layout with user list, selected conversation, message area, and input. |
| Online users             | Completed | Backend keeps online users in memory and broadcasts updates.                     |
| WebSocket connection     | Completed | Frontend connects to backend using `ws://localhost:5500/ws`.                     |
| Join event               | Completed | User is registered after sending a `join` event.                                 |
| Direct message event     | Completed | Message is sent to the selected receiver in real time.                           |
| Sender message echo      | Completed | Sender also receives the sent message for local display consistency.             |
| Typing indicator         | Completed | Typing status is sent to the receiver and cleared automatically.                 |
| Disconnect handling      | Completed | User is removed from active list when socket closes.                             |
| Health endpoint          | Completed | Backend exposes `/chat/health`.                                                  |
| User-list endpoint       | Completed | Backend exposes `/chat/users`.                                                   |
| Multiple frontend ports  | Completed | Web app can run on ports `3000`, `3001`, `3002`, and `3003`.                     |

## Technology Stack

### Frontend

| Technology             | Use                                                                     |
| ---------------------- | ----------------------------------------------------------------------- |
| Next.js 16             | React framework used for routing, rendering, and application structure. |
| React 19               | Component-based UI development.                                         |
| TypeScript             | Type-safe frontend code.                                                |
| Tailwind CSS 4         | Utility-first styling for responsive design.                            |
| Lucide React           | Icon library used in buttons, status labels, and UI elements.           |
| Browser WebSocket API  | Client-side real-time communication with backend.                       |
| Browser sessionStorage | Stores the current username for the browser session.                    |

### Backend

| Technology           | Use                                                   |
| -------------------- | ----------------------------------------------------- |
| Node.js              | JavaScript runtime for the backend server.            |
| Fastify              | HTTP server framework.                                |
| `@fastify/websocket` | WebSocket support for Fastify.                        |
| TypeScript           | Type-safe backend code.                               |
| `tsx`                | Runs TypeScript backend directly in development mode. |

### Monorepo and Development

| Technology                | Use                                                   |
| ------------------------- | ----------------------------------------------------- |
| pnpm                      | Workspace package manager.                            |
| Turborepo                 | Runs and coordinates tasks across apps and packages.  |
| ESLint                    | Code quality and linting.                             |
| Prettier                  | Formatting command for TypeScript, TSX, and Markdown. |
| Shared TypeScript configs | Reusable TypeScript configuration packages.           |

## Tools and Technologies

This section explains the tools in more practical detail.

### Next.js

Next.js is used for the web application located in `apps/web`. It provides:

- File-based routing through the `src/app` directory.
- A home route at `/`.
- A chat route at `/chat`.
- Built-in development server support.
- Build output management through `.next` directories.

The project uses the App Router structure:

```text
apps/web/src/app/page.tsx       -> Login page
apps/web/src/app/chat/page.tsx  -> Chat page
apps/web/src/app/layout.tsx     -> Root layout and metadata
```

### React

React is used to build the UI as reusable components. The main components are:

- `Login` - username entry page.
- `Chat` - main chat container and state manager.
- `UserList` - displays online users.
- `MessageList` - displays conversation messages.
- `MessageInput` - sends messages and typing events.
- `GenericInput` - reusable input component.

### TypeScript

TypeScript is used in both frontend and backend. It helps define clear data structures for:

- WebSocket events.
- Chat messages.
- Typing payloads.
- Online users.
- Component props.
- Backend service inputs and results.

### Fastify

Fastify is used for the backend server because it is fast, lightweight, and plugin-friendly. In this project, Fastify handles:

- HTTP routes under `/chat`.
- WebSocket endpoint at `/ws`.
- CORS headers for local frontend access.
- Server logging.

### WebSocket

WebSocket is the most important real-time technology in this project. Unlike HTTP, WebSocket keeps the connection open. After connection, both browser and server can send data at any time.

This project uses raw WebSocket JSON messages. It does not use Socket.IO in the current implementation.

### Turborepo

Turborepo manages the monorepo. The root `package.json` contains commands such as:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

When `pnpm dev` is run from the root, Turborepo runs the development scripts of the applications in the workspace.

### pnpm Workspaces

The workspace is configured in `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

This means applications are stored under `apps` and shared packages are stored under `packages`.

## System Architecture

The system uses a client-server architecture.

```text
+-------------------------+        WebSocket        +-------------------------+
|                         | <---------------------> |                         |
| Next.js Web Frontend    |                         | Fastify Backend API     |
| apps/web                |                         | apps/api                |
|                         |                         |                         |
+-------------------------+                         +-------------------------+
          |                                                       |
          | Browser sessionStorage                                | In-memory Map
          | stores username                                       | stores active users
          v                                                       v
+-------------------------+                         +-------------------------+
| Username Session        |                         | User Manager            |
| quick-talk:username     |                         | Map<username, socket>   |
+-------------------------+                         +-------------------------+
```

### High-Level Data Flow

```text
1. User opens frontend.
2. User enters a username.
3. Username is saved in sessionStorage.
4. User is redirected to /chat.
5. Frontend opens WebSocket connection to backend.
6. Frontend sends join event.
7. Backend validates username and stores username with socket.
8. Backend broadcasts updated user list.
9. User selects another online user.
10. User sends message.
11. Backend validates sender, receiver, and message.
12. Backend sends message to receiver.
13. Backend echoes message to sender.
14. UI updates instantly on both sides.
```

## Repository Structure

```text
chat-application-mono-repo/
  apps/
    api/
      server.ts
      package.json
      src/
        app.ts
        routes/
          chat.routes.ts
        modules/
          chat/
            chat.controller.ts
            chat.model.ts
            chat.service.ts
        utils/
          logger.ts
          userManager.ts
        websocket/
          socket.ts
    web/
      package.json
      next.config.ts
      scripts/
        dev.mjs
      src/
        app/
          page.tsx
          chat/page.tsx
          layout.tsx
          globals.css
        components/
          auth/Login.tsx
          chat/Chat.tsx
          chat/MessageInput.tsx
          chat/MessageList.tsx
          chat/UserList.tsx
          ui/GenericInput.tsx
        lib/
          socket.ts
          storage.ts
  packages/
    eslint-config/
    typescript-config/
    ui/
  package.json
  pnpm-workspace.yaml
  turbo.json
```

## Frontend Architecture

The frontend is located in `apps/web`.

### Page Structure

| Route   | File                             | Purpose                                              |
| ------- | -------------------------------- | ---------------------------------------------------- |
| `/`     | `apps/web/src/app/page.tsx`      | Displays login screen.                               |
| `/chat` | `apps/web/src/app/chat/page.tsx` | Displays chat interface after username is available. |

### Login Flow

The login page is implemented in `apps/web/src/components/auth/Login.tsx`.

It performs these actions:

- Reads current username from `sessionStorage`.
- Lets the user type a username.
- Validates that the username is not empty.
- Saves the username using `setStoredUsername`.
- Navigates to `/chat`.

The username is not stored in a database. It exists only for the current browser session.

### Storage Layer

The storage helper is located at:

```text
apps/web/src/lib/storage.ts
```

It uses:

```text
quick-talk:username
```

as the browser `sessionStorage` key.

It also dispatches a custom browser event:

```text
quick-talk:username-change
```

This helps React components update when the username changes.

### Chat Page Protection

The `/chat` page checks whether a username exists. If no username is found, it redirects the user back to `/`.

This prevents users from entering the chat page directly without choosing a name.

### Chat State Management

The `Chat` component manages:

- Connection state: `connecting`, `connected`, or `error`.
- Error messages.
- Online users.
- Selected receiver.
- Message history in the current browser session.
- Typing indicators.
- Auto-scroll to latest message.

### Message Input

The `MessageInput` component sends two types of events:

- `message` when the user sends a message.
- `typing` while the user is typing.

Typing status is automatically stopped:

- After a short timeout.
- When the input loses focus.
- When the user switches conversation.
- When the component unmounts.

### UI Design

The UI is designed as a responsive chat interface:

- Sidebar for current user and online users.
- Main panel for selected conversation.
- Message bubbles for sent and received messages.
- Status badges for connection state.
- Typing animation for active typing status.
- Mobile-friendly layout using Tailwind CSS classes.

## Backend Architecture

The backend is located in `apps/api`.

### Server Entry Point

The backend starts from:

```text
apps/api/server.ts
```

This file:

- Creates the Fastify server.
- Adds CORS headers.
- Registers chat HTTP routes under `/chat`.
- Registers the WebSocket plugin.
- Starts the server on port `5500`.

### HTTP Routes

HTTP routes are defined in:

```text
apps/api/src/routes/chat.routes.ts
```

Available routes:

| Method | Endpoint       | Description                                   |
| ------ | -------------- | --------------------------------------------- |
| GET    | `/chat/health` | Returns backend health and online-user count. |
| GET    | `/chat/users`  | Returns list of currently online users.       |

### Chat Model

The event types and payload structures are defined in:

```text
apps/api/src/modules/chat/chat.model.ts
```

The backend supports these event types:

- `join`
- `users`
- `message`
- `typing`
- `error`

### Chat Controller

The controller is located at:

```text
apps/api/src/modules/chat/chat.controller.ts
```

It is responsible for:

- Converting raw WebSocket data into a string.
- Parsing JSON messages.
- Validating that each message has a `type`.
- Validating that each message has an object `payload`.
- Routing events to the correct service function.
- Returning errors for invalid JSON or unsupported event types.

### Chat Service

The service layer is located at:

```text
apps/api/src/modules/chat/chat.service.ts
```

It contains the main business logic:

- Join user.
- Send active-user list.
- Broadcast active-user list.
- Send direct messages.
- Send typing status.
- Handle disconnect.
- Send error events.
- Write logs.

### User Manager

The user manager is located at:

```text
apps/api/src/utils/userManager.ts
```

It stores active users in memory:

```ts
Map<string, WebSocket>;
```

The username is the key and the WebSocket connection is the value.

This makes receiver lookup simple:

```text
receiver username -> receiver socket -> send message
```

Because this is in-memory storage, active users are cleared when the backend server restarts.

### Logger

The logger is located at:

```text
apps/api/src/utils/logger.ts
```

It writes structured JSON logs with:

- Timestamp.
- Log level.
- Event name.
- Context data.

Example backend events:

- `user_connected`
- `user_disconnected`
- `message_sent`
- `ws_error`
- `typing_receiver_missing`

## WebSocket Architecture

The WebSocket endpoint is defined in:

```text
apps/api/src/websocket/socket.ts
```

The endpoint is:

```text
ws://localhost:5500/ws
```

The frontend WebSocket helper is defined in:

```text
apps/web/src/lib/socket.ts
```

### Why WebSocket Is Used

Normal HTTP works like this:

```text
Client sends request -> Server sends response -> Connection ends
```

For chat, this is not enough because the server must be able to push messages to the browser whenever another user sends something.

WebSocket works like this:

```text
Client opens connection -> Connection remains open -> Client and server can both send messages anytime
```

This is why WebSocket is suitable for:

- Chat applications.
- Live notifications.
- Online-user updates.
- Typing indicators.
- Real-time dashboards.

### WebSocket Connection Flow

```text
1. Browser creates WebSocket:
   new WebSocket("ws://localhost:5500/ws")

2. Browser waits for open event.

3. Browser sends join event:
   { "type": "join", "payload": { "username": "seema" } }

4. Backend validates username.

5. Backend stores:
   users.set("seema", socket)

6. Backend sends join confirmation.

7. Backend broadcasts updated users event to all connected users.
```

### WebSocket Event Format

Every WebSocket message uses the same JSON structure:

```json
{
  "type": "event_name",
  "payload": {}
}
```

This consistent format makes it easy for both frontend and backend to understand messages.

### Join Event

Client sends:

```json
{
  "type": "join",
  "payload": {
    "username": "seema"
  }
}
```

Server responds:

```json
{
  "type": "join",
  "payload": {
    "username": "seema"
  }
}
```

Server also broadcasts updated online users.

### Users Event

Client can request users:

```json
{
  "type": "users",
  "payload": {}
}
```

Server sends:

```json
{
  "type": "users",
  "payload": {
    "users": ["seema", "karan"],
    "count": 2
  }
}
```

### Message Event

Client sends:

```json
{
  "type": "message",
  "payload": {
    "to": "karan",
    "message": "Hello"
  }
}
```

Server sends to receiver and sender:

```json
{
  "type": "message",
  "payload": {
    "from": "seema",
    "to": "karan",
    "message": "Hello",
    "timestamp": 1760000000000
  }
}
```

The backend adds `from` and `timestamp` so the client cannot fake these values directly in the final delivered message.

### Typing Event

Client sends while typing:

```json
{
  "type": "typing",
  "payload": {
    "to": "karan",
    "isTyping": true
  }
}
```

Server forwards:

```jsonf
{
  "type": "typing",
  "payload": {
    "from": "seema",
    "to": "karan",
    "isTyping": true,
    "timestamp": 1760000000000
  }
}
```

When typing stops, `isTyping` becomes `false`.

### Error Event

Server sends an error event when data is invalid:

```json
{
  "type": "error",
  "payload": {
    "message": "Receiver not found"
  }
}
```

### WebSocket Validation

The backend validates:

- Message is valid JSON.
- Event has a string `type`.
- Event has an object `payload`.
- Username is not empty.
- Username is not already in use.
- Sender has joined before sending messages.
- Receiver exists before message delivery.
- Typing payload contains a boolean `isTyping`.

## Multiple Port Setup

This project uses multiple ports because frontend and backend are separate applications.

| Application               | Port   | URL                                                  |
| ------------------------- | ------ | ---------------------------------------------------- |
| Frontend default          | `3000` | `http://localhost:3000`                              |
| Frontend alternate        | `3001` | `http://localhost:3001`                              |
| Frontend alternate        | `3002` | `http://localhost:3002`                              |
| Frontend alternate        | `3003` | `http://localhost:3003`                              |
| Backend API and WebSocket | `5500` | `http://localhost:5500` and `ws://localhost:5500/ws` |

### Why Multiple Frontend Ports Are Useful

Multiple frontend ports help during testing. For a chat application, at least two users are needed. A developer can run different frontend instances on different ports and log in with different usernames.

Example:

```text
Browser 1 -> http://localhost:3000 -> username: seema
Browser 2 -> http://localhost:3001 -> username: karan
Backend   -> ws://localhost:5500/ws
```

Both frontend instances connect to the same backend WebSocket server on port `5500`.

### How Multiple Frontend Ports Work

The web app has custom scripts in `apps/web/package.json`:

```json
{
  "dev:3000": "node scripts/dev.mjs 3000 .next-3000 --webpack",
  "dev:3001": "node scripts/dev.mjs 3001 .next-3001 --webpack",
  "dev:3002": "node scripts/dev.mjs 3002 .next-3002 --webpack",
  "dev:3003": "node scripts/dev.mjs 3003 .next-3003 --webpack"
}
```

The helper script is:

```text
apps/web/scripts/dev.mjs
```

It starts Next.js on the selected port and sets a different build output directory:

```text
3000 -> .next-3000
3001 -> .next-3001
3002 -> .next-3002
3003 -> .next-3003
```

This matters because multiple Next.js development servers should not write to the same `.next` directory at the same time. Using separate directories avoids conflicts.

The Next.js config reads the output directory from:

```text
NEXT_DIST_DIR
```

in `apps/web/next.config.ts`.

## Application Flow

### User Login Flow

```text
User opens /
  -> enters username
  -> frontend validates input
  -> username saved in sessionStorage
  -> router navigates to /chat
```

### Chat Join Flow

```text
/chat page loads
  -> reads username
  -> opens WebSocket connection
  -> sends join event
  -> backend stores username and socket
  -> backend sends join confirmation
  -> backend broadcasts online user list
```

### Message Sending Flow

```text
User selects receiver
  -> types message
  -> clicks send or presses Enter
  -> frontend sends message event
  -> backend validates sender and receiver
  -> backend sends message to receiver
  -> backend echoes message to sender
  -> both UIs update
```

### Typing Indicator Flow

```text
User starts typing
  -> frontend sends typing true
  -> backend forwards typing event to receiver
  -> receiver UI shows typing indicator
  -> user stops typing or sends message
  -> frontend sends typing false
  -> receiver UI hides typing indicator
```

### Disconnect Flow

```text
Browser tab closes or user leaves chat
  -> WebSocket closes
  -> backend checks active socket
  -> username is removed from user manager
  -> backend broadcasts updated user list
```

## API and WebSocket Contract

### HTTP API

#### Health Check

```http
GET http://localhost:5500/chat/health
```

Response:

```json
{
  "status": "ok",
  "onlineUsers": 2
}
```

#### Online Users

```http
GET http://localhost:5500/chat/users
```

Response:

```json
{
  "users": ["seema", "karan"],
  "count": 2
}
```

### WebSocket Endpoint

```text
ws://localhost:5500/ws
```

### WebSocket Events

| Event     | Direction                          | Purpose                                 |
| --------- | ---------------------------------- | --------------------------------------- |
| `join`    | Client to server, server to client | Register username and confirm join.     |
| `users`   | Client to server, server to client | Request or receive active-user list.    |
| `message` | Client to server, server to client | Send and receive chat messages.         |
| `typing`  | Client to server, server to client | Send and receive typing status.         |
| `error`   | Server to client                   | Report validation or connection errors. |

## How the Project Was Made

The project was made in multiple implementation stages.

### 1. Monorepo Setup

The base repository was organized as a Turborepo monorepo. This allowed the project to keep frontend, backend, and shared packages in one repository.

The main folders are:

- `apps/web` for the frontend.
- `apps/api` for the backend.
- `packages` for shared configuration and reusable packages.

### 2. Frontend Setup

The frontend was created using Next.js and React. The UI was divided into smaller components so each component has a clear responsibility.

The login page was created first because the application needs a username before joining the live chat.

After that, the chat page was implemented with:

- Online-user sidebar.
- Conversation panel.
- Message list.
- Message input.
- Connection status.
- Error display.

### 3. Browser Storage Setup

The username is stored in `sessionStorage` so it remains available while the browser tab session is active.

This avoids the need for a database or authentication system in the prototype.

### 4. Backend Server Setup

The backend was created using Fastify. The server listens on port `5500` and provides both:

- HTTP endpoints for health and user list.
- WebSocket endpoint for live chat.

### 5. WebSocket Setup

The WebSocket plugin was added using `@fastify/websocket`.

The backend accepts connections on:

```text
/ws
```

The frontend connects using:

```text
ws://localhost:5500/ws
```

### 6. Chat Event Model

A common event structure was designed:

```json
{
  "type": "event_name",
  "payload": {}
}
```

This event model keeps communication organized and easy to extend.

### 7. User Management

An in-memory `Map` was added to store active users.

```text
username -> WebSocket connection
```

This is used to find the receiver socket when a message is sent.

### 8. Message Delivery

Message delivery was implemented by:

- Validating the sender.
- Checking that the receiver exists.
- Creating a message object with `from`, `to`, `message`, and `timestamp`.
- Sending the message to the receiver.
- Sending the same message back to the sender.

### 9. Typing Indicator

Typing status was added as a separate WebSocket event. The frontend sends typing updates while the user is typing. The backend forwards those updates to the selected receiver.

### 10. Multiple Port Support

Multiple frontend port support was added so the developer can test different users easily from the same machine.

The app can run frontend instances on:

- `3000`
- `3001`
- `3002`
- `3003`

All of them use the same backend on `5500`.

### 11. Final Integration

The final integration connects:

- Login screen.
- Session storage.
- Chat page.
- WebSocket client.
- Fastify WebSocket backend.
- Online-user broadcasting.
- Message delivery.
- Typing indicator.
- Disconnect cleanup.

## How the Project Is Completed

The project is complete as a working real-time chat prototype.

The completed system includes:

- A frontend interface that users can operate directly.
- A backend server that handles live connections.
- Real-time communication using WebSocket.
- Online-user list updates.
- One-to-one message routing.
- Typing indicators.
- Error handling for invalid actions.
- Multi-port frontend support for testing more than one user.
- Monorepo organization suitable for academic explanation and future extension.

The current version is best understood as a functional academic project and prototype. It demonstrates core real-time communication concepts clearly. For production use, additional features such as authentication, database persistence, encryption, deployment configuration, and rate limiting would be needed.

## How to Run the Project

### Prerequisites

Install:

- Node.js 18 or higher.
- pnpm 9 or compatible version.

Check versions:

```bash
node --version
pnpm --version
```

### Install Dependencies

From the repository root:

```bash
pnpm install
```

### Run Frontend and Backend Together

From the repository root:

```bash
pnpm dev
```

This runs development tasks through Turborepo.

### Run Backend Separately

From the repository root:

```bash
pnpm --filter quick-talk-backend dev
```

Backend runs on:

```text
http://localhost:5500
ws://localhost:5500/ws
```

### Run Frontend Separately

From the repository root:

```bash
pnpm --filter quick-talk dev
```

Frontend runs on:

```text
http://localhost:3000
```

### Run Frontend on Specific Ports

From the repository root:

```bash
pnpm --dir apps/web dev:3000
pnpm --dir apps/web dev:3001
pnpm --dir apps/web dev:3002
pnpm --dir apps/web dev:3003
```

Use these in separate terminal windows if you want multiple frontend instances at the same time.

## Testing the Real-Time Chat

### Test with Two Users

1. Start the backend on port `5500`.
2. Start frontend on port `3000`.
3. Start another frontend on port `3001`.
4. Open `http://localhost:3000` in one browser tab.
5. Login as `seema`.
6. Open `http://localhost:3001` in another browser tab or another browser.
7. Login as `karan`.
8. Both users should appear online.
9. Select the other user.
10. Send messages.
11. Verify that messages appear instantly.
12. Type in one window and verify that typing indicator appears in the other window.

### Test Backend Health

Open:

```text
http://localhost:5500/chat/health
```

Expected response:

```json
{
  "status": "ok",
  "onlineUsers": 0
}
```

The `onlineUsers` value changes when users join.

### Test Online Users

Open:

```text
http://localhost:5500/chat/users
```

Expected response:

```json
{
  "users": [],
  "count": 0
}
```

The list changes when users are connected.

## Current Limitations

The current project is intentionally lightweight. These are the main limitations:

- No database is used.
- Messages are not permanently stored.
- Online users are stored only in memory.
- Users are removed when the backend restarts.
- There is no password-based authentication.
- There is no role-based access control.
- A username must be unique only during the active server session.
- The WebSocket URL is hardcoded as `ws://localhost:5500/ws`.
- The backend port is hardcoded as `5500`.
- The project is designed for local development and academic demonstration, not production deployment.

## Future Scope

The project can be improved in the following ways:

- Add database storage for users and messages.
- Add login and authentication.
- Add group chat rooms.
- Add message read receipts.
- Add file and image sharing.
- Add message search.
- Add message deletion and editing.
- Add user profile images.
- Add environment variables for backend URL and ports.
- Add deployment support for cloud platforms.
- Add automated tests for backend services.
- Add end-to-end tests for chat flow.
- Add rate limiting to protect the WebSocket server.
- Add HTTPS and secure WebSocket support using `wss://`.

## Academic Learning Outcomes

This project demonstrates the following Computer Science concepts:

- Client-server architecture.
- Event-driven programming.
- Real-time communication.
- WebSocket protocol usage.
- Frontend state management.
- Backend service separation.
- In-memory data structures.
- Type-safe application development.
- Monorepo project organization.
- Full-stack integration.

## Conclusion

Quick Talk is a complete real-time chat prototype built with Next.js, React, TypeScript, Fastify, and WebSocket. It demonstrates how a user can join a chat session, see online users, send direct messages, and receive live typing updates through a persistent WebSocket connection.

The project is structured clearly for an M.Tech Computer Science submission. It explains the practical use of modern full-stack technologies and shows how frontend and backend systems communicate in real time.
