import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  priceInCents: number;
  size: string;
  color: string;
  quantity: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface IPaymentResult {
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status?: string;
  paidAt?: Date;
  cardBrand?: string;
  cardLast4?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentResult: IPaymentResult;
  itemsTotalInCents: number;
  shippingPriceInCents: number;
  taxAmountInCents: number;
  totalAmountInCents: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'stripe' | 'bakong';
  paymentProcessed: boolean;
  stripePaymentIntentId?: string;
  bakongRef?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    priceInCents: { type: Number, required: true, min: 0 },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const paymentResultSchema = new Schema<IPaymentResult>(
  {
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },
    status: { type: String },
    paidAt: { type: Date },
    cardBrand: { type: String },
    cardLast4: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentResult: { type: paymentResultSchema, default: {} },
    itemsTotalInCents: { type: Number, required: true, min: 0 },
    shippingPriceInCents: { type: Number, required: true, min: 0, default: 0 },
    taxAmountInCents: { type: Number, required: true, min: 0 },
    totalAmountInCents: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'bakong'],
      required: true,
    },
    paymentProcessed: { type: Boolean, default: false },
    stripePaymentIntentId: { type: String },
    bakongRef: { type: String },
    trackingNumber: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 });
orderSchema.index({ bakongRef: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

orderSchema.pre('validate', function () {
  if (!this.orderNumber) {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    this.orderNumber = `ORD-${date}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  }
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
