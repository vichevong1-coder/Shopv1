import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr';
import stripe from '../config/stripe';
import Order from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import User from '../models/User';
import { finalizeStock, ReservationItem } from '../utils/inventory';
import { sendOrderConfirmationEmail } from '../utils/email';

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

/**
 * Idempotent order finalizer — called by both Stripe webhook and Bakong
 * webhook/poll. Safe to call multiple times; exits early if already processed.
 */
const finalizeOrder = async (orderId: string | mongoose.Types.ObjectId): Promise<void> => {
  // Step 1: pre-check idempotency (no session needed for the check)
  const orderCheck = await Order.findById(orderId);
  if (!orderCheck || orderCheck.paymentProcessed) return;

  // Step 2: build reservation items by looking up variant IDs from products
  const reservationItems: ReservationItem[] = [];
  for (const item of orderCheck.items) {
    // Bypass the soft-delete pre-find hook so we can finalize even if a
    // product was soft-deleted after the order was placed.
    const product = await Product.findOne({
      _id: item.product,
      isDeleted: { $in: [true, false, null] },
    });
    if (!product) continue;

    const variant = product.variants.find(
      (v) => v.size === item.size && v.color === item.color
    );
    if (!variant) continue;

    reservationItems.push({
      productId: item.product.toString(),
      variantId: (variant as unknown as { _id: mongoose.Types.ObjectId })._id.toString(),
      quantity: item.quantity,
    });
  }

  // Step 3: transaction — mark order + finalize stock + clear cart atomically
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      // Re-check inside the transaction to handle concurrent finalize calls
      if (!order || order.paymentProcessed) return;

      order.paymentProcessed = true;
      order.orderStatus = 'confirmed';
      if (!order.paymentResult) order.paymentResult = {};
      order.paymentResult.status = 'succeeded';
      order.paymentResult.paidAt = new Date();
      await order.save({ session });

      if (reservationItems.length > 0) {
        await finalizeStock(reservationItems, session);
      }

      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [] } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  // Step 4: send confirmation email after the transaction commits
  const user = await User.findById(orderCheck.user);
  if (user?.email) {
    sendOrderConfirmationEmail(user.email, orderCheck.orderNumber).catch(() => {
      // Non-critical — log but don't bubble up
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

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.paymentProcessed) {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmountInCents,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user!.userId,
      },
    });

    order.stripePaymentIntentId = paymentIntent.id;
    order.paymentResult = { ...order.paymentResult, stripePaymentIntentId: paymentIntent.id };
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payment/stripe/webhook
 * Registered in app.ts BEFORE express.json() using express.raw().
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

        // Save card brand + last4 for receipt display — non-critical, best-effort
        const chargeId = typeof paymentIntent.latest_charge === 'string'
          ? paymentIntent.latest_charge
          : (paymentIntent.latest_charge as { id?: string } | null)?.id;
        if (chargeId) {
          try {
            const charge = await stripe.charges.retrieve(chargeId);
            const card = charge.payment_method_details?.card;
            if (card?.brand && card?.last4) {
              await Order.findByIdAndUpdate(orderId, {
                $set: {
                  'paymentResult.cardBrand': card.brand,
                  'paymentResult.cardLast4': card.last4,
                },
              });
            }
          } catch {
            // Non-critical — don't fail the webhook if charge retrieval fails
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

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user!.userId) {
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
        amount: order.totalAmountInCents / 100,
        billNumber: order.orderNumber,
        expirationTimestamp: (Date.now() + 15 * 60 * 1000) as unknown as string,
      }
    );

    const khqr = new BakongKHQR();
    const result = khqr.generateIndividual(info);

    if (result.status.code !== 0) {
      return res.status(500).json({ message: 'Failed to generate KHQR code' });
    }

    const qrString = result.data.qr;
    const bakongRef = result.data.md5;

    order.bakongRef = bakongRef;
    await order.save();

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
    const { bakongRef } = req.params;

    const order = await Order.findOne({ bakongRef });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentProcessed) {
      return res.json({ status: 'paid' });
    }

    const { data } = await axios.get(
      'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5',
      {
        params: { md5: bakongRef },
        headers: { Authorization: `Bearer ${process.env.BAKONG_API_TOKEN}` },
      }
    );

    if (data?.responseCode === 0) {
      await finalizeOrder(order._id);
      return res.json({ status: 'paid' });
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
      const order = await Order.findOne({ bakongRef });
      if (order) {
        await finalizeOrder(order._id);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};
