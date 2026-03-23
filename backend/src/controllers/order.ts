import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';
import { reserveStock } from '../utils/inventory';
import type { IOrderItem } from '../models/Order';
import type { ReservationItem } from '../utils/inventory';

interface CreateOrderBody {
  items: { product: string; size: string; color: string; quantity: number }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'stripe' | 'bakong';
}

/** POST /api/orders */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    // Build order item snapshots — server-side prices, never trust client
    const orderItems: Omit<IOrderItem, '_id'>[] = [];
    const reservationItems: ReservationItem[] = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      // Resolve variant by size+color (frontend doesn't track variantId)
      const variant = product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      );
      if (!variant) {
        return res.status(404).json({ message: `Variant not found for size=${item.size} color=${item.color}` });
      }

      const variantId = (variant as unknown as { _id: { toString(): string } })._id.toString();

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url ?? '',
        priceInCents: product.priceInCents,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
      });

      reservationItems.push({
        productId: item.product,
        variantId,
        quantity: item.quantity,
      });
    }

    // Calculate totals
    const itemsTotalInCents = orderItems.reduce(
      (sum, i) => sum + i.priceInCents * i.quantity,
      0
    );
    const shippingPriceInCents = 0;
    const taxAmountInCents = Math.round(itemsTotalInCents * 0.1);
    const totalAmountInCents = itemsTotalInCents + shippingPriceInCents + taxAmountInCents;

    // Reserve stock before creating the order
    try {
      await reserveStock(reservationItems);
    } catch {
      return res.status(409).json({ message: 'Insufficient stock for one or more items' });
    }

    const order = await Order.create({
      user: req.user!.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsTotalInCents,
      shippingPriceInCents,
      taxAmountInCents,
      totalAmountInCents,
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/my-orders */
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ user: req.user!.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id */
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const requestingUser = await User.findById(req.user!.userId).lean();
    const isAdmin = requestingUser?.role === 'admin';
    const isOwner = order.user.toString() === req.user!.userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ order });
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

    const filter: Record<string, unknown> = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
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
    const { status } = req.body as { status: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order });
  } catch (err) {
    next(err);
  }
};
