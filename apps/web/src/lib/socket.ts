const SOCKET_URL = "ws://localhost:5500/ws";

type SocketPayload = Record<string, unknown>;

type SocketEvent = {
  type: string;
  payload: SocketPayload;
};

type MessageListener = (message: SocketEvent) => void;

let socket: WebSocket | null = null;
const messageListeners = new Set<MessageListener>();

function createErrorEvent(message: string): SocketEvent {
  return {
    type: "error",
    payload: {
      message,
    },
  };
}

function notifyMessageListeners(message: SocketEvent) {
  for (const listener of messageListeners) {
    listener(message);
  }
}

function sendEvent(type: string, payload: SocketPayload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket is not connected");
  }

  socket.send(
    JSON.stringify({
      type,
      payload,
    }),
  );
}

function connect(username: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return socket;
  }

  const nextSocket = new WebSocket(SOCKET_URL);
  socket = nextSocket;

  nextSocket.addEventListener("open", () => {
    nextSocket.send(
      JSON.stringify({
        type: "join",
        payload: {
          username,
        },
      }),
    );
  });

  nextSocket.addEventListener("message", (event) => {
    if (typeof event.data !== "string") {
      notifyMessageListeners(createErrorEvent("We could not read a message from the server."));
      return;
    }

    try {
      const parsedMessage = JSON.parse(event.data) as SocketEvent;
      notifyMessageListeners(parsedMessage);
    } catch {
      notifyMessageListeners(createErrorEvent("We could not read a message from the server."));
    }
  });

  nextSocket.addEventListener("close", () => {
    if (socket === nextSocket) {
      socket = null;
    }

    notifyMessageListeners(createErrorEvent("The chat connection was closed."));
  });

  nextSocket.addEventListener("error", () => {
    notifyMessageListeners(createErrorEvent("We could not reach the chat server."));
  });

  return nextSocket;
}

function sendMessage(data: SocketPayload) {
  sendEvent("message", data);
}

function sendTyping(data: SocketPayload) {
  sendEvent("typing", data);
}

function requestUsers() {
  sendEvent("users", {});
}

function disconnect() {
  if (!socket) {
    return;
  }

  const activeSocket = socket;
  socket = null;
  activeSocket.close();
}

function onMessage(callback: MessageListener) {
  messageListeners.add(callback);

  return () => {
    messageListeners.delete(callback);
  };
}

export { connect, disconnect, onMessage, requestUsers, sendMessage, sendTyping };
export type { SocketEvent, SocketPayload };
