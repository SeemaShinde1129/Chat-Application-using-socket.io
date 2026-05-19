import fastify = require("fastify");
import websocket = require("@fastify/websocket");
import chatController = require("../modules/chat/chat.controller");
import chatModel = require("../modules/chat/chat.model");
import chatService = require("../modules/chat/chat.service");

function getUsernameFromQuery(query: unknown) {
  if (!query || typeof query !== "object") {
    return null;
  }

  const username = (query as Record<string, unknown>).username;
  return typeof username === "string" && username.trim() ? username.trim() : null;
}

const socketPlugin: fastify.FastifyPluginAsync = async (app) => {
  await app.register(websocket);

  app.get("/ws", { websocket: true }, (socket, request) => {
    let username: string | null = null;
    const queryUsername = getUsernameFromQuery(request.query);

    if (queryUsername) {
      const joinedUsername = chatController.handleIncomingMessage(
        JSON.stringify({
          type: chatModel.eventTypes.join,
          payload: {
            username: queryUsername,
          },
        }),
        socket,
        username,
      );

      if (joinedUsername) {
        username = joinedUsername;
      }
    }

    socket.on("message", (rawData: unknown) => {
      const joinedUsername = chatController.handleIncomingMessage(rawData, socket, username);

      if (joinedUsername) {
        username = joinedUsername;
      }
    });

    socket.on("close", () => {
      chatService.handleDisconnect({
        senderSocket: socket,
        username,
      });
    });
  });
};

export = socketPlugin;
