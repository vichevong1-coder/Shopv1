import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import prisma from '../config/prisma';

// Mongoose Models
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Review from '../models/Review';

const APP_URL = (process.env.PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:5000').replace(/\/+$/, '');

function transformImageUrl(url: string, publicId: string): string {
  // If it is a Supabase URL, replace with self-hosted /uploads URL
  if (url && url.includes('supabase.co')) {
    const filename = publicId || url.split('/').slice(-2).join('/');
    return `${APP_URL}/uploads/${filename}`;
  }
  return url || '';
}

async function migrateUsers() {
  console.log('\n👤 Migrating Users...');
  const users = await User.find({}).lean();
  let count = 0;

  for (const rawUser of users) {
    const u = rawUser as any;
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  ℹ️ User ${u.email} already exists in Postgres. Skipping.`);
      continue;
    }

    const refreshTokens: string[] = Array.isArray(u.refreshTokens)
      ? u.refreshTokens.map((t: any) => (typeof t === 'string' ? t : t.token || ''))
      : [];

    await prisma.user.create({
      data: {
        id: u._id.toString(),
        name: u.name ?? '',
        email: u.email,
        password: u.password,
        role: u.role ?? 'customer',
        refreshTokens,
        resetPasswordToken: u.resetPasswordToken || u.passwordResetToken,
        resetPasswordExpires: u.resetPasswordExpires || u.passwordResetExpiry,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
      },
    });
    count++;
  }
  console.log(`✅ Migrated ${count}/${users.length} users.`);
}

async function migrateProducts() {
  console.log('\n📦 Migrating Products, Variants, & Images...');
  const products = await Product.find({}).lean();
  let count = 0;

  for (const rawProd of products) {
    const p = rawProd as any;
    const id = p._id.toString();
    const existing = await prisma.product.findUnique({ where: { id } });
    if (existing) {
      console.log(`  ℹ️ Product ${p.name} already exists. Skipping.`);
      continue;
    }

    const variants = (p.variants || []).map((v: any) => ({
      id: v._id ? v._id.toString() : undefined,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock ?? 0,
      reservedStock: v.reservedStock ?? 0,
      sku: v.sku ?? '',
    }));

    let sortOrder = 0;
    const images = (p.images || []).map((img: any) => ({
      url: transformImageUrl(img.url, img.publicId),
      publicId: img.publicId ?? '',
      sortOrder: sortOrder++,
    }));

    await prisma.product.create({
      data: {
        id,
        name: p.name,
        description: p.description,
        priceInCents: p.priceInCents,
        compareAtPriceInCents: p.compareAtPriceInCents,
        category: p.category,
        gender: p.gender,
        brand: p.brand,
        tags: p.tags || [],
        isFeatured: p.isFeatured ?? false,
        isActive: p.isActive ?? true,
        isDeleted: p.isDeleted ?? false,
        deletedAt: p.deletedAt,
        ratingAverage: p.ratings?.average ?? 0,
        ratingCount: p.ratings?.count ?? 0,
        ratingDist1: p.ratings?.distribution?.['1'] ?? 0,
        ratingDist2: p.ratings?.distribution?.['2'] ?? 0,
        ratingDist3: p.ratings?.distribution?.['3'] ?? 0,
        ratingDist4: p.ratings?.distribution?.['4'] ?? 0,
        ratingDist5: p.ratings?.distribution?.['5'] ?? 0,
        variants: { create: variants },
        images: { create: images },
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      },
    });
    count++;
  }
  console.log(`✅ Migrated ${count}/${products.length} products.`);
}

async function migrateOrders() {
  console.log('\n🛒 Migrating Orders & Order Items...');
  const orders = await Order.find({}).lean();
  let count = 0;

  for (const rawOrder of orders) {
    const o = rawOrder as any;
    const id = o._id.toString();
    const existing = await prisma.order.findUnique({ where: { id } });
    if (existing) {
      console.log(`  ℹ️ Order ${o.orderNumber} already exists. Skipping.`);
      continue;
    }

    const items = (o.items || []).map((item: any) => ({
      id: item._id ? item._id.toString() : undefined,
      productId: item.product.toString(),
      name: item.name,
      image: transformImageUrl(item.image, ''),
      priceInCents: item.priceInCents,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    }));

    await prisma.order.create({
      data: {
        id,
        userId: o.user.toString(),
        orderNumber: o.orderNumber,
        itemsTotalInCents: o.itemsTotalInCents ?? 0,
        shippingPriceInCents: o.shippingPriceInCents ?? 0,
        taxAmountInCents: o.taxAmountInCents ?? 0,
        totalAmountInCents: o.totalAmountInCents,
        orderStatus: o.orderStatus ?? 'pending',
        paymentMethod: o.paymentMethod ?? 'stripe',
        paymentProcessed: o.paymentProcessed ?? false,
        stripePaymentIntentId: o.paymentResult?.stripePaymentIntentId || o.stripePaymentIntentId,
        stripeChargeId: o.paymentResult?.stripeChargeId,
        cardBrand: o.paymentResult?.cardBrand,
        cardLast4: o.paymentResult?.cardLast4,
        paidAt: o.paymentResult?.paidAt,
        bakongRef: o.bakongRef,
        trackingNumber: o.trackingNumber,
        shippingStreet: o.shippingAddress?.street ?? '',
        shippingCity: o.shippingAddress?.city ?? '',
        shippingState: o.shippingAddress?.state ?? '',
        shippingPostalCode: o.shippingAddress?.postalCode ?? '',
        shippingCountry: o.shippingAddress?.country ?? '',
        shippingPhone: o.shippingAddress?.phone,
        items: { create: items },
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
      },
    });
    count++;
  }
  console.log(`✅ Migrated ${count}/${orders.length} orders.`);
}

async function migrateCarts() {
  console.log('\n🛍️ Migrating Carts...');
  const carts = await Cart.find({}).lean();
  let count = 0;

  for (const rawCart of carts) {
    const c = rawCart as any;
    const userId = c.user.toString();
    const existing = await prisma.cart.findUnique({ where: { userId } });
    if (existing) continue;

    const items = (c.items || []).map((item: any) => ({
      productId: item.product.toString(),
      variantSize: item.variantSize,
      variantColor: item.variantColor,
      quantity: item.quantity,
      priceInCents: item.priceInCents ?? 0,
    }));

    await prisma.cart.create({
      data: {
        id: c._id.toString(),
        userId,
        items: { create: items },
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      },
    });
    count++;
  }
  console.log(`✅ Migrated ${count}/${carts.length} carts.`);
}

async function migrateReviews() {
  console.log('\n⭐ Migrating Reviews...');
  const reviews = await Review.find({}).lean();
  let count = 0;

  for (const rawReview of reviews) {
    const r = rawReview as any;
    const id = r._id.toString();
    const existing = await prisma.review.findUnique({ where: { id } });
    if (existing) continue;

    await prisma.review.create({
      data: {
        id,
        userId: r.user.toString(),
        productId: r.product.toString(),
        rating: r.rating,
        title: r.title ?? '',
        comment: r.comment ?? '',
        verifiedPurchase: r.isVerifiedPurchase ?? r.verifiedPurchase ?? false,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      },
    });
    count++;
  }
  console.log(`✅ Migrated ${count}/${reviews.length} reviews.`);
}

async function main() {
  console.log('=====================================================');
  console.log('🔄 MONGODB ATLAS ➔ POSTGRESQL MIGRATION SCRIPT');
  console.log('=====================================================');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not set');

  console.log('Connecting to MongoDB Atlas (READ ONLY)...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.\n');

  await migrateUsers();
  await migrateProducts();
  await migrateOrders();
  await migrateCarts();
  await migrateReviews();

  await mongoose.disconnect();
  console.log('\n=====================================================');
  console.log('🎉 Full Migration Complete!');
  console.log('=====================================================');
}

main()
  .catch((err) => {
    console.error('💥 Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
