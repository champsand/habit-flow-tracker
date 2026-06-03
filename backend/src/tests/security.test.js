process.env.DATABASE_URL ||= "postgresql://postgres:postgres@localhost:5432/habit_flow?schema=public";
process.env.GENERAL_RATE_LIMIT_MAX = "1";
process.env.GENERAL_RATE_LIMIT_WINDOW_MS = "60000";

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

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get("content-type") || "";

  return {
    headers: response.headers,
    status: response.status,
    body: contentType.includes("application/json") ? await response.json() : null
  };
}

test("security headers are present and Express fingerprint is hidden", async (t) => {
  const httpServer = require("http").createServer(app);
  const port = await listen(httpServer);
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise((resolve) => httpServer.close(resolve));
  });

  const response = await request(baseUrl, "/health");

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("development CORS allows localhost frontend origins", async (t) => {
  const httpServer = require("http").createServer(app);
  const port = await listen(httpServer);
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise((resolve) => httpServer.close(resolve));
  });

  const response = await request(baseUrl, "/health", {
    headers: {
      Origin: "http://localhost:5173"
    }
  });

  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
});

test("general API rate limiter returns consistent JSON", async (t) => {
  const httpServer = require("http").createServer(app);
  const port = await listen(httpServer);
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise((resolve) => httpServer.close(resolve));
  });

  const first = await request(baseUrl, "/api");
  const second = await request(baseUrl, "/api");

  assert.equal(first.status, 200);
  assert.equal(second.status, 429);
  assert.equal(second.body.status, "error");
  assert.match(second.body.message, /Too many API requests/);
});
