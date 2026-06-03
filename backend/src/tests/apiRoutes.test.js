process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/habit_flow";

const assert = require("assert");
const test = require("node:test");
const app = require("../app");

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, () => {
      resolve(server.address().port);
    });
  });
}

async function get(baseUrl, path) {
  const response = await fetch(`${baseUrl}${path}`);

  return {
    status: response.status,
    body: await response.json()
  };
}

test("API routes are exposed under the configured /api prefix", async (t) => {
  const httpServer = require("http").createServer(app);
  const port = await listen(httpServer);
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise((resolve) => httpServer.close(resolve));
  });

  const apiRoot = await get(baseUrl, "/api");
  const legacyAuth = await get(baseUrl, "/auth/me");

  assert.equal(apiRoot.status, 200);
  assert.equal(apiRoot.body.routes.auth, "/api/auth");
  assert.equal(apiRoot.body.routes.habits, "/api/habits");
  assert.equal(legacyAuth.status, 404);
});

test("protected API routes reject missing and invalid tokens consistently", async (t) => {
  const httpServer = require("http").createServer(app);
  const port = await listen(httpServer);
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise((resolve) => httpServer.close(resolve));
  });

  const missingToken = await get(baseUrl, "/api/auth/me");
  const invalidTokenResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: "Bearer invalid-token"
    }
  });
  const invalidToken = {
    status: invalidTokenResponse.status,
    body: await invalidTokenResponse.json()
  };

  assert.equal(missingToken.status, 401);
  assert.equal(missingToken.body.status, "error");
  assert.match(missingToken.body.message, /Authentication required/);
  assert.equal(invalidToken.status, 401);
  assert.equal(invalidToken.body.status, "error");
  assert.match(invalidToken.body.message, /Invalid or expired token/);
});
