import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AddressInfo } from 'net';
import express from 'express';
import jwt from 'jsonwebtoken';
import { learnerRateLimiter, loginRateLimiter } from './rate-limit.middleware';

// Read by the auth provider when the learner limiter first needs it
process.env.JWT_SECRET = 'test-secret';

// A real server, so the limiters see real requests: trust proxy as in index.ts
// and a login that succeeds only for the right password
async function startApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.post('/login', loginRateLimiter, (req, res) => {
    res.sendStatus(req.body.password === 'right' ? 200 : 401);
  });
  app.get('/progress', learnerRateLimiter, (_req, res) => res.sendStatus(200));
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { url, close: () => server.close() };
}

const login = (url: string, ip: string, password: string) =>
  fetch(`${url}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
    body: JSON.stringify({ password }),
  });

test('successful sign-ins never use up the limit', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 30; i++) {
      assert.equal((await login(app.url, '203.0.113.1', 'right')).status, 200);
    }
  } finally {
    app.close();
  }
});

test('20 failed sign-ins lock that client out with a JSON error, other clients are unaffected', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 20; i++) {
      assert.equal((await login(app.url, '203.0.113.2', 'wrong')).status, 401);
    }
    const locked = await login(app.url, '203.0.113.2', 'right');
    assert.equal(locked.status, 429);
    assert.match((await locked.json()).error, /Too many sign-in attempts/);

    assert.equal((await login(app.url, '203.0.113.3', 'right')).status, 200);
  } finally {
    app.close();
  }
});

test('the client is the last X-Forwarded-For entry, so earlier (client-supplied) ones cannot dodge a lockout', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 20; i++) {
      await login(app.url, `198.51.100.${i}, 203.0.113.4`, 'wrong');
    }
    assert.equal((await login(app.url, '192.0.2.99, 203.0.113.4', 'right')).status, 429);
  } finally {
    app.close();
  }
});

const tokenFor = (userId: string, secret = 'test-secret') => jwt.sign({ userId }, secret);
const progress = (url: string, token: string, ip = '203.0.113.5') =>
  fetch(`${url}/progress`, { headers: { Authorization: `Bearer ${token}`, 'X-Forwarded-For': ip } });

test('each learner has their own budget, whatever network they share', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 600; i++) {
      assert.equal((await progress(app.url, tokenFor('learner-a'))).status, 200);
    }
    const limited = await progress(app.url, tokenFor('learner-a'));
    assert.equal(limited.status, 429);
    assert.ok((await limited.json()).error);

    assert.equal((await progress(app.url, tokenFor('learner-b'))).status, 200);
  } finally {
    app.close();
  }
});

test("forged tokens are counted per IP and can't spend a real learner's budget", async () => {
  const app = await startApp();
  try {
    const forged = tokenFor('learner-c', 'not-the-secret');
    for (let i = 0; i < 600; i++) {
      await progress(app.url, forged, '198.51.100.7');
    }
    assert.equal((await progress(app.url, forged, '198.51.100.7')).status, 429);
    assert.equal((await progress(app.url, 'garbage', '198.51.100.7')).status, 429);

    assert.equal((await progress(app.url, tokenFor('learner-c'), '198.51.100.7')).status, 200);
  } finally {
    app.close();
  }
});
