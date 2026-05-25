import api from './api';

export const addToCart = async (productData, token) => {
  const response = await api.post('/cart/add', productData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getCart = async (
  token
) => {

  const response = await api.get(
    '/cart',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
