import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { reserveStock } from '../utils/inventory';
import type { ReservationItem } from '../utils/inventory';

interface CreateOrderBody {
  items: { product?: string; productId?: string; size: string; color: string; quantity: number }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: 'stripe' | 'bakong';
}

export const formatOrder = (order: any) => {
  if (!order) return null;
  return {
    _id: order.id,
    id: order.id,
    user: order.user || order.userId,
    orderNumber: order.orderNumber,
    itemsTotalInCents: order.itemsTotalInCents,
    shippingPriceInCents: order.shippingPriceInCents,
    taxAmountInCents: order.taxAmountInCents,
    totalAmountInCents: order.totalAmountInCents,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentProcessed: order.paymentProcessed,
    stripePaymentIntentId: order.stripePaymentIntentId,
    bakongRef: order.bakongRef,
    trackingNumber: order.trackingNumber,
    shippingAddress: {
      street: order.shippingStreet,
      city: order.shippingCity,
      state: order.shippingState,
      postalCode: order.shippingPostalCode,
      country: order.shippingCountry,
      phone: order.shippingPhone,
    },
    paymentResult: {
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeChargeId: order.stripeChargeId,
      status: order.paymentProcessed ? 'succeeded' : 'pending',
      paidAt: order.paidAt,
      cardBrand: order.cardBrand,
      cardLast4: order.cardLast4,
    },
    items: (order.items || []).map((item: any) => ({
      _id: item.id,
      id: item.id,
      product: item.productId,
      name: item.name,
      image: item.image,
      priceInCents: item.priceInCents,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/** POST /api/orders */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { items, shippingAddress, paymentMethod } = req.body as CreateOrderBody;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    if (!paymentMethod || !['stripe', 'bakong'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Valid paymentMethod (stripe|bakong) is required' });
    }

    const orderItems: any[] = [];
    const reservationItems: ReservationItem[] = [];

    for (const item of items) {
      const prodId = item.productId || item.product;
      if (!prodId) {
        return res.status(400).json({ message: 'Product ID is required for each item' });
      }

      const product = await prisma.product.findUnique({
        where: { id: prodId },
        include: {
          variants: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      });

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${prodId}` });
      }

      const variant = product.variants.find(
        (v) =>
          v.size.toLowerCase() === (item.size || '').toLowerCase() &&
          v.color.toLowerCase() === (item.color || '').toLowerCase()
      );

      if (!variant) {
        return res.status(404).json({ message: `Variant not found for size=${item.size} color=${item.color}` });
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.images[0]?.url || '',
        priceInCents: product.priceInCents,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
      });

      reservationItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
      });
    }

    const itemsTotalInCents = orderItems.reduce(
      (sum, i) => sum + i.priceInCents * i.quantity,
      0
    );
    const shippingPriceInCents = 0;
    const taxAmountInCents = Math.round(itemsTotalInCents * 0.1);
    const totalAmountInCents = itemsTotalInCents + shippingPriceInCents + taxAmountInCents;

    // Reserve stock atomically
    try {
      await reserveStock(reservationItems);
    } catch {
      return res.status(409).json({ message: 'Insufficient stock for one or more items' });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        itemsTotalInCents,
        shippingPriceInCents,
        taxAmountInCents,
        totalAmountInCents,
        orderStatus: 'pending',
        paymentMethod,
        shippingStreet: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        shippingPhone: shippingAddress.phone,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({ order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/my-orders */
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    res.json({ orders: orders.map(formatOrder) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id */
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const requestingUser = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { role: true },
    });

    const isAdmin = requestingUser?.role === 'admin';
    const isOwner = order.userId === req.user!.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders (admin) */
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) {
      where.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders: orders.map(formatOrder),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

/** PUT /api/orders/:id/status (admin) */
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, trackingNumber } = req.body as { status: string; trackingNumber?: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const id = req.params.id as string;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const dataToUpdate: any = { orderStatus: status };
    if (trackingNumber !== undefined) {
      dataToUpdate.trackingNumber = trackingNumber.trim() || null;
    }

    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: { items: true },
    });

    res.json({ order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
};
