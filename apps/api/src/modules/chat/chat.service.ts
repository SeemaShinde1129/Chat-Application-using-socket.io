import websocket = require("@fastify/websocket");
import chatModel = require("./chat.model");
import logger = require("../../utils/logger");
import userManager = require("../../utils/userManager");

type ErrorResult = {
  ok: false;
  error: string;
};

type JoinUserInput = {
  currentUsername: string | null;
  senderSocket: websocket.WebSocket;
  username?: unknown;
};

type JoinUserResult =
  | {
      ok: true;
      username: string;
    }
  | ErrorResult;

type SendMessageInput = {
  echoToSender?: boolean;
  message?: unknown;
  senderSocket: websocket.WebSocket;
  senderUsername: string | null;
  to?: unknown;
};

type SendTypingInput = {
  isTyping?: unknown;
  senderSocket: websocket.WebSocket;
  senderUsername: string | null;
  to?: unknown;
};

type SendMessageResult =
  | {
      ok: true;
      data: chatModel.Message;
    }
  | ErrorResult;

type SendTypingResult =
  | {
      ok: true;
      data: chatModel.TypingPayload;
    }
  | ErrorResult;

type DisconnectInput = {
  senderSocket: websocket.WebSocket;
  username: string | null;
};

type ErrorContext = Record<string, unknown>;

function createEvent<TType extends chatModel.EventType>(
  type: TType,
  payload: chatModel.EventMap[TType],
): chatModel.Event<TType> {
  return {
    type,
    payload,
  };
}

function sendEvent<TType extends chatModel.EventType>(
  socket: websocket.WebSocket,
  type: TType,
  payload: chatModel.EventMap[TType],
) {
  socket.send(JSON.stringify(createEvent(type, payload)));
}

function sendError(
  senderSocket: websocket.WebSocket | null | undefined,
  message: string,
  context?: ErrorContext,
): ErrorResult {
  logger.error("ws_error", {
    message,
    ...context,
  });

  if (senderSocket) {
    sendEvent(senderSocket, chatModel.eventTypes.error, { message });
  }

  return {
    ok: false,
    error: message,
  };
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

function buildUsersPayload(): chatModel.UsersPayload {
  const users = userManager.listUsers();

  return {
    users,
    count: users.length,
  };
}

function sendUsersToSocket(targetSocket: websocket.WebSocket) {
  const usersPayload = buildUsersPayload();

  sendEvent(targetSocket, chatModel.eventTypes.users, usersPayload);
}

function broadcastUsers() {
  const usersPayload = buildUsersPayload();

  for (const username of usersPayload.users) {
    const socket = userManager.getUserSocket(username);

    if (socket) {
      sendEvent(socket, chatModel.eventTypes.users, usersPayload);
    }
  }
}

function joinUser(data: JoinUserInput): JoinUserResult {
  const username = normalizeText(data.username);

  if (!username) {
    return sendError(data.senderSocket, "Invalid username", {
      action: "join",
    });
  }

  if (data.currentUsername) {
    if (data.currentUsername === username) {
      sendEvent(data.senderSocket, chatModel.eventTypes.join, { username });
      sendUsersToSocket(data.senderSocket);

      return {
        ok: true,
        username,
      };
    }

    return sendError(
      data.senderSocket,
      `Connection already joined as ${data.currentUsername}`,
      {
        action: "join",
        requestedUsername: username,
        username: data.currentUsername,
      },
    );
  }

  if (!userManager.addUser(username, data.senderSocket)) {
    return sendError(data.senderSocket, "Username already in use", {
      action: "join",
      username,
    });
  }

  sendEvent(data.senderSocket, chatModel.eventTypes.join, { username });
  logger.info("user_connected", {
    username,
    onlineUsers: userManager.listUsers().length,
  });
  broadcastUsers();

  return {
    ok: true,
    username,
  };
}

function buildMessage(data: SendMessageInput) {
  const from = normalizeText(data.senderUsername);
  const to = normalizeText(data.to);
  const message = normalizeText(data.message);

  if (!from || !to || !message) {
    return null;
  }

  const chatMessage: chatModel.Message = {
    from,
    to,
    message,
    timestamp: Date.now(),
  };

  return chatMessage;
}

function buildTypingPayload(data: SendTypingInput) {
  const from = normalizeText(data.senderUsername);
  const to = normalizeText(data.to);

  if (!from || !to || typeof data.isTyping !== "boolean") {
    return null;
  }

  const typingPayload: chatModel.TypingPayload = {
    from,
    to,
    isTyping: data.isTyping,
    timestamp: Date.now(),
  };

  return typingPayload;
}

function sendMessage(data: SendMessageInput): SendMessageResult {
  const chatMessage = buildMessage(data);

  if (!chatMessage) {
    return sendError(data.senderSocket, "Invalid message data", {
      action: "message",
      senderUsername: data.senderUsername,
      to: data.to,
    });
  }

  const activeSenderSocket = userManager.getUserSocket(chatMessage.from);

  if (!activeSenderSocket || activeSenderSocket !== data.senderSocket) {
    return sendError(data.senderSocket, "Join before sending messages", {
      action: "message",
      senderUsername: chatMessage.from,
      to: chatMessage.to,
    });
  }

  const receiverSocket = userManager.getUserSocket(chatMessage.to);

  if (!receiverSocket) {
    return sendError(data.senderSocket, "Receiver not found", {
      action: "message",
      from: chatMessage.from,
      to: chatMessage.to,
    });
  }

  sendEvent(receiverSocket, chatModel.eventTypes.message, chatMessage);

  if (data.echoToSender !== false && data.senderSocket !== receiverSocket) {
    sendEvent(data.senderSocket, chatModel.eventTypes.message, chatMessage);
  }

  logger.info("message_sent", {
    from: chatMessage.from,
    to: chatMessage.to,
    timestamp: chatMessage.timestamp,
    echoedToSender: data.echoToSender !== false && data.senderSocket !== receiverSocket,
  });

  return {
    ok: true,
    data: chatMessage,
  };
}

function sendTyping(data: SendTypingInput): SendTypingResult {
  const typingPayload = buildTypingPayload(data);

  if (!typingPayload) {
    return sendError(data.senderSocket, "Invalid typing data", {
      action: "typing",
      senderUsername: data.senderUsername,
      to: data.to,
    });
  }

  const activeSenderSocket = userManager.getUserSocket(typingPayload.from);

  if (!activeSenderSocket || activeSenderSocket !== data.senderSocket) {
    return sendError(data.senderSocket, "Join before sending typing updates", {
      action: "typing",
      senderUsername: typingPayload.from,
      to: typingPayload.to,
    });
  }

  const receiverSocket = userManager.getUserSocket(typingPayload.to);

  if (!receiverSocket) {
    logger.warn("typing_receiver_missing", {
      from: typingPayload.from,
      to: typingPayload.to,
    });

    return {
      ok: false,
      error: "Receiver not found",
    };
  }

  sendEvent(receiverSocket, chatModel.eventTypes.typing, typingPayload);

  return {
    ok: true,
    data: typingPayload,
  };
}

function handleDisconnect(data: DisconnectInput) {
  if (!data.username) {
    return;
  }

  const activeSocket = userManager.getUserSocket(data.username);

  if (!activeSocket || activeSocket !== data.senderSocket) {
    return;
  }

  if (userManager.removeUser(data.username)) {
    logger.info("user_disconnected", {
      username: data.username,
      onlineUsers: userManager.listUsers().length,
    });
    broadcastUsers();
  }
}

const chatService = {
  broadcastUsers,
  handleDisconnect,
  joinUser,
  sendError,
  sendMessage,
  sendTyping,
  sendUsersToSocket,
};

export = chatService;
