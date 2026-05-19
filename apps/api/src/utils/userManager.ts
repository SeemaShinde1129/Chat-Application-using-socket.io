import websocket = require("@fastify/websocket");

const users = new Map<string, websocket.WebSocket>();

function normalizeUsername(username: string) {
  return username.trim();
}

function addUser(username: string, socket: websocket.WebSocket) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername || users.has(normalizedUsername)) {
    return false;
  }

  users.set(normalizedUsername, socket);
  return true;
}

function removeUser(username: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return false;
  }

  return users.delete(normalizedUsername);
}

function getUserSocket(username: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  return users.get(normalizedUsername) ?? null;
}

function listUsers() {
  return Array.from(users.keys());
}

const userManager = {
  addUser,
  getUserSocket,
  listUsers,
  removeUser,
};

export = userManager;
