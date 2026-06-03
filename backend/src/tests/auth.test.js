process.env.JWT_SECRET = "test-secret";
require("dotenv").config();

const assert = require("assert");
const test = require("node:test");

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, () => {
      resolve(server.address().port);
    });
  });
}

async function request(baseUrl, method, path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

const authIntegrationTest = process.env.RUN_DB_TESTS === "true" && process.env.DATABASE_URL ? test : test.skip;

authIntegrationTest("auth flow registers, logs in, reads profile, and logs out", async (t) => {
  const app = require("../app");
  const prisma = require("../config/prisma");
  const httpServer = require("http").createServer(app);
  const port = await listen(httpServer);
  const baseUrl = `http://127.0.0.1:${port}`;
  const email = `test-${Date.now()}@example.com`;

  t.after(async () => {
    await prisma.user.deleteMany({
      where: {
        email
      }
    });
    await prisma.$disconnect();
    await new Promise((resolve) => httpServer.close(resolve));
  });

  const registration = await request(baseUrl, "POST", "/api/auth/register", {
    name: "Test User",
    email,
    password: "password123"
  });

  assert.equal(registration.status, 201);
  assert.ok(registration.body.token);
  assert.equal(registration.body.user.email, email);
  assert.equal(registration.body.user.passwordHash, undefined);

  const duplicate = await request(baseUrl, "POST", "/api/auth/register", {
    name: "Test User",
    email,
    password: "password123"
  });

  assert.equal(duplicate.status, 409);

  const deniedProfile = await request(baseUrl, "GET", "/api/auth/me");
  assert.equal(deniedProfile.status, 401);

  const profile = await request(baseUrl, "GET", "/api/auth/me", null, registration.body.token);
  assert.equal(profile.status, 200);
  assert.equal(profile.body.user.email, email);

  const login = await request(baseUrl, "POST", "/api/auth/login", {
    email,
    password: "password123"
  });

  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const logout = await request(baseUrl, "POST", "/api/auth/logout", null, login.body.token);
  assert.equal(logout.status, 200);

  const invalidatedProfile = await request(baseUrl, "GET", "/api/auth/me", null, login.body.token);
  assert.equal(invalidatedProfile.status, 401);
});
