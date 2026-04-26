import api from './api';

export const incidentAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/incidents', { params });
    return response.data; // { success, data, count }
  },

  // Get only MY tickets — filtered server-side by JWT email
  getMyTickets: async () => {
    const response = await api.get('/incidents/filter/my');
    return response.data; // { success, data, count }
  },

  getById: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  getUnassigned: async () => {
    const response = await api.get('/incidents/filter/unassigned');
    return response.data;
  },

  updateStatus: async (id, status, resolutionNotes = null, rejectionReason = null) => {
    const params = { status };
    if (resolutionNotes) params.resolutionNotes = resolutionNotes;
    if (rejectionReason) params.rejectionReason = rejectionReason;
    const response = await api.patch(`/incidents/${id}/status`, null, { params });
    return response.data;
  },

  assignTechnician: async (id, technicianId, technicianName) => {
    const response = await api.patch(`/incidents/${id}/assign`, null, {
      params: { technicianId, technicianName },
    });
    return response.data;
  },

  unassignTechnician: async (id) => {
    const response = await api.patch(`/incidents/${id}/unassign`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/incidents/${id}`);
  },

  addComment: async (id, content, commentedBy) => {
    const response = await api.post(`/incidents/${id}/comments`, { content, commentedBy });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/incidents/statistics');
    return response.data;
  },
};
