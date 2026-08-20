import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';

let adminToken: string;
let customerToken: string;

const BASE_PRODUCT = {
  name: 'Classic Tee',
  description: 'A comfortable everyday t-shirt',
  priceInCents: 2999,
  category: 'shirt',
  gender: 'men',
  brand: 'ShopBrand',
  images: [{ url: 'https://example.com/shirt.jpg', publicId: 'shopv1/products/shirt' }],
  variants: [
    { size: 'M', color: 'Black', colorHex: '#000000', stock: 10, reservedStock: 0, sku: 'SHIRT-M-BLK' },
  ],
  tags: ['casual'],
  isFeatured: false,
  isActive: true,
};

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
    .send({ name: 'Admin User', email: 'admin@product.test', password: 'Password123' });
  await prisma.user.update({ where: { email: 'admin@product.test' }, data: { role: 'admin' } });
  adminToken = adminReg.body.accessToken;

  const customerReg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Customer User', email: 'customer@product.test', password: 'Password123' });
  customerToken = customerReg.body.accessToken;
});

afterAll(async () => {
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Seed a product directly into PostgreSQL (bypasses auth middleware). */
const seedProduct = async (overrides: Record<string, any> = {}) => {
  const merged: any = { ...BASE_PRODUCT, ...overrides };
  const { images = BASE_PRODUCT.images, variants = BASE_PRODUCT.variants, ratings, ...rest } = merged;

  const created = await prisma.product.create({
    data: {
      name: rest.name,
      description: rest.description,
      priceInCents: rest.priceInCents,
      compareAtPriceInCents: rest.compareAtPriceInCents,
      category: rest.category,
      gender: rest.gender,
      brand: rest.brand,
      tags: rest.tags || [],
      isFeatured: rest.isFeatured ?? false,
      isActive: rest.isActive ?? true,
      isDeleted: rest.isDeleted ?? false,
      deletedAt: rest.deletedAt,
      ratingAverage: ratings?.average ?? 0,
      ratingCount: ratings?.count ?? 0,
      images: {
        create: images.map((img: any, idx: number) => ({
          url: img.url,
          publicId: img.publicId || '',
          sortOrder: idx,
        })),
      },
      variants: {
        create: variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock ?? 0,
          reservedStock: v.reservedStock ?? 0,
          sku: v.sku || '',
        })),
      },
    },
    include: { images: true, variants: true },
  });

  return { ...created, _id: created.id };
};

/** POST /api/products as admin. */
const adminCreate = (overrides: Record<string, unknown> = {}) =>
  request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ ...BASE_PRODUCT, ...overrides });

// ─── GET /api/products ────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  beforeEach(async () => {
    await Promise.all([
      seedProduct({ name: 'Men Shirt', gender: 'men', category: 'shirt', priceInCents: 1999 }),
      seedProduct({ name: 'Women Hat', gender: 'women', category: 'hat', priceInCents: 3999 }),
      seedProduct({ name: 'Kids Shoe', gender: 'kids', category: 'shoe', priceInCents: 4999 }),
    ]);
  });

  it('returns 200 with paginated product list', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
    expect(res.body.pagination).toMatchObject({ page: 1, total: 3 });
  });

  it('filters by gender', async () => {
    const res = await request(app).get('/api/products?gender=men');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].gender).toBe('men');
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=hat');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].category).toBe('hat');
  });

  it('filters by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=2000&maxPrice=4500');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].priceInCents).toBe(3999);
  });

  it('filters by variant size', async () => {
    await seedProduct({
      name: 'Large Tee',
      variants: [{ size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 5, reservedStock: 0, sku: 'TEE-L-WHT' }],
    });

    const res = await request(app).get('/api/products?size=L');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Large Tee');
  });

  it('filters by brand', async () => {
    await seedProduct({ name: 'Other Brand', brand: 'OtherBrand' });

    const res = await request(app).get('/api/products?brand=ShopBrand');

    expect(res.status).toBe(200);
    expect(res.body.products.every((p: { brand: string }) => p.brand === 'ShopBrand')).toBe(true);
  });

  it('respects limit and page', async () => {
    const res = await request(app).get('/api/products?limit=2&page=1');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, pages: 2 });
  });

  it('excludes soft-deleted products automatically', async () => {
    await prisma.product.updateMany({ where: { name: 'Men Shirt' }, data: { isDeleted: true } });

    const res = await request(app).get('/api/products');

    expect(res.body.products).toHaveLength(2);
    expect(res.body.products.every((p: { name: string }) => p.name !== 'Men Shirt')).toBe(true);
  });

  it('excludes inactive products', async () => {
    await prisma.product.updateMany({ where: { name: 'Women Hat' }, data: { isActive: false } });

    const res = await request(app).get('/api/products');

    expect(res.body.pagination.total).toBe(2);
    expect(res.body.products.every((p: { name: string }) => p.name !== 'Women Hat')).toBe(true);
  });
});

// ─── GET /api/products/featured ───────────────────────────────────────────────

describe('GET /api/products/featured', () => {
  it('returns only featured and active products', async () => {
    await Promise.all([
      seedProduct({ name: 'Featured Active', isFeatured: true, isActive: true }),
      seedProduct({ name: 'Not Featured', isFeatured: false, isActive: true }),
      seedProduct({ name: 'Featured Inactive', isFeatured: true, isActive: false }),
    ]);

    const res = await request(app).get('/api/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Featured Active');
  });

  it('returns empty array when no featured products exist', async () => {
    await seedProduct({ isFeatured: false });

    const res = await request(app).get('/api/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
  });

  it('returns at most 12 featured products', async () => {
    await Promise.all(
      Array.from({ length: 15 }, (_, i) =>
        seedProduct({ name: `Featured ${i}`, isFeatured: true })
      )
    );

    const res = await request(app).get('/api/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeLessThanOrEqual(12);
  });
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  it('returns the product by id', async () => {
    const product = await seedProduct();

    const res = await request(app).get(`/api/products/${product._id}`);

    expect(res.status).toBe(200);
    expect(String(res.body.product._id)).toBe(String(product._id));
    expect(res.body.product.name).toBe(BASE_PRODUCT.name);
    expect(res.body.product.priceInCents).toBe(BASE_PRODUCT.priceInCents);
  });

  it('returns 404 for an unknown id', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app).get(`/api/products/${unknownId}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 for a soft-deleted product', async () => {
    const product = await seedProduct({ isDeleted: true });

    const res = await request(app).get(`/api/products/${product._id}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/products (Admin) ───────────────────────────────────────────────

describe('POST /api/products', () => {
  it('admin creates a product and returns 201', async () => {
    const res = await adminCreate();

    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe(BASE_PRODUCT.name);
    expect(res.body.product.priceInCents).toBe(BASE_PRODUCT.priceInCents);
    expect(res.body.product.isDeleted).toBe(false);
    expect(res.body.product.isActive).toBe(true);
  });

  it('persists priceInCents as an integer', async () => {
    const res = await adminCreate({ priceInCents: 4999 });

    expect(res.status).toBe(201);
    expect(res.body.product.priceInCents).toBe(4999);
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/products').send(BASE_PRODUCT);

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(BASE_PRODUCT);

    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await adminCreate({ name: undefined });

    expect(res.status).toBe(400);
  });
});

// ─── PUT /api/products/:id (Admin) ────────────────────────────────────────────

describe('PUT /api/products/:id', () => {
  it('admin updates product details', async () => {
    const product = await seedProduct();

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Tee', priceInCents: 3499 });

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Updated Tee');
    expect(res.body.product.priceInCents).toBe(3499);
  });

  it('returns 401 without authentication', async () => {
    const product = await seedProduct();

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ name: 'Updated Tee' });

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const product = await seedProduct();

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Updated Tee' });

    expect(res.status).toBe(403);
  });
});

// ─── PATCH /api/products/:id/soft-delete (Admin) ──────────────────────────────

describe('PATCH /api/products/:id/soft-delete', () => {
  it('soft-deletes a product, sets isDeleted=true, isActive=false, deletedAt', async () => {
    const product = await seedProduct();

    const res = await request(app)
      .patch(`/api/products/${product._id}/soft-delete`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.product.isDeleted).toBe(true);
    expect(res.body.product.isActive).toBe(false);
    expect(res.body.product.deletedAt).toBeDefined();
  });

  it('soft-deleted product disappears from public GET /api/products', async () => {
    const product = await seedProduct({ name: 'Vanishing Tee' });

    await request(app)
      .patch(`/api/products/${product._id}/soft-delete`)
      .set('Authorization', `Bearer ${adminToken}`);

    const listRes = await request(app).get('/api/products');
    expect(listRes.body.products.some((p: { name: string }) => p.name === 'Vanishing Tee')).toBe(false);
  });

  it('returns 401 without authentication', async () => {
    const product = await seedProduct();

    const res = await request(app).patch(`/api/products/${product._id}/soft-delete`);

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const product = await seedProduct();

    const res = await request(app)
      .patch(`/api/products/${product._id}/soft-delete`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });
});

// ─── PATCH /api/products/:id/restore (Admin) ──────────────────────────────────

describe('PATCH /api/products/:id/restore', () => {
  it('restores a soft-deleted product, sets isDeleted=false, isActive=true, deletedAt=null', async () => {
    const product = await seedProduct({ isDeleted: true, isActive: false, deletedAt: new Date() });

    const res = await request(app)
      .patch(`/api/products/${product._id}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.product.isDeleted).toBe(false);
    expect(res.body.product.isActive).toBe(true);
    expect(res.body.product.deletedAt).toBeNull();
  });

  it('restored product is visible in public listing', async () => {
    const product = await seedProduct({ name: 'Restored Product', isDeleted: true, isActive: false, deletedAt: new Date() });

    await request(app)
      .patch(`/api/products/${product._id}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);

    const listRes = await request(app).get('/api/products');
    expect(listRes.body.products.some((p: { name: string }) => p.name === 'Restored Product')).toBe(true);
  });

  it('returns 401 without authentication', async () => {
    const product = await seedProduct({ isDeleted: true });

    const res = await request(app).patch(`/api/products/${product._id}/restore`);

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const product = await seedProduct({ isDeleted: true });

    const res = await request(app)
      .patch(`/api/products/${product._id}/restore`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });
});

// ─── GET /api/admin/products (Admin) ──────────────────────────────────────────

describe('GET /api/admin/products', () => {
  beforeEach(async () => {
    await Promise.all([
      seedProduct({ name: 'Active Product' }),
      seedProduct({ name: 'Deleted Product', isDeleted: true, isActive: false, deletedAt: new Date() }),
    ]);
  });

  it('returns only non-deleted products by default', async () => {
    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Active Product');
  });

  it('includes deleted products when includeDeleted=true', async () => {
    const res = await request(app)
      .get('/api/admin/products?includeDeleted=true')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
  });

  it('returns pagination metadata', async () => {
    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.pagination).toMatchObject({ page: 1, limit: 20 });
    expect(typeof res.body.pagination.total).toBe('number');
  });

  it('deleted product has isDeleted=true and deletedAt set', async () => {
    const res = await request(app)
      .get('/api/admin/products?includeDeleted=true')
      .set('Authorization', `Bearer ${adminToken}`);

    const deleted = res.body.products.find((p: { name: string }) => p.name === 'Deleted Product');
    expect(deleted).toBeDefined();
    expect(deleted.isDeleted).toBe(true);
    expect(deleted.deletedAt).toBeDefined();
  });

  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/admin/products');

    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });
});
