import process = require("node:process");
import fastify = require("fastify");
import chatRoutes = require("./src/routes/chat.routes");
import socketPlugin = require("./src/websocket/socket");

async function buildServer() {
  const app = fastify({ logger: true });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
      reply.code(204).send();
    }
  });

  app.removeContentTypeParser("application/json");
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    app.getDefaultJsonParser("error", "error"),
  );

  await app.register(chatRoutes, { prefix: "/chat" });
  await app.register(socketPlugin);

  return app;
}

async function startServer() {
  const app = await buildServer();

  await app.listen({
    port: 5500,
    host: "0.0.0.0",
  });
}

startServer().catch((error) => {
  console.error("Error starting the server:", error);
  process.exit(1);
});
