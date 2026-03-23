import { Request, Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

/** GET /api/cart */
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await Cart.findOne({ user: req.user!.userId })
      .populate('items.product', 'name images isDeleted')
      .lean();

    res.json({ items: cart?.items ?? [] });
  } catch (err) {
    next(err);
  }
};

/** POST /api/cart/add */
export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body as {
      productId: string;
      size: string;
      color: string;
      quantity?: number;
    };

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const priceInCents = product.priceInCents;

    let cart = await Cart.findOne({ user: req.user!.userId });

    if (!cart) {
      cart = new Cart({ user: req.user!.userId, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingIdx !== -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, size, color, quantity, priceInCents } as never);
    }

    await cart.save();

    const populated = await cart.populate('items.product', 'name images isDeleted');
    res.json({ items: populated.items });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/cart/update */
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId, quantity } = req.body as { itemId: string; quantity: number };

    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

    const cart = await Cart.findOneAndUpdate(
      { user: req.user!.userId, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { returnDocument: 'after' }
    ).populate('items.product', 'name images isDeleted');

    if (!cart) return res.status(404).json({ message: 'Cart item not found' });

    res.json({ items: cart.items });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/cart/remove/:itemId */
export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { user: req.user!.userId },
      { $pull: { items: { _id: itemId } } },
      { returnDocument: 'after' }
    ).populate('items.product', 'name images isDeleted');

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    res.json({ items: cart.items });
  } catch (err) {
    next(err);
  }
};

/** POST /api/cart/merge — union guest cart into DB cart on login */
export const mergeCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guestItems = (req.body.items ?? []) as {
      productId: string;
      size: string;
      color: string;
      quantity: number;
    }[];

    let cart = await Cart.findOne({ user: req.user!.userId });
    if (!cart) {
      cart = new Cart({ user: req.user!.userId, items: [] });
    }

    for (const guest of guestItems) {
      const dbIdx = cart.items.findIndex(
        (i) =>
          i.product.toString() === guest.productId &&
          i.size === guest.size &&
          i.color === guest.color
      );

      if (dbIdx !== -1) {
        // Higher quantity wins; DB price stays
        if (guest.quantity > cart.items[dbIdx].quantity) {
          cart.items[dbIdx].quantity = guest.quantity;
        }
      } else {
        const product = await Product.findById(guest.productId).lean();
        if (product) {
          cart.items.push({
            product: guest.productId,
            size: guest.size,
            color: guest.color,
            quantity: guest.quantity,
            priceInCents: product.priceInCents,
          } as never);
        }
      }
    }

    await cart.save();
    const populated = await cart.populate('items.product', 'name images isDeleted');
    res.json({ items: populated.items });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/cart/clear */
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user!.userId },
      { $set: { items: [] } },
      { upsert: true }
    );

    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
};
