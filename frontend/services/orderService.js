import api from './api';

export const createCheckoutSession = async (products, token) => {
  const response = await api.post(
    '/orders/checkout',
    { products },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await api.get(
    '/orders/my-orders',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
