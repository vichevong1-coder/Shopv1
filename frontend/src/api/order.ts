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

export interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface GetAllOrdersResult {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const getAllOrders = async (params: GetAllOrdersParams = {}): Promise<GetAllOrdersResult> => {
  const { data } = await axiosInstance.get<GetAllOrdersResult>('/orders', { params });
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const { data } = await axiosInstance.put<{ order: Order }>(`/orders/${orderId}/status`, { status });
  return data.order;
};
