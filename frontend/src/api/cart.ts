import axiosInstance from './axiosInstance';
import type { CartItem } from '../types/cart';

// Shape the backend actually returns (product is populated)
interface RawCartItem {
  _id: string;
  product: { _id: string; name: string; images: { url: string; publicId: string }[] } | string;
  size: string;
  color: string;
  quantity: number;
  priceInCents: number;
}

interface RawCartResponse {
  items: RawCartItem[];
}

interface CartResponse {
  items: CartItem[];
}

function mapItem(raw: RawCartItem): CartItem {
  const isPopulated = typeof raw.product === 'object' && raw.product !== null;
  return {
    _id: raw._id,
    productId: isPopulated ? (raw.product as { _id: string })._id : (raw.product as string),
    name: isPopulated ? (raw.product as { name: string }).name : '',
    image: isPopulated ? ((raw.product as { images: { url: string }[] }).images[0]?.url ?? '') : '',
    size: raw.size,
    color: raw.color,
    quantity: raw.quantity,
    priceInCents: raw.priceInCents,
  };
}

function mapResponse(raw: RawCartResponse): CartResponse {
  return { items: raw.items.map(mapItem) };
}

export interface AddItemPayload {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export const fetchCart = async (): Promise<CartResponse> => {
  const { data } = await axiosInstance.get<RawCartResponse>('/cart');
  return mapResponse(data);
};

export const addItem = async (payload: AddItemPayload): Promise<CartResponse> => {
  const { data } = await axiosInstance.post<RawCartResponse>('/cart/add', payload);
  return mapResponse(data);
};

export const updateItem = async (itemId: string, quantity: number): Promise<CartResponse> => {
  const { data } = await axiosInstance.put<RawCartResponse>('/cart/update', { itemId, quantity });
  return mapResponse(data);
};

export const removeItem = async (itemId: string): Promise<CartResponse> => {
  const { data } = await axiosInstance.delete<RawCartResponse>(`/cart/remove/${itemId}`);
  return mapResponse(data);
};

export const clearCart = async (): Promise<CartResponse> => {
  const { data } = await axiosInstance.delete<RawCartResponse>('/cart/clear');
  return mapResponse(data);
};

export const mergeCart = async (
  items: { productId: string; size: string; color: string; quantity: number }[]
): Promise<CartResponse> => {
  const { data } = await axiosInstance.post<RawCartResponse>('/cart/merge', { items });
  return mapResponse(data);
};
