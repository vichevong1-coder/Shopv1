import axiosInstance from './axiosInstance';

export const createStripePaymentIntent = async (orderId: string): Promise<{ clientSecret: string }> => {
  const { data } = await axiosInstance.post<{ clientSecret: string }>(
    '/payment/stripe/create-payment-intent',
    { orderId }
  );
  return data;
};
