import api from './api';

export const technicianAPI = {
  // Get all tickets assigned to the logged-in technician
  getAssignedTickets: async () => {
    try {
      const response = await api.get('/api/technician/tickets');
      return response.data; // { success, data, count }
    } catch (error) {
      console.error('Error fetching assigned tickets:', error);
      throw error;
    }
  },

  // Get a specific assigned ticket by ID
  getTicketById: async (id) => {
    try {
      const response = await api.get(`/api/technician/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  },

  // Update status and resolution notes of an assigned ticket
  updateStatus: async (id, status, resolutionNotes = '') => {
    try {
      const params = new URLSearchParams({ status });
      if (resolutionNotes) params.append('resolutionNotes', resolutionNotes);
      const response = await api.put(`/api/technician/tickets/${id}/status?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  // Add a comment to an assigned ticket
  addComment: async (id, content) => {
    try {
      const response = await api.post(`/api/technician/tickets/${id}/comment`, {
        content,
        commentedBy: 'Technician',
        commentedByRole: 'TECHNICIAN'
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};
