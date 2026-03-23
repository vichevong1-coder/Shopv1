import axiosInstance from './axiosInstance';
import type { Product, ProductPagination } from '../types/product';

interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
  category?: string;
  gender?: string;
  isActive?: boolean;
}

interface AdminListResponse {
  products: Product[];
  pagination: ProductPagination;
}

export const adminListProducts = async (params: AdminListParams): Promise<AdminListResponse> => {
  const { data } = await axiosInstance.get<AdminListResponse>('/admin/products', { params });
  return data;
};
