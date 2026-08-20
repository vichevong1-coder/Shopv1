import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

const formatCartItem = (item: any) => ({
  _id: item.id,
  id: item.id,
  product: {
    _id: item.product.id,
    id: item.product.id,
    name: item.product.name,
    images: item.product.images || [],
    isDeleted: item.product.isDeleted,
  },
  size: item.variantSize,
  color: item.variantColor,
  quantity: item.quantity,
  priceInCents: item.priceInCents,
});

/** GET /api/cart */
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    res.json({ items: (cart?.items || []).map(formatCartItem) });
  } catch (err) {
    next(err);
  }
};

/** POST /api/cart/add */
export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { productId, size, color, quantity = 1 } = req.body as {
      productId: string;
      size: string;
      color: string;
      quantity?: number;
    };

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantSize: size,
        variantColor: color,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantSize: size,
          variantColor: color,
          quantity,
          priceInCents: product.priceInCents,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    res.json({ items: (updatedCart?.items || []).map(formatCartItem) });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/cart/update */
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { itemId, quantity } = req.body as { itemId: string; quantity: number };

    if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    res.json({ items: (updatedCart?.items || []).map(formatCartItem) });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/cart/remove/:itemId */
export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const itemId = req.params.itemId as string;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    res.json({ items: (updatedCart?.items || []).map(formatCartItem) });
  } catch (err) {
    next(err);
  }
};

/** POST /api/cart/merge */
export const mergeCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const guestItems = (req.body.items ?? []) as {
      productId: string;
      size: string;
      color: string;
      quantity: number;
    }[];

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    for (const guest of guestItems) {
      const existing = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: guest.productId,
          variantSize: guest.size,
          variantColor: guest.color,
        },
      });

      if (existing) {
        if (guest.quantity > existing.quantity) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: guest.quantity },
          });
        }
      } else {
        const product = await prisma.product.findUnique({
          where: { id: guest.productId },
        });

        if (product) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: guest.productId,
              variantSize: guest.size,
              variantColor: guest.color,
              quantity: guest.quantity,
              priceInCents: product.priceInCents,
            },
          });
        }
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    res.json({ items: (updatedCart?.items || []).map(formatCartItem) });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/cart/clear */
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
};
