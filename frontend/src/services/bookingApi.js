import api from './api';

export const bookingAPI = {
  getAll: async () => {
    const response = await api.get('/api/bookings');
    return response.data.data; // Now returns the array inside .data
  },

  getById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data.data;
  },

  approve: async (id) => {
    const response = await api.patch(`/api/bookings/${id}/approve`);
    return response.data.data;
  },

  reject: async (id, reason) => {
    // Backend BookingStatusUpdateDTO uses field "reason"
    const response = await api.patch(`/api/bookings/${id}/reject`, { reason });
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/api/bookings/${id}`);
  },
};
