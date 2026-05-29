import api from './api';

export const addReview = async (reviewData, token) => {
  const response = await api.post('/reviews', reviewData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getReviews = async (productId) => {
  const response = await api.get(`/reviews/${productId}`);
  return response.data;
};
