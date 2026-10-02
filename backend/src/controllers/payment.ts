import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr';
import stripe from '../config/stripe';
import prisma from '../config/prisma';
import { ReservationItem } from '../utils/inventory';
import { sendOrderConfirmationEmail } from '../utils/email';

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

/**
 * Idempotent order finalizer — called by both Stripe webhook and Bakong
 * webhook/poll. Safe to call multiple times; exits early if already processed.
 */
const finalizeOrder = async (orderId: string): Promise<void> => {
  // Step 1: pre-check idempotency
  const orderCheck = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!orderCheck || orderCheck.paymentProcessed) return;

  // Step 2: build reservation items by looking up variant IDs
  const reservationItems: ReservationItem[] = [];
  for (const item of orderCheck.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true },
    });
    if (!product) continue;

    const variant = product.variants.find(
      (v) =>
        v.size.toLowerCase() === item.size.toLowerCase() &&
        v.color.toLowerCase() === item.color.toLowerCase()
    );
    if (!variant) continue;

    reservationItems.push({
      productId: item.productId,
      variantId: variant.id,
      quantity: item.quantity,
    });
  }

  // Step 3: transaction — mark order + finalize stock + clear cart atomically
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.paymentProcessed) return;

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentProcessed: true,
        orderStatus: 'confirmed',
        paidAt: new Date(),
      },
    });

    if (reservationItems.length > 0) {
      for (const { variantId, quantity } of reservationItems) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stock: { decrement: quantity },
            reservedStock: { decrement: quantity },
          },
        });
      }
    }

    const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  });

  // Step 4: send confirmation email after the transaction commits
  const user = await prisma.user.findUnique({ where: { id: orderCheck.userId } });
  if (user?.email) {
    sendOrderConfirmationEmail(user.email, orderCheck.orderNumber).catch(() => {
      console.error(`Failed to send order confirmation email for ${orderCheck.orderNumber}`);
    });
  }
};

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

/** POST /api/payment/stripe/create-payment-intent */
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body as { orderId: string };

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.paymentProcessed) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmountInCents,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        userId: req.user!.userId,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payment/stripe/webhook
 */
export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ message: `Webhook signature verification failed: ${(err as Error).message}` });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        await finalizeOrder(orderId);

        const chargeId = typeof paymentIntent.latest_charge === 'string'
          ? paymentIntent.latest_charge
          : (paymentIntent.latest_charge as { id?: string } | null)?.id;
        if (chargeId) {
          try {
            const charge = await stripe.charges.retrieve(chargeId);
            const card = charge.payment_method_details?.card;
            if (card?.brand && card?.last4) {
              await prisma.order.update({
                where: { id: orderId },
                data: {
                  stripeChargeId: chargeId,
                  cardBrand: card.brand,
                  cardLast4: card.last4,
                },
              });
            }
          } catch {
            // Non-critical
          }
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Bakong KHQR
// ---------------------------------------------------------------------------

/** POST /api/payment/bakong/create-qr */
export const createBakongQR = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body as { orderId: string };

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.paymentProcessed) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const currency =
      process.env.BAKONG_CURRENCY === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd;

    const info = new IndividualInfo(
      process.env.BAKONG_MERCHANT_ID!,
      process.env.BAKONG_ACQUIRER_ID!,
      'Phnom Penh',
      {
        currency,
        amount: 0.01, // DEV DEMO PRICE: Hardcoded to $0.01 for safe real-money CV demo
        billNumber: order.orderNumber,
      }
    );

    const khqr = new BakongKHQR();
    const result = khqr.generateIndividual(info);

    if (result.status.code !== 0) {
      console.error('KHQR Generation Failed:', result.status);
      return res.status(500).json({ message: 'Failed to generate KHQR code', details: result.status });
    }

    const qrString = result.data.qr;
    const bakongRef = result.data.md5;

    await prisma.order.update({
      where: { id: order.id },
      data: { bakongRef },
    });

    res.json({ qrString, bakongRef });
  } catch (err) {
    next(err);
  }
};

/** GET /api/payment/bakong/status/:bakongRef */
export const getBakongStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bakongRef = req.params.bakongRef as string;

    const order = await prisma.order.findFirst({ where: { bakongRef } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentProcessed) {
      return res.json({ status: 'paid' });
    }

    try {
      const { data } = await axios.get(
        'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5',
        {
          params: { md5: bakongRef },
          headers: { Authorization: `Bearer ${process.env.BAKONG_API_TOKEN}` },
        }
      );

      if (data?.responseCode === 0) {
        await finalizeOrder(order.id);
        return res.json({ status: 'paid' });
      }
    } catch (apiError) {
      // NBC API frequently returns 404 for unverified accounts or missing tokens.
      // We swallow this error and return 'pending', relying on the webhook or dev simulate button instead.
      console.warn(`Bakong API Check Failed for ${bakongRef}:`, (apiError as any).message);
    }

    res.json({ status: 'pending' });
  } catch (err) {
    next(err);
  }
};

/** POST /api/payment/bakong/webhook */
export const bakongWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bakongRef = req.body?.bakongRef as string | undefined;

    if (bakongRef) {
      const order = await prisma.order.findFirst({ where: { bakongRef } });
      if (order) {
        await finalizeOrder(order.id);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};
