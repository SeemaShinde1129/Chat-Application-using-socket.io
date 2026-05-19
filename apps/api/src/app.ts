import fastify = require("fastify");
import envPlugin = require("@fastify/env");

async function buildApp() {
  const app = fastify({ logger: true });

  await app.register(envPlugin, {
    schema: {
      type: "object",
      required: ["PORT"],
      properties: {
        PORT: {
          type: "number",
          default: 3000,
        },
      },
    },
  });

  app.get("/", async () => {
    return { message: "Hello World" };
  });

  return app;
}

export = buildApp;
