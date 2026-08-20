import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import stripe from '../config/stripe';

jest.mock('../utils/email', () => ({
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

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

beforeAll(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';

  await prisma.review.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Pay Customer', email: 'pay.customer@test.com', password: 'Password123' });
  customerToken = reg.body.accessToken;

  const user = await prisma.user.findUnique({ where: { email: 'pay.customer@test.com' } });
  customerId = user!.id;

  const product = await prisma.product.create({
    data: {
      name: 'Pay Test Shirt',
      description: 'Used in payment tests',
      priceInCents: 5000,
      category: 'shirt',
      gender: 'men',
      brand: 'TestBrand',
      images: {
        create: [{ url: 'https://example.com/pay-shirt.jpg', publicId: 'pay-shirt', sortOrder: 0 }],
      },
      variants: {
        create: [
          { size: 'M', color: 'Blue', colorHex: '#0000ff', stock: 10, reservedStock: 0, sku: 'PAY-M-BLU' },
        ],
      },
    },
    include: { variants: true },
  });
  productId = product.id;
  variantId = product.variants[0].id;
});

afterAll(async () => {
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: 10, reservedStock: 0 },
  });
  jest.clearAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const placeOrder = (qty = 1) =>
  request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      items: [{ product: productId, productId, variantId, quantity: qty, size: 'M', color: 'Blue' }],
      shippingAddress: SHIPPING,
      paymentMethod: 'stripe',
    });

const createIntent = (orderId: string) =>
  request(app)
    .post('/api/payment/stripe/create-payment-intent')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ orderId });

const fireWebhook = (event: object) =>
  request(app)
    .post('/api/payment/stripe/webhook')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', 'mock_sig')
    .send(JSON.stringify(event));

const getVariant = async () => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  return variant!;
};

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
      .send({ orderId: '00000000-0000-0000-0000-000000000000' });
    expect(res.status).toBe(401);
  });

  it('returns 404 when the order does not exist', async () => {
    const res = await createIntent('00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('returns 403 when the order belongs to a different user', async () => {
    const otherReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other User', email: 'other.pay@test.com', password: 'Password123' });
    const otherToken = otherReg.body.accessToken;

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        items: [{ product: productId, productId, quantity: 1, size: 'M', color: 'Blue' }],
        shippingAddress: SHIPPING,
        paymentMethod: 'stripe',
      });
    const orderId = orderRes.body.order._id || orderRes.body.order.id;

    const res = await createIntent(orderId);
    expect(res.status).toBe(403);
  });

  it('returns 400 when the order is already paid', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id || orderRes.body.order.id;
    await prisma.order.update({ where: { id: orderId }, data: { paymentProcessed: true } });

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
    const orderId = orderRes.body.order._id || orderRes.body.order.id;

    const res = await createIntent(orderId);
    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe('pi_test_abc123_secret_xyz');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order!.stripePaymentIntentId).toBe('pi_test_abc123');
  });

  it('calls stripe.paymentIntents.create with the order total in cents', async () => {
    mockCreate.mockResolvedValueOnce({ id: 'pi_amount_check', client_secret: 'secret' });

    const orderRes = await placeOrder(3);
    const orderId = orderRes.body.order._id || orderRes.body.order.id;
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

  it('[4242 4242 4242 4242] succeeded: confirms order, finalizes stock, clears cart', async () => {
    const orderRes = await placeOrder(2);
    const orderId = orderRes.body.order._id || orderRes.body.order.id;
    await prisma.order.update({ where: { id: orderId }, data: { stripePaymentIntentId: 'pi_success' } });

    // Seed cart
    await prisma.cart.create({
      data: {
        userId: customerId,
        items: {
          create: [{ productId, variantSize: 'M', variantColor: 'Blue', quantity: 2, priceInCents: 5000 }],
        },
      },
    });

    mockRetrieveCharge.mockResolvedValueOnce({
      payment_method_details: { card: { brand: 'visa', last4: '4242' } },
    });

    const event = succeededEvent('pi_success', orderId);
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order!.paymentProcessed).toBe(true);
    expect(order!.orderStatus).toBe('confirmed');
    expect(order!.cardBrand).toBe('visa');
    expect(order!.cardLast4).toBe('4242');

    // Stock finalized: 10 - 2 = 8, reservedStock = 0
    const variant = await getVariant();
    expect(variant.stock).toBe(8);
    expect(variant.reservedStock).toBe(0);

    // Cart cleared
    const cart = await prisma.cart.findUnique({ where: { userId: customerId }, include: { items: true } });
    expect(cart!.items).toHaveLength(0);
  });

  it('[4000 0000 0000 0002] insufficient_funds: acknowledges webhook, order stays pending', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id || orderRes.body.order.id;

    const event = failedEvent('pi_fail_funds', orderId, 'insufficient_funds');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order!.paymentProcessed).toBe(false);
    expect(order!.orderStatus).toBe('pending');

    const variant = await getVariant();
    expect(variant.reservedStock).toBe(1);
  });

  it('[4000 0000 0000 0005] card_declined: acknowledges webhook, order stays pending', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id || orderRes.body.order.id;

    const event = failedEvent('pi_fail_decline', orderId, 'card_declined');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order!.paymentProcessed).toBe(false);
    expect(order!.orderStatus).toBe('pending');
  });

  it('[4242 4242 4242 4241] incorrect_cvc: acknowledges webhook, order stays pending', async () => {
    const orderRes = await placeOrder();
    const orderId = orderRes.body.order._id || orderRes.body.order.id;

    const event = failedEvent('pi_fail_cvc', orderId, 'incorrect_cvc');
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await fireWebhook(event);
    expect(res.status).toBe(200);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order!.paymentProcessed).toBe(false);
    expect(order!.orderStatus).toBe('pending');
  });

  it('is idempotent: firing payment_intent.succeeded twice does not double-process', async () => {
    const orderRes = await placeOrder(2);
    const orderId = orderRes.body.order._id || orderRes.body.order.id;
    await prisma.order.update({ where: { id: orderId }, data: { stripePaymentIntentId: 'pi_idem' } });

    mockRetrieveCharge.mockResolvedValue({
      payment_method_details: { card: { brand: 'visa', last4: '4242' } },
    });

    const event = succeededEvent('pi_idem', orderId);
    mockConstructEvent.mockReturnValue(event);

    await fireWebhook(event);
    await fireWebhook(event);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order!.paymentProcessed).toBe(true);
    expect(order!.orderStatus).toBe('confirmed');

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
