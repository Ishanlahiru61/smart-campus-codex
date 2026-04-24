import api from './api';

export const facilityAPI = {
  // Get all facilities (with optional filters)
  getAll: async (params = {}) => {
    const response = await api.get('/facilities', { params });
    return response.data;
  },

  // Get single facility by ID
  getById: async (id) => {
    const response = await api.get(`/facilities/${id}`);
    return response.data;
  },

  // Create a new facility (ADMIN only) — formData contains 'facility' JSON part + optional 'image' file
  create: async (formData) => {
    const response = await api.post('/facilities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update a facility (ADMIN only) — formData contains 'facility' JSON part + optional 'image' file
  update: async (id, formData) => {
    const response = await api.put(`/facilities/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete a facility (ADMIN only)
  delete: async (id) => {
    await api.delete(`/facilities/${id}`);
  },

  // Update facility status (ADMIN only)
  updateStatus: async (id, status) => {
    const response = await api.patch(`/facilities/${id}/status`, null, { params: { status } });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/facilities/statistics');
    return response.data;
  },
};
