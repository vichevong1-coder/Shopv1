export interface OrderItem {
  _id: string;
  product: string;
  name: string;
  image: string;
  priceInCents: number;
  size: string;
  color: string;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentResult {
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  status?: string;
  paidAt?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'stripe';

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

export interface Order {
  _id: string;
  user: string | OrderUser;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentResult: PaymentResult;
  itemsTotalInCents: number;
  shippingPriceInCents: number;
  taxAmountInCents: number;
  totalAmountInCents: number;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProcessed: boolean;
  stripePaymentIntentId?: string;
  bakongRef?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  adminOrders: Order[];
  adminPagination: AdminPagination;
  isLoading: boolean;
  error: string | null;
}
