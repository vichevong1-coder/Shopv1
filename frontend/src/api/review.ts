import axiosInstance from './axiosInstance';
import type { Review, ReviewPagination } from '../types/review';

export const getReviews = async (
  productId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: Review[]; pagination: ReviewPagination }> => {
  const { data } = await axiosInstance.get(`/products/${productId}/reviews`, {
    params: { page, limit },
  });
  return data;
};

export const createReview = async (
  productId: string,
  payload: { rating: number; title: string; comment: string }
): Promise<Review> => {
  const { data } = await axiosInstance.post(`/products/${productId}/reviews`, payload);
  return data.review;
};

export const deleteReview = async (productId: string, reviewId: string): Promise<void> => {
  await axiosInstance.delete(`/products/${productId}/reviews/${reviewId}`);
};
