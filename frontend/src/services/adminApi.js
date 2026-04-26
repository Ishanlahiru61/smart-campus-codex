import api from './api';

export const adminAPI = {
  // Create a new user (ADMIN, TECHNICIAN, USER)
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/admin/create-user', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data; // This is { success: true, data: [...], count: N }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (id, roles) => {
    try {
      const response = await api.put(`/api/admin/users/${id}/role`, roles);
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (id, enabled) => {
    try {
      const response = await api.put(`/api/admin/users/${id}/status?enabled=${enabled}`);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get all technicians
  getTechnicians: async () => {
    try {
      const response = await api.get('/api/admin/users');
      // response.data is { success: true, data: [...], count: N }
      const users = response.data?.data || [];
      return users.filter(u => u.roles && u.roles.some(r => r.includes('TECHNICIAN')));
    } catch (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }
  },

  // Assign technician to incident ticket
  assignTechnician: async (ticketId, technicianId, technicianName) => {
    try {
      const response = await api.patch(`/incidents/${ticketId}/assign`, null, {
        params: { technicianId, technicianName }
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning technician:', error);
      throw error;
    }
  }
};
