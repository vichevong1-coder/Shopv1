import axiosInstance from './axiosInstance';
import type { Product, ProductFilters, ProductPagination } from '../types/product';

interface ListResponse {
  products: Product[];
  pagination: ProductPagination;
}

export const listProducts = async (
  params: ProductFilters & { page?: number; limit?: number }
): Promise<ListResponse> => {
  const { data } = await axiosInstance.get<ListResponse>('/products', { params });
  return data;
};

export const getFeaturedProducts = async (): Promise<{ products: Product[] }> => {
  const { data } = await axiosInstance.get<{ products: Product[] }>('/products/featured');
  return data;
};

export const getProduct = async (id: string): Promise<{ product: Product }> => {
  const { data } = await axiosInstance.get<{ product: Product }>(`/products/${id}`);
  return data;
};

export const createProduct = async (body: Partial<Product>): Promise<{ product: Product }> => {
  const { data } = await axiosInstance.post<{ product: Product }>('/products', body);
  return data;
};

export const updateProduct = async (
  id: string,
  body: Partial<Product>
): Promise<{ product: Product }> => {
  const { data } = await axiosInstance.put<{ product: Product }>(`/products/${id}`, body);
  return data;
};

export const softDeleteProduct = async (id: string): Promise<{ product: Product }> => {
  const { data } = await axiosInstance.patch<{ product: Product }>(`/products/${id}/soft-delete`);
  return data;
};

export const restoreProduct = async (id: string): Promise<{ product: Product }> => {
  const { data } = await axiosInstance.patch<{ product: Product }>(`/products/${id}/restore`);
  return data;
};
