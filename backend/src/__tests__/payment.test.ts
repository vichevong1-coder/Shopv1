import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import Product from '../models/Product';
import Order from '../models/Order';
import Cart from '../models/Cart';
import User from '../models/User';
import stripe from '../config/stripe';

// ─── Mock Stripe ──────────────────────────────────────────────────────────────
//
// The payment controller imports `stripe` from '../config/stripe' and calls:
//   stripe.paymentIntents.create(...)   — in createPaymentIntent
//   stripe.webhooks.constructEvent(...) — in stripeWebhook
//   stripe.charges.retrieve(...)        — in stripeWebhook (best-effort card info)
//
// We mock the entire module so no real HTTP calls are made to Stripe's API.
// The four Stripe test card numbers below correspond to the webhook events
// we simulate via mocked constructEvent:
//
//   Card                 Scenario             Webhook event
//   ─────────────────────────────────────────────────────────────────────
//   4242 4242 4242 4242  Successful Payment   payment_intent.succeeded
//   4000 0000 0000 0002  Insufficient Funds   payment_intent.payment_failed
//   4000 0000 0000 0005  Card Declined        payment_intent.payment_failed
//   4242 4242 4242 4241  Incorrect CVC        payment_intent.payment_failed

jest.mock('../config/stripe', () => ({
  __esModule: true,
  default: {
    paymentIntents: { create: jest.fn() },
    webhooks: { constructEvent: jest.fn() },
    charges: { retrieve: jest.fn() },
  },
}));

const mockCreate = stripe.paymentIntents.create as jest.Mock;
const mockConstructEvent = stripe.webhooks.constructEvent as jest.Mock;
const mockRetrieveCharge = stripe.charges.retrieve as jest.Mock;

// ─── Test state ───────────────────────────────────────────────────────────────

let mongoServer: MongoMemoryReplSet;
let customerToken: string;
let customerId: string;
let productId: string;
let variantId: string;

const SHIPPING = {
  street: '123 Main St',
  city: 'Phnom Penh',
  state: 'Phnom Penh',
  postalCode: '12000',
  country: 'Cambodia',
};

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
//
// MongoMemoryReplSet (single-node) is required here because finalizeOrder()
// runs inside a MongoDB session.withTransaction(), which only works on a
// replica set — not on a standalone mongod.

beforeAll(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';

  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongoServer.getUri());

  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Pay Customer', email: 'pay.customer@test.com', password: 'Password123' });
  customerToken = reg.body.accessToken;

  const user = await User.findOne({ email: 'pay.customer@test.com' }).lean();
  customerId = user!._id.toString();

  const product = await Product.create({
    name: 'Pay Test Shirt',
    description: 'Used in payment tests',
    priceInCents: 5000,
    category: 'shirt',
    gender: 'men',
    brand: 'TestBrand',
    images: [{ url: 'https://example.com/pay-shirt.jpg', publicId: 'pay-shirt' }],
    variants: [
      { size: 'M', color: 'Blue', colorHex: '#0000ff', stock: 10, reservedStock: 0, sku: 'PAY-M-BLU' },
    ],
  });
  productId = product._id.toString();
  variantId = (product.variants[0] as unknown as { _id: mongoose.Types.ObjectId })._id.toString();
}, 30_000); // replica set init can take a few seconds

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Cart.deleteMany({});
  // Reset variant to full stock between tests
  await Product.updateOne(
    { _id: productId, 'variants._id': variantId },
    { $set: { 'variants.$.stock': 10, 'variants.$.reservedStock': 0 } }
  );
  jest.clearAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const placeOrder = (qty = 1) =>
  request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      items: [{ product: productId, quantity: qty, size: 'M', color: 'Blue' }],
      shippingAddress: SHIPPING,
      paymentMethod: 'stripe',
    });

const createIntent = (orderId: string) =>
  request(app)
    .post('/api/payment/stripe/create-payment-intent')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ orderId });

/**
 * Sends a raw POST to the Stripe webhook endpoint.
 * The body is irrelevant — constructEvent is mocked, so we just need the header.
 */
const fireWebhook = (event: object) =>
  request(app)
    .post('/api/payment/stripe/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', 'mock_sig')
    .send(JSON.stringify(event));

const getVariant = async () => {
  const product = await Product.findById(productId).lean();
  return product!.variants.find(
    (v) => (v as unknown as { _id: { toString(): string } })._id.toString() === variantId
  )!;
};

/** payment_intent.succeeded — produced by card 4242 4242 4242 4242 */
const succeededEvent = (paymentIntentId: string, orderId: string, chargeId = 'ch_test_ok') => ({
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: paymentIntentId,
      latest_charge: chargeId,
      metadata: { orderId },
    },
  },
});

/**
 * payment_intent.payment_failed — produced by declined test cards:
 *   4000 0000 0000 0002  → decline_code: insufficient_funds
 *   4000 0000 0000 0005  → decline_code: card_declined
 *   4242 4242 4242 4241  → decline_code: incorrect_cvc
 */
const failedEvent = (paymentIntentId: string, orderId: string, declineCode: string) => ({
  type: 'payment_intent.payment_failed',
  data: {
    object: {
      id: paymentIntentId,
      metadata: { orderId },
      last_payment_error: { decline_code: declineCode, code: 'card_declined' },
    },
  },
});

// ─── POST /api/payment/stripe/create-payment-intent ──────────────────────────

describe('POST /api/payment/stripe/create-payment-intent', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/payment/stripe/create-payment-intent')
      .send({ orderId: new mongoose.Types.ObjectId().toString() });
    expect(res.status).toBe(401);
  });

  it('returns 404 when the order does not exist', async () => {
    const res = await createIntent(new mongoose.Types.ObjectId().toString());
    expect(res.status).toBe(404);
  });

  it('returns 403 when the order belongs to a different user', async () => {
    // Create a second user and place an order with them
    const otherReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other User', email: 'other.pay@test.com', password: 'Password123' });
    const otherToken = otherReg.body.accessToken;

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        items: [{ product: productId, quantity: 1, size: 'M', color: 'Blue' }],
        shippingAddress: SHIPPING,
        paymentMethod: 'stripe',
      });
    const orderId = orderRes.body.order._id;

    // Customer tries to pay for someone else's order
    const res = await createIntent(orderId);
    expect(res.status).toBe(403);
  });

  it('returns 400 when the order is already paid', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id;
    await Order.findByIdAndUpdate(orderId, { paymentProcessed: true });

    const res = await createIntent(orderId);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already paid/i);
  });

  it('returns clientSecret and persists stripePaymentIntentId on the order', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'pi_test_abc123',
      client_secret: 'pi_test_abc123_secret_xyz',
    });

    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id;

    const res = await createIntent(orderId);
    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe('pi_test_abc123_secret_xyz');

    const order = await Order.findById(orderId).lean();
    expect(order!.stripePaymentIntentId).toBe('pi_test_abc123');
    expect(order!.paymentResult?.stripePaymentIntentId).toBe('pi_test_abc123');
  });

  it('calls stripe.paymentIntents.create with the order total in cents', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'pi_amount_check', client_secret: 'secret' });

    const orderRes = await placeOrder(3); // qty=3, priceInCents=5000 → 15000 + tax
    const orderId = orderRes.body.order._id;
    const { totalAmountInCents } = orderRes.body.order;

    await createIntent(orderId);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: totalAmountInCents,
        currency: 'usd',
        metadata: expect.objectContaining({ orderId }),
      })
    );
  });
});

// ─── POST /api/payment/stripe/webhook ─────────────────────────────────────────

describe('POST /api/payment/stripe/webhook', () => {
  it('returns 400 when the Stripe signature is invalid', async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const res = await fireWebhook({ type: 'payment_intent.succeeded' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/signature verification failed/i);
  });

  // ── Successful Payment ── card: 4242 4242 4242 4242 ───────────────────────
  //
  // Stripe sends payment_intent.succeeded. Server should:
  //   - set paymentProcessed = true, orderStatus = confirmed
  //   - call finalizeStock (stock -qty, reservedStock -qty)
  //   - clear the user's cart
  //   - save card brand + last4 from charge retrieval

  it('[4242 4242 4242 4242] succeeded: confirms order, finalizes stock, clears cart', async () => {
    const orderRes = await placeOrder(2); // reservedStock → 2, stock stays 10
    const orderId = orderRes.body.order._id;
    await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: 'pi_success' });

    // Seed the user's cart to verify it gets cleared
    await Cart.create({
      user: new mongoose.Types.ObjectId(customerId),
      items: [{ product: new mongoose.Types.ObjectId(productId), size: 'M', color: 'Blue', quantity: 2, priceInCents: 5000 }],
    });

    mockRetrieveCharge.mockResolvedValueOnce({
      payment_method_details: { card: { brand: 'visa', last4: '4242' } },
    });

    const event = succeededEvent('pi_success', orderId);
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const order = await Order.findById(orderId).lean();
    expect(order!.paymentProcessed).toBe(true);
    expect(order!.orderStatus).toBe('confirmed');
    expect(order!.paymentResult?.status).toBe('succeeded');
    expect(order!.paymentResult?.paidAt).toBeDefined();
    expect(order!.paymentResult?.cardBrand).toBe('visa');
    expect(order!.paymentResult?.cardLast4).toBe('4242');

    // Stock finalized: stock 10 - 2 = 8, reservedStock 2 - 2 = 0
    const variant = await getVariant();
    expect(variant.stock).toBe(8);
    expect(variant.reservedStock).toBe(0);

    // Cart cleared
    const cart = await Cart.findOne({ user: customerId }).lean();
    expect(cart!.items).toHaveLength(0);
  });

  // ── Insufficient Funds ── card: 4000 0000 0000 0002 ──────────────────────
  //
  // Stripe sends payment_intent.payment_failed. Server acknowledges the event
  // but takes no action — order stays pending, stock stays reserved (cron
  // releases stale reservations after 15 min).

  it('[4000 0000 0000 0002] insufficient_funds: acknowledges webhook, order stays pending', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id;

    const event = failedEvent('pi_fail_funds', orderId, 'insufficient_funds');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const order = await Order.findById(orderId).lean();
    expect(order!.paymentProcessed).toBe(false);
    expect(order!.orderStatus).toBe('pending');

    // Reserved stock is NOT released — cron handles stale reservations
    const variant = await getVariant();
    expect(variant.reservedStock).toBe(1);
  });

  // ── Card Declined ── card: 4000 0000 0000 0005 ────────────────────────────

  it('[4000 0000 0000 0005] card_declined: acknowledges webhook, order stays pending', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id;

    const event = failedEvent('pi_fail_decline', orderId, 'card_declined');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);

    const order = await Order.findById(orderId).lean();
    expect(order!.paymentProcessed).toBe(false);
    expect(order!.orderStatus).toBe('pending');
  });

  // ── Incorrect CVC ── card: 4242 4242 4242 4241 ────────────────────────────

  it('[4242 4242 4242 4241] incorrect_cvc: acknowledges webhook, order stays pending', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id;

    const event = failedEvent('pi_fail_cvc', orderId, 'incorrect_cvc');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);

    const order = await Order.findById(orderId).lean();
    expect(order!.paymentProcessed).toBe(false);
    expect(order!.orderStatus).toBe('pending');
  });

  // ── Idempotency ───────────────────────────────────────────────────────────
  //
  // Bakong and Stripe webhooks can fire multiple times. finalizeOrder() checks
  // paymentProcessed before starting the transaction, and re-checks inside the
  // transaction to handle concurrent calls. Stock must only be decremented once.

  it('is idempotent: firing payment_intent.succeeded twice does not double-process', async () => {
    const orderRes = await placeOrder(2);
    const orderId = orderRes.body.order._id;
    await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: 'pi_idem' });

    mockRetrieveCharge.mockResolvedValue({
      payment_method_details: { card: { brand: 'visa', last4: '4242' } },
    });

    const event = succeededEvent('pi_idem', orderId);
    mockConstructEvent.mockReturnValue(event); // allow multiple calls

    await fireWebhook(event);
    await fireWebhook(event); // second call — should be a no-op

    const order = await Order.findById(orderId).lean();
    expect(order!.paymentProcessed).toBe(true);
    expect(order!.orderStatus).toBe('confirmed');

    // stock finalized exactly once: 10 - 2 = 8
    const variant = await getVariant();
    expect(variant.stock).toBe(8);
    expect(variant.reservedStock).toBe(0);
  });

  it('ignores unknown event types gracefully', async () => {
    const event = { type: 'customer.created', data: { object: {} } };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });
});
