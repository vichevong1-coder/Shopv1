import prisma from '../config/prisma';

export interface ReservationItem {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * Atomically reserve stock for all items before payment.
 * Throws if any item cannot be reserved.
 */
export const reserveStock = async (items: ReservationItem[]): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (const { variantId, quantity } of items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant || variant.stock - variant.reservedStock < quantity) {
        throw new Error(`Insufficient stock for variant: ${variantId}`);
      }

      await tx.productVariant.update({
        where: { id: variantId },
        data: { reservedStock: { increment: quantity } },
      });
    }
  });
};

/**
 * Finalize reserved stock after successful payment.
 * Decrements both stock and reservedStock atomically.
 */
export const finalizeStock = async (items: ReservationItem[]): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (const { variantId, quantity } of items) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          stock: { decrement: quantity },
          reservedStock: { decrement: quantity },
        },
      });
    }
  });
};

/**
 * Release reserved stock on payment timeout or cancellation.
 * Decrements reservedStock only (stock stays the same).
 */
export const releaseStock = async (items: ReservationItem[]): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    for (const { variantId, quantity } of items) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          reservedStock: { decrement: quantity },
        },
      });
    }
  });
};
