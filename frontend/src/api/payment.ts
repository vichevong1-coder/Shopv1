import axiosInstance from './axiosInstance';

export const createStripePaymentIntent = async (orderId: string): Promise<{ clientSecret: string }> => {
  const { data } = await axiosInstance.post<{ clientSecret: string }>(
    '/payment/stripe/create-payment-intent',
    { orderId }
  );
  return data;
};

export const createBakongQR = async (orderId: string): Promise<{ qrString: string; bakongRef: string }> => {
  const { data } = await axiosInstance.post<{ qrString: string; bakongRef: string }>(
    '/payment/bakong/create-qr',
    { orderId }
  );
  return data;
};

export const getBakongStatus = async (bakongRef: string): Promise<{ status: 'paid' | 'pending' }> => {
  const { data } = await axiosInstance.get<{ status: 'paid' | 'pending' }>(
    `/payment/bakong/status/${bakongRef}`
  );
  return data;
};
