import websocket = require("@fastify/websocket");
import chatModel = require("./chat.model");
import chatService = require("./chat.service");

function rawDataToString(rawData: unknown) {
  if (typeof rawData === "string") {
    return rawData;
  }

  if (Buffer.isBuffer(rawData)) {
    return rawData.toString("utf8");
  }

  if (rawData instanceof ArrayBuffer) {
    return Buffer.from(rawData).toString("utf8");
  }

  if (Array.isArray(rawData)) {
    return Buffer.concat(rawData.filter(Buffer.isBuffer)).toString("utf8");
  }

  return null;
}

function isPayloadObject(payload: unknown) {
  return !!payload && typeof payload === "object" && !Array.isArray(payload);
}

function parseEvent(rawData: unknown) {
  const rawMessage = rawDataToString(rawData);

  if (!rawMessage) {
    return null;
  }

  return JSON.parse(rawMessage) as {
    payload?: unknown;
    type?: unknown;
  };
}

function handleIncomingMessage(
  rawData: unknown,
  senderSocket: websocket.WebSocket,
  currentUsername: string | null,
) {
  try {
    const event = parseEvent(rawData);

    if (!event || typeof event !== "object" || Array.isArray(event)) {
      chatService.sendError(senderSocket, "Invalid JSON data", {
        action: "parse_event",
        currentUsername,
      });
      return null;
    }

    if (typeof event.type !== "string") {
      chatService.sendError(senderSocket, "Event type is required", {
        action: "parse_event",
        currentUsername,
      });
      return null;
    }

    if (!isPayloadObject(event.payload)) {
      chatService.sendError(senderSocket, "Event payload must be an object", {
        action: "parse_event",
        currentUsername,
        type: event.type,
      });
      return null;
    }

    const payload = event.payload as Record<string, unknown>;

    switch (event.type) {
      case chatModel.eventTypes.join: {
        const result = chatService.joinUser({
          currentUsername,
          senderSocket,
          username: payload.username,
        });

        return result.ok ? result.username : null;
      }
      case chatModel.eventTypes.message:
        chatService.sendMessage({
          echoToSender: true,
          message: payload.message,
          senderSocket,
          senderUsername: currentUsername,
          to: payload.to,
        });
        return null;
      case chatModel.eventTypes.typing:
        chatService.sendTyping({
          isTyping: payload.isTyping,
          senderSocket,
          senderUsername: currentUsername,
          to: payload.to,
        });
        return null;
      case chatModel.eventTypes.users:
        chatService.sendUsersToSocket(senderSocket);
        return null;
      default:
        chatService.sendError(senderSocket, `Unsupported event type: ${event.type}`, {
          action: "route_event",
          currentUsername,
          type: event.type,
        });
        return null;
    }
  } catch {
    chatService.sendError(senderSocket, "Invalid JSON data", {
      action: "parse_event",
      currentUsername,
    });
    return null;
  }
}

const chatController = {
  handleIncomingMessage,
};

export = chatController;
