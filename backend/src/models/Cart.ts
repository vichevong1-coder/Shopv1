import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
  priceInCents: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceInCents: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
