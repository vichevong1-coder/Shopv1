export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  priceInCents: number;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}
