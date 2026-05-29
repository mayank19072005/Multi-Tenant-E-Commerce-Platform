import api from './api';

// Get all vendors (Tenants populated with their owner Users)
export const getVendors = async (token) => {
  const response = await api.get('/admin/vendors', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Approve a vendor registration
export const approveVendor = async (id, token) => {
  const response = await api.put(`/admin/approve/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Reject a vendor registration
export const rejectVendor = async (id, token) => {
  const response = await api.put(`/admin/reject/${id}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Get live platform aggregates and revenue analytics
export const getAnalytics = async (token) => {
  const response = await api.get('/admin/analytics', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
