import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Facilities API endpoints
export const facilitiesAPI = {
  // GET: Retrieve all facilities
  getAllFacilities: async (filters = {}) => {
    try {
      const { type, location, status } = filters;
      const params = new URLSearchParams();
      
      if (type) params.append('type', type);
      if (location) params.append('location', location);
      if (status) params.append('status', status);
      
      const response = await apiClient.get(
        `/facilities${params.toString() ? '?' + params.toString() : ''}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Retrieve facility by ID
  getFacilityById: async (id) => {
    try {
      const response = await apiClient.get(`/facilities/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST: Create a new facility
  createFacility: async (facilityData) => {
    try {
      const response = await apiClient.post('/facilities', facilityData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT: Update a facility
  updateFacility: async (id, facilityData) => {
    try {
      const response = await apiClient.put(`/facilities/${id}`, facilityData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE: Remove a facility
  deleteFacility: async (id) => {
    try {
      const response = await apiClient.delete(`/facilities/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Search facilities by name
  searchByName: async (name) => {
    try {
      const response = await apiClient.get(`/facilities/search/by-name?name=${name}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Find available facilities
  getAvailableFacilities: async (type, capacity) => {
    try {
      const response = await apiClient.get(`/facilities/available?type=${type}&capacity=${capacity}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH: Update facility status
  updateFacilityStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/facilities/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // GET: Get statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/facilities/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
