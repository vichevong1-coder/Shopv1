import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/User';
import cloudinary from '../config/cloudinary';

jest.mock('../config/cloudinary', () => ({
  __esModule: true,
  default: {
    utils: {
      api_sign_request: jest.fn().mockReturnValue('mock_signature_abc123'),
    },
  },
}));

// Predictable env values so response body can be asserted
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

const mockApiSign = cloudinary.utils.api_sign_request as jest.Mock;

let mongoServer: MongoMemoryServer;
let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register admin then elevate role in DB
  const adminReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin User', email: 'admin@upload.test', password: 'Password123' });
  await User.updateOne({ email: 'admin@upload.test' }, { role: 'admin' });
  adminToken = adminReg.body.accessToken;

  // Register customer (default role)
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

  it('returns 200 with signature payload for admin', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.signature).toBe('mock_signature_abc123');
    expect(res.body.cloudName).toBe('test-cloud');
    expect(res.body.apiKey).toBe('test-api-key');
  });

  it('uses default folder shopv1/products when none provided', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.folder).toBe('shopv1/products');
  });

  it('uses custom folder from request body', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ folder: 'shopv1/avatars' });

    expect(res.status).toBe(200);
    expect(res.body.folder).toBe('shopv1/avatars');
  });

  it('timestamp is a current unix timestamp (in seconds)', async () => {
    const before = Math.floor(Date.now() / 1000);

    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    const after = Math.ceil(Date.now() / 1000);

    expect(res.status).toBe(200);
    expect(typeof res.body.timestamp).toBe('number');
    expect(res.body.timestamp).toBeGreaterThanOrEqual(before);
    expect(res.body.timestamp).toBeLessThanOrEqual(after);
  });

  it('response shape includes all required Cloudinary upload fields', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        signature: expect.any(String),
        timestamp: expect.any(Number),
        folder: expect.any(String),
        cloudName: expect.any(String),
        apiKey: expect.any(String),
      })
    );
  });

  it('calls api_sign_request with timestamp and folder', async () => {
    await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ folder: 'shopv1/custom' });

    expect(mockApiSign).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'shopv1/custom' }),
      'test-api-secret'
    );
  });

  it('calls api_sign_request with default folder when none provided', async () => {
    await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(mockApiSign).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'shopv1/products' }),
      'test-api-secret'
    );
  });
});
