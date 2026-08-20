import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const adminReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin User', email: 'admin@upload.test', password: 'Password123' });
  await prisma.user.update({ where: { email: 'admin@upload.test' }, data: { role: 'admin' } });
  adminToken = adminReg.body.accessToken;

  const customerReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Customer User', email: 'customer@upload.test', password: 'Password123' });
  customerToken = customerReg.body.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
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

  it('returns 200 with upload params for admin', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.signedUrl).toContain('/api/upload/file/');
    expect(res.body.publicUrl).toContain('/uploads/');
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

  it('path uses custom folder from request body', async () => {
    const res = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ folder: 'avatars' });

    expect(res.status).toBe(200);
    expect(res.body.path).toMatch(/^avatars\//);
  });

  it('accepts file upload via PUT /api/upload/file/*', async () => {
    const sigRes = await request(app)
      .post('/api/upload/signature')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ folder: 'test-uploads' });

    const filePath = sigRes.body.path;
    const buffer = Buffer.from('fake image content');

    const uploadRes = await request(app)
      .put(`/api/upload/file/${encodeURIComponent(filePath)}`)
      .set('Content-Type', 'image/png')
      .send(buffer);

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.message).toMatch(/uploaded successfully/i);
  });
});
