import mongoose from 'mongoose';
import Product from '../models/Product';

export interface ReservationItem {
  productId: string;
  variantId: string;
  quantity: number;
}

/**
 * Atomically reserve stock for all items before payment.
 * Uses $expr to check available stock (stock - reservedStock >= quantity).
 * Throws if any item cannot be reserved.
 */
export const reserveStock = async (items: ReservationItem[]): Promise<void> => {
  const ops = items.map(({ productId, variantId, quantity }) => ({
    updateOne: {
      filter: {
        _id: new mongoose.Types.ObjectId(productId),
        'variants._id': new mongoose.Types.ObjectId(variantId),
        $expr: {
          $gte: [
            {
              $subtract: [
                { $arrayElemAt: ['$$ROOT.variants.stock', { $indexOfArray: ['$$ROOT.variants._id', { $toObjectId: variantId }] }] },
                { $arrayElemAt: ['$$ROOT.variants.reservedStock', { $indexOfArray: ['$$ROOT.variants._id', { $toObjectId: variantId }] }] },
              ],
            },
            quantity,
          ],
        },
      },
      update: { $inc: { 'variants.$.reservedStock': quantity } },
    },
  }));

  const result = await Product.bulkWrite(ops, { ordered: false });

  if (result.matchedCount < items.length) {
    throw new Error('Insufficient stock for one or more items');
  }
};

/**
 * Finalize reserved stock after successful payment.
 * Decrements both stock and reservedStock atomically.
 * Optional session for use within MongoDB transactions.
 */
export const finalizeStock = async (
  items: ReservationItem[],
  session?: mongoose.ClientSession
): Promise<void> => {
  const ops = items.map(({ productId, variantId, quantity }) => ({
    updateOne: {
      filter: {
        _id: new mongoose.Types.ObjectId(productId),
        'variants._id': new mongoose.Types.ObjectId(variantId),
      },
      update: {
        $inc: {
          'variants.$.stock': -quantity,
          'variants.$.reservedStock': -quantity,
        },
      },
    },
  }));

  await Product.bulkWrite(ops, { ordered: true, ...(session ? { session } : {}) });
};

/**
 * Release reserved stock on payment timeout or cancellation.
 * Decrements reservedStock only (stock stays the same).
 */
export const releaseStock = async (items: ReservationItem[]): Promise<void> => {
  const ops = items.map(({ productId, variantId, quantity }) => ({
    updateOne: {
      filter: {
        _id: new mongoose.Types.ObjectId(productId),
        'variants._id': new mongoose.Types.ObjectId(variantId),
      },
      update: { $inc: { 'variants.$.reservedStock': -quantity } },
    },
  }));

  await Product.bulkWrite(ops, { ordered: false });
};
