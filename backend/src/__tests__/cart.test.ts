import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import Product from '../models/Product';
import Cart from '../models/Cart';

let mongoServer: MongoMemoryServer;
let token: string;
let productId: string;

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register + login once; token persists for all tests
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Cart User', email: 'cart@test.com', password: 'Password123' });
  token = reg.body.accessToken;

  // Create product directly (product creation requires admin in the API)
  const product = await Product.create({
    name: 'Test Shirt',
    description: 'A comfortable test shirt',
    priceInCents: 2999,
    category: 'shirt',
    gender: 'men',
    brand: 'TestBrand',
    images: [{ url: 'https://example.com/img.jpg', publicId: 'img123' }],
    variants: [
      { size: 'M', color: 'Black', colorHex: '#000000', stock: 20, reservedStock: 0, sku: 'TEST-M-BLK' },
      { size: 'L', color: 'Black', colorHex: '#000000', stock: 10, reservedStock: 0, sku: 'TEST-L-BLK' },
    ],
  });
  productId = product._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Cart.deleteMany({});
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Authenticated request — must pick an HTTP method first, then chain .send() */
const auth = (method: 'get' | 'post' | 'put' | 'delete', path: string) =>
  request(app)[method](path).set('Authorization', `Bearer ${token}`);

const addM = (qty = 1) =>
  auth('post', '/api/cart/add').send({ productId, size: 'M', color: 'Black', quantity: qty });

// ─── GET /api/cart ────────────────────────────────────────────────────────────

describe('GET /api/cart', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('returns an empty items array for a new user', async () => {
    const res = await auth('get', '/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it('returns populated items after adding to cart', async () => {
    await addM(2);
    const res = await auth('get', '/api/cart');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });
});

// ─── POST /api/cart/add ───────────────────────────────────────────────────────

describe('POST /api/cart/add', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .send({ productId, size: 'M', color: 'Black', quantity: 1 });
    expect(res.status).toBe(401);
  });

  it('adds a new item and returns it with DB price', async () => {
    const res = await addM(1);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].priceInCents).toBe(2999); // server-side price enforced
    expect(res.body.items[0].quantity).toBe(1);
  });

  it('increments quantity when the same variant is added again', async () => {
    await addM(1);
    const res = await addM(3);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(4);
  });

  it('creates a separate line item when size differs', async () => {
    await addM(1);
    const res = await auth('post', '/api/cart/add').send({
      productId, size: 'L', color: 'Black', quantity: 1,
    });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
  });

  it('returns 404 for a non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await auth('post', '/api/cart/add').send({
      productId: fakeId, size: 'M', color: 'Black', quantity: 1,
    });
    expect(res.status).toBe(404);
  });
});

// ─── PUT /api/cart/update ─────────────────────────────────────────────────────

describe('PUT /api/cart/update', () => {
  let itemId: string;

  beforeEach(async () => {
    const res = await addM(1);
    itemId = res.body.items[0]._id;
  });

  it('updates the quantity of a cart item', async () => {
    const res = await auth('put', '/api/cart/update').send({ itemId, quantity: 7 });
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(7);
  });

  it('returns 400 when quantity is 0', async () => {
    const res = await auth('put', '/api/cart/update').send({ itemId, quantity: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 404 when itemId does not belong to the user', async () => {
    const fakeItemId = new mongoose.Types.ObjectId().toString();
    const res = await auth('put', '/api/cart/update').send({ itemId: fakeItemId, quantity: 2 });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/cart/remove/:itemId ─────────────────────────────────────────

describe('DELETE /api/cart/remove/:itemId', () => {
  it('removes the specified item and leaves others intact', async () => {
    await addM(1);
    const lRes = await auth('post', '/api/cart/add').send({
      productId, size: 'L', color: 'Black', quantity: 1,
    });
    const lItemId = lRes.body.items.find((i: { size: string }) => i.size === 'L')._id;

    const res = await auth('delete', `/api/cart/remove/${lItemId}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].size).toBe('M');
  });

  it('returns 404 when cart does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await auth('delete', `/api/cart/remove/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/cart/clear ───────────────────────────────────────────────────

describe('DELETE /api/cart/clear', () => {
  it('removes all items from the cart', async () => {
    await addM(2);
    await auth('post', '/api/cart/add').send({ productId, size: 'L', color: 'Black', quantity: 1 });

    const res = await auth('delete', '/api/cart/clear');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('returns an empty cart even when it was already empty', async () => {
    const res = await auth('delete', '/api/cart/clear');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});

// ─── POST /api/cart/merge ─────────────────────────────────────────────────────

describe('POST /api/cart/merge', () => {
  const guestItem = (qty: number) => ({
    items: [{ productId, size: 'M', color: 'Black', quantity: qty }],
  });

  it('adds guest items to an empty cart', async () => {
    const res = await auth('post', '/api/cart/merge').send(guestItem(3));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(3);
  });

  it('takes the higher quantity when guest quantity exceeds DB quantity', async () => {
    await addM(2); // DB = 2
    const res = await auth('post', '/api/cart/merge').send(guestItem(5)); // guest = 5
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('keeps DB quantity when guest quantity is lower', async () => {
    await addM(5); // DB = 5
    const res = await auth('post', '/api/cart/merge').send(guestItem(1)); // guest = 1
    expect(res.status).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('always uses the DB price regardless of guest data', async () => {
    const res = await auth('post', '/api/cart/merge').send(guestItem(1));
    expect(res.status).toBe(200);
    expect(res.body.items[0].priceInCents).toBe(2999);
  });

  it('returns empty cart when no guest items are provided', async () => {
    const res = await auth('post', '/api/cart/merge').send({ items: [] });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});
