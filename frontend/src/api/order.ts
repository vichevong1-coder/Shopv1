import axiosInstance from './axiosInstance';
import type { Order, ShippingAddress, PaymentMethod } from '../types/order';

export interface CreateOrderPayload {
  items: {
    product: string;
    size: string;
    color: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const { data } = await axiosInstance.post<{ order: Order }>('/orders', payload);
  return data.order;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const { data } = await axiosInstance.get<{ orders: Order[] }>('/orders/my-orders');
  return data.orders;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await axiosInstance.get<{ order: Order }>(`/orders/${id}`);
  return data.order;
};
