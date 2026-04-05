import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';

let mongoServer: MongoMemoryServer;
let customerToken: string;
let secondToken: string;   // unrelated user — for 403 tests
let adminToken: string;
let productId: string;
let variantId: string;

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // --- Customer ---
  const custReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Order Customer', email: 'order.customer@test.com', password: 'Password123' });
  customerToken = custReg.body.accessToken;

  // --- Second (unrelated) customer ---
  const otherReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Other User', email: 'other@test.com', password: 'Password123' });
  secondToken = otherReg.body.accessToken;

  // --- Admin: register → promote role in DB → reuse the register token ---
  const adminReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@order.test', password: 'Password123' });
  await User.updateOne({ email: 'admin@order.test' }, { role: 'admin' });
  adminToken = adminReg.body.accessToken;

  // --- Product with stock ---
  const product = await Product.create({
    name: 'Order Test Shirt',
    description: 'Used in order tests',
    priceInCents: 4999,
    category: 'shirt',
    gender: 'men',
    brand: 'TestBrand',
    images: [{ url: 'https://example.com/shirt.jpg', publicId: 'shirt123' }],
    variants: [
      { size: 'M', color: 'White', colorHex: '#ffffff', stock: 10, reservedStock: 0, sku: 'ORDER-M-WHT' },
    ],
  });
  productId = product._id.toString();
  variantId = (product.variants[0] as unknown as { _id: mongoose.Types.ObjectId })._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear orders; keep users and product — reset variant reserved stock
  await Order.deleteMany({});
  await Product.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $set: { 'variants.$.reservedStock': 0 } }
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SHIPPING = {
  street: '123 Main St',
  city: 'Phnom Penh',
  state: 'Phnom Penh',
  postalCode: '12000',
  country: 'Cambodia',
};

const orderBody = (qty = 2, overrides: Record<string, unknown> = {}) => ({
  items: [{ product: productId, quantity: qty, size: 'M', color: 'White' }],
  shippingAddress: SHIPPING,
  paymentMethod: 'stripe',
  ...overrides,
});

const placeOrder = (qty = 2) =>
  request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send(orderBody(qty));

const getVariantStock = async () => {
  const product = await Product.findById(productId).lean();
  return product!.variants.find(
    (v) => (v as unknown as { _id: { toString(): string } })._id.toString() === variantId
  )!;
};

// ─── POST /api/orders ─────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/orders').send(orderBody());
    expect(res.status).toBe(401);
  });

  it('returns 400 when items array is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(orderBody(2, { items: [] }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least one item/i);
  });

  it('returns 400 when shippingAddress is missing', async () => {
    const { shippingAddress: _sa, ...body } = orderBody();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid paymentMethod', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(orderBody(2, { paymentMethod: 'cash' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when productId does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: fakeId, variantId, quantity: 1, size: 'M', color: 'White' }],
        shippingAddress: SHIPPING,
        paymentMethod: 'stripe',
      });
    expect(res.status).toBe(404);
  });

  it('returns 404 when variantId does not exist on the product', async () => {
    const fakeVariantId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId, variantId: fakeVariantId, quantity: 1, size: 'M', color: 'White' }],
        shippingAddress: SHIPPING,
        paymentMethod: 'stripe',
      });
    expect(res.status).toBe(404);
  });

  it('returns 201 with a valid order and auto-generated orderNumber', async () => {
    const res = await placeOrder(2);
    expect(res.status).toBe(201);
    expect(res.body.order.orderNumber).toMatch(/^ORD-\d{8}-[0-9A-F]{4}$/);
    expect(res.body.order.orderStatus).toBe('pending');
    expect(res.body.order.paymentProcessed).toBe(false);
    expect(res.body.order.paymentMethod).toBe('stripe');
  });

  it('calculates server-side totals with 10% tax and free shipping', async () => {
    const res = await placeOrder(2);
    // priceInCents=4999, qty=2 → itemsTotal=9998, tax=Math.round(9998*0.1)=1000, total=10998
    const expected = {
      itemsTotalInCents: 9998,
      shippingPriceInCents: 0,
      taxAmountInCents: Math.round(9998 * 0.1),
      totalAmountInCents: 9998 + Math.round(9998 * 0.1),
    };
    expect(res.body.order).toMatchObject(expected);
  });

  it('atomically increments reservedStock on the product variant', async () => {
    await placeOrder(3);
    const variant = await getVariantStock();
    expect(variant.reservedStock).toBe(3);
  });

  it('returns 409 when ordered quantity exceeds available stock', async () => {
    const res = await placeOrder(11); // stock=10
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  it('returns 409 when reserved stock has depleted remaining availability', async () => {
    await placeOrder(8); // 8 reserved → 2 left
    const res = await placeOrder(3); // needs 3, only 2 available
    expect(res.status).toBe(409);
  });

  it('succeeds when quantity exactly equals remaining available stock', async () => {
    await placeOrder(8); // 8 reserved → 2 left
    const res = await placeOrder(2); // exactly 2 left
    expect(res.status).toBe(201);
    const variant = await getVariantStock();
    expect(variant.reservedStock).toBe(10); // all 10 reserved
  });
});

// ─── GET /api/orders/my-orders ────────────────────────────────────────────────

describe('GET /api/orders/my-orders', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/orders/my-orders');
    expect(res.status).toBe(401);
  });

  it('returns an empty array when the user has no orders', async () => {
    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });

  it('returns all orders for the requesting user', async () => {
    await placeOrder(1);
    await placeOrder(1);

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(2);
  });

  it('returns orders sorted newest first', async () => {
    await placeOrder(1);
    await placeOrder(1);

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${customerToken}`);
    const dates = (res.body.orders as { createdAt: string }[]).map(
      (o) => new Date(o.createdAt).getTime()
    );
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
  });

  it('does not return orders belonging to other users', async () => {
    await placeOrder(1); // customer order

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${secondToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

describe('GET /api/orders/:id', () => {
  let orderId: string;

  beforeEach(async () => {
    const res = await placeOrder(1);
    orderId = res.body.order._id;
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(401);
  });

  it('returns 200 with full order for the owner', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.order._id).toBe(orderId);
    expect(res.body.order.orderNumber).toMatch(/^ORD-/);
  });

  it('returns 403 for a different non-admin user', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${secondToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 for an admin viewing any order', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.order._id).toBe(orderId);
  });

  it('returns 404 for a non-existent order ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/orders/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── GET /api/orders (admin list) ────────────────────────────────────────────

describe('GET /api/orders (admin)', () => {
  beforeEach(async () => {
    await placeOrder(1);
    await placeOrder(1);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('returns paginated orders with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/orders?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 2, pages: 1 });
  });

  it('paginates correctly with limit=1', async () => {
    const res = await request(app)
      .get('/api/orders?page=1&limit=1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ pages: 2, total: 2 });
  });

  it('filters results by orderStatus', async () => {
    // Promote one order to confirmed
    const allRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    const firstId = (allRes.body.orders as { _id: string }[])[0]._id;

    await request(app)
      .put(`/api/orders/${firstId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });

    const filtered = await request(app)
      .get('/api/orders?status=confirmed')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(filtered.status).toBe(200);
    expect(filtered.body.orders).toHaveLength(1);
    expect(filtered.body.orders[0].orderStatus).toBe('confirmed');
  });
});

// ─── PUT /api/orders/:id/status (admin) ──────────────────────────────────────

describe('PUT /api/orders/:id/status (admin)', () => {
  let orderId: string;

  beforeEach(async () => {
    const res = await placeOrder(1);
    orderId = res.body.order._id;
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin user', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'refunded' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid status/i);
  });

  it('updates orderStatus through all valid enum values', async () => {
    const statuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
    for (const status of statuses) {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.order.orderStatus).toBe(status);
    }
  });

  it('returns 404 for a non-existent order ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/orders/${fakeId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(404);
  });
});
