import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { sendPasswordResetEmail } from '../utils/email';

jest.mock('../utils/email');

const mockSendResetEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>;

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
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

  it('returns 200 with user and accessToken on valid credentials', async () => {
    const res = await login();

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.accessToken).toBeDefined();
  });

  it('sets a refreshToken cookie on login', async () => {
    const res = await login();

    expect(getCookie(res)).toMatch(/refreshToken=/);
  });

  it('returns 401 on wrong password', async () => {
    const res = await login(TEST_USER.email, 'wrongpassword');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns user data with a valid access token', async () => {
    await register();
    const { body } = await login();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.refreshTokens).toBeUndefined();
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer thisisnotavalidtoken');

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/auth/refresh-token ─────────────────────────────────────────────

describe('POST /api/auth/refresh-token', () => {
  it('returns a new accessToken when cookie is valid', async () => {
    await register();
    const loginRes = await login();
    const cookie = getCookie(loginRes);

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('returns 401 with no cookie', async () => {
    const res = await request(app).post('/api/auth/refresh-token');

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
