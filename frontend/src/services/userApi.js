import api from './api';

export const userBookingAPI = {
  // Create booking (USER)
  create: async (data) => {
    const response = await api.post('/api/bookings', data);
    return response.data; // { success, data, message }
  },

  // Get MY bookings — backend auto-filters by the authenticated user's email via JWT
  getMyBookings: async () => {
    const response = await api.get('/api/bookings');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Cancel booking (USER)
  cancel: async (id) => {
    const response = await api.patch(`/api/bookings/${id}/cancel`);
    return response.data.data; // Return the updated booking entity directly
  },
};

export const userIncidentAPI = {
  // Create incident ticket (USER) — sends FormData so attachments are supported
  create: async (formData) => {
    const response = await api.post('/incidents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get all tickets — filter by reportedByEmail on frontend
  getAll: async () => {
    const response = await api.get('/incidents');
    return response.data; // { success, data, count }
  },
};
