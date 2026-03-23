import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';

const MOCK_SIGNED_URL = 'https://mock.supabase.co/storage/v1/object/sign/products/shopv1/products/mock-path';
const MOCK_PUBLIC_URL = 'https://mock.supabase.co/storage/v1/object/public/products/shopv1/products/mock-path';

jest.mock('../config/supabase', () => {
  const mockBucket = {
    createSignedUploadUrl: jest.fn().mockResolvedValue({
      data: {
        signedUrl: 'https://mock.supabase.co/storage/v1/object/sign/products/shopv1/products/mock-path',
        path: 'shopv1/products/mock-path',
        token: 'mock-token',
      },
      error: null,
    }),
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/products/shopv1/products/mock-path' },
    }),
  };
  return {
    __esModule: true,
    default: {
      storage: {
        from: jest.fn().mockReturnValue(mockBucket),
      },
    },
  };
});

process.env.SUPERBASE_URL = 'https://mock.supabase.co';
process.env.SUPERBASE_KEY = 'mock-key';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const adminReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin User', email: 'admin@upload.test', password: 'Password123' });
  await User.updateOne({ email: 'admin@upload.test' }, { role: 'admin' });
  adminToken = adminReg.body.accessToken;

  const customerReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Customer User', email: 'customer@upload.test', password: 'Password123' });
  customerToken = customerReg.body.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─── POST /api/upload/signature ───────────────────────────────────────────────

describe('POST /api/upload/signature', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/upload/signature').send({});
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('returns 200 with Supabase upload params for admin', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.signedUrl).toBe(MOCK_SIGNED_URL);
    expect(res.body.publicUrl).toBe(MOCK_PUBLIC_URL);
    expect(typeof res.body.path).toBe('string');
  });

  it('response shape includes all required upload fields', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        signedUrl: expect.any(String),
        path: expect.any(String),
        publicUrl: expect.any(String),
      })
    );
  });

  it('path uses default folder shopv1/products when none provided', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const supabase = require('../config/supabase').default;
    const mockFrom = supabase.storage.from as jest.Mock;
    mockFrom.mockClear();

    await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(mockFrom).toHaveBeenCalledWith('Products');
    const bucket = mockFrom.mock.results[0].value as typeof mockFrom.mock.results[0]['value'];
    expect(bucket.createSignedUploadUrl).toHaveBeenCalledWith(
      expect.stringContaining('shopv1/products/')
    );
  });

  it('path uses custom folder from request body', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const supabase = require('../config/supabase').default;
    const mockFrom = supabase.storage.from as jest.Mock;
    mockFrom.mockClear();

    await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ folder: 'shopv1/avatars' });

    const bucket = mockFrom.mock.results[0].value as typeof mockFrom.mock.results[0]['value'];
    expect(bucket.createSignedUploadUrl).toHaveBeenCalledWith(
      expect.stringContaining('shopv1/avatars/')
    );
  });
});
