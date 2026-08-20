import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { sendPasswordResetEmail } from '../utils/email';

jest.mock('../utils/email');

const mockSendResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.user.deleteMany({});
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123',
};

const register = (overrides = {}) =>
  request(app)
    .post('/api/auth/register')
    .send({ ...TEST_USER, ...overrides });

const login = (email = TEST_USER.email, password = TEST_USER.password) =>
  request(app).post('/api/auth/login').send({ email, password });

const getCookie = (res: request.Response): string => {
  const raw = res.headers['set-cookie'];
  return Array.isArray(raw) ? raw[0] : raw;
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('returns 201 with user data and accessToken', async () => {
    const res = await register();

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: TEST_USER.email, role: 'customer' });
    expect(res.body.accessToken).toBeDefined();
  });

  it('does not expose password or refreshTokens in response', async () => {
    const res = await register();

    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.refreshTokens).toBeUndefined();
  });

  it('sets an httpOnly refreshToken cookie', async () => {
    const res = await register();
    const cookie = getCookie(res);

    expect(cookie).toMatch(/refreshToken=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already in use', async () => {
    await register();
    const res = await register();

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already in use/i);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await register();
  });

  it('returns 200 with tokens on valid credentials', async () => {
    const res = await login();

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: TEST_USER.email, role: 'customer' });
    expect(res.body.accessToken).toBeDefined();
    expect(getCookie(res)).toMatch(/refreshToken=/);
  });

  it('normalizes email to lowercase on login', async () => {
    const res = await login(TEST_USER.email.toUpperCase());

    expect(res.status).toBe(200);
  });

  it('returns 401 for incorrect password', async () => {
    const res = await login(TEST_USER.email, 'WrongPassword999');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await login('nonexistent@example.com', TEST_USER.password);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns 400 when email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_USER.email });

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/refresh-token ─────────────────────────────────────────────

describe('POST /api/auth/refresh-token', () => {
  it('returns a new access token when a valid cookie is provided', async () => {
    await register();
    const loginRes = await login();
    const cookie = getCookie(loginRes);

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('returns 401 when no refreshToken cookie is present', async () => {
    const res = await request(app).post('/api/auth/refresh-token');

    expect(res.status).toBe(401);
  });

  it('returns 401 for a forged or malformed cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=thisisnotavalidtoken');

    expect(res.status).toBe(401);
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns current user profile with valid Bearer token', async () => {
    const regRes = await register();
    const { accessToken } = regRes.body;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      name: TEST_USER.name,
      email: TEST_USER.email,
      role: 'customer',
    });
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.refreshTokens).toBeUndefined();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns 401 for an invalid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the refreshToken cookie', async () => {
    await register();
    const loginRes = await login();
    const cookie = getCookie(loginRes);

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successful/i);
    expect(getCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  it('returns 200 gracefully when no cookie is present', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
  });

  it('invalidates the refresh token so it cannot be reused after logout', async () => {
    await register();
    const loginRes = await login();
    const cookie = getCookie(loginRes);

    await request(app).post('/api/auth/logout').set('Cookie', cookie);

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', cookie);

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  beforeEach(async () => {
    mockSendResetEmail.mockResolvedValue(undefined);
    await register();
  });

  it('returns 200 and calls sendPasswordResetEmail', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(200);
    expect(mockSendResetEmail).toHaveBeenCalledTimes(1);
    expect(mockSendResetEmail).toHaveBeenCalledWith(TEST_USER.email, expect.any(String));
  });

  it('returns 200 for unknown email without revealing user existence', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@nowhere.com' });

    expect(res.status).toBe(200);
    expect(mockSendResetEmail).not.toHaveBeenCalled();
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/reset-password/:token ────────────────────────────────────

describe('POST /api/auth/reset-password/:token', () => {
  const NEW_PASSWORD = 'NewPassword456';
  let rawToken: string;

  beforeEach(async () => {
    mockSendResetEmail.mockResolvedValue(undefined);
    await register();

    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: TEST_USER.email });

    // Capture the raw token that was passed to sendPasswordResetEmail
    rawToken = mockSendResetEmail.mock.calls[0][1];
  });

  it('returns 200 and resets the password', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: NEW_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successful/i);
  });

  it('allows login with the new password', async () => {
    await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: NEW_PASSWORD });

    const res = await login(TEST_USER.email, NEW_PASSWORD);
    expect(res.status).toBe(200);
  });

  it('rejects the old password after reset', async () => {
    await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: NEW_PASSWORD });

    const res = await login(TEST_USER.email, TEST_USER.password);
    expect(res.status).toBe(401);
  });

  it('returns 400 on token reuse', async () => {
    await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: NEW_PASSWORD });

    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: 'AnotherPass789' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/thisisnotavalidtoken')
      .send({ password: NEW_PASSWORD });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password field is missing', async () => {
    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
