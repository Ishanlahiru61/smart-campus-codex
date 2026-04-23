import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8081/api/bookings",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

const bookingApi = {
  createBooking: async (payload) => {
    const response = await apiClient.post("", payload);
    return response.data;
  },

  getAllBookings: async () => {
    const response = await apiClient.get("");
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await apiClient.get(`/${bookingId}`);
    return response.data;
  },

  getBookingsByUserId: async (userId) => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  updateBooking: async (bookingId, payload) => {
    const response = await apiClient.put(`/${bookingId}`, payload);
    return response.data;
  },

  approveBooking: async (bookingId) => {
    const response = await apiClient.patch(`/${bookingId}/approve`);
    return response.data;
  },

  rejectBooking: async (bookingId, payload) => {
    const response = await apiClient.patch(`/${bookingId}/reject`, payload);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await apiClient.patch(`/${bookingId}/cancel`);
    return response.data;
  },

  rescheduleBooking: async (bookingId, payload) => {
    const response = await apiClient.patch(`/${bookingId}/reschedule`, payload);
    return response.data;
  },

  deleteBooking: async (bookingId) => {
    const response = await apiClient.delete(`/${bookingId}`);
    return response.data;
  },
};

export default bookingApi;