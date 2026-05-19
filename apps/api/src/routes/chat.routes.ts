import fastify = require("fastify");
import userManager = require("../utils/userManager");

const chatRoutes: fastify.FastifyPluginAsync = async (app) => {
  app.get("/users", async () => {
    const users = userManager.listUsers();

    return {
      users,
      count: users.length,
    };
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      onlineUsers: userManager.listUsers().length,
    };
  });
};

export = chatRoutes;
