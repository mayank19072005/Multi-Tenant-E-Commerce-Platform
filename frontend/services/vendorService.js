import api from './api';

export const getVendorProducts = async (token) => {
  const response = await api.get('/products/vendor', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const createProduct = async (productData, token) => {
  const response = await api.post('/products/create', productData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateProduct = async (id, productData, token) => {
  const response = await api.put(`/products/${id}`, productData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const response = await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const uploadProductImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/products/upload-image', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getVendorOrders = async (token) => {
  const response = await api.get('/orders/vendor', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateOrderStatus = async (id, status, token) => {
  const response = await api.put(`/orders/${id}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
