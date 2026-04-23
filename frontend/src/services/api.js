import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Incidents API endpoints
export const incidentsAPI = {
  // GET: Retrieve all tickets
  getAllTickets: async (filters = {}) => {
    try {
      const { status, facility, priority } = filters;
      const params = new URLSearchParams();
      
      if (status) params.append('status', status);
      if (facility) params.append('facility', facility);
      if (priority) params.append('priority', priority);
      
      const response = await apiClient.get(
        `/incidents${params.toString() ? '?' + params.toString() : ''}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Retrieve ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await apiClient.get(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get open tickets
  getOpenTickets: async () => {
    try {
      const response = await apiClient.get('/incidents/filter/open');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get unassigned tickets
  getUnassignedTickets: async () => {
    try {
      const response = await apiClient.get('/incidents/filter/unassigned');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get technician tickets
  getTechnicianTickets: async (technicianId) => {
    try {
      const response = await apiClient.get(`/incidents/technician/${technicianId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Search tickets
  searchTickets: async (keyword) => {
    try {
      const response = await apiClient.get(`/incidents/search/by-keyword?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/incidents/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST: Create ticket
  createTicket: async (ticketData) => {
    try {
      const response = await apiClient.post('/incidents', ticketData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT: Update ticket
  updateTicket: async (id, ticketData) => {
    try {
      const response = await apiClient.put(`/incidents/${id}`, ticketData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE: Delete ticket
  deleteTicket: async (id) => {
    try {
      const response = await apiClient.delete(`/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST: Add attachment
  addAttachment: async (id, file, uploadedBy) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedBy', uploadedBy);

      const response = await apiClient.post(`/incidents/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE: Remove attachment
  removeAttachment: async (ticketId, attachmentId) => {
    try {
      const response = await apiClient.delete(`/incidents/${ticketId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST: Add comment
  addComment: async (id, commentData) => {
    try {
      const response = await apiClient.post(`/incidents/${id}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT: Update comment
  updateComment: async (ticketId, commentId, newContent, userId) => {
    try {
      const response = await apiClient.put(
        `/incidents/${ticketId}/comments/${commentId}?newContent=${encodeURIComponent(newContent)}&userId=${userId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE: Delete comment
  deleteComment: async (ticketId, commentId, userId) => {
    try {
      const response = await apiClient.delete(
        `/incidents/${ticketId}/comments/${commentId}?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH: Update ticket status
  updateStatus: async (id, status, resolutionNotes, rejectionReason) => {
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      if (resolutionNotes) params.append('resolutionNotes', resolutionNotes);
      if (rejectionReason) params.append('rejectionReason', rejectionReason);

      const response = await apiClient.patch(`/incidents/${id}/status?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH: Assign technician
  assignTechnician: async (id, technicianId, technicianName) => {
    try {
      const response = await apiClient.patch(
        `/incidents/${id}/assign?technicianId=${technicianId}&technicianName=${encodeURIComponent(technicianName)}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH: Unassign technician
  unassignTechnician: async (id) => {
    try {
      const response = await apiClient.patch(`/incidents/${id}/unassign`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
