import api from './api';

const analyticsApi = {
    getTopResources: async () => {
        const response = await api.get('/api/admin/analytics/top-resources');
        return response.data;
    },
    
    getPeakHours: async () => {
        const response = await api.get('/api/admin/analytics/peak-hours');
        return response.data;
    },
    
    getBookingTrends: async () => {
        const response = await api.get('/api/admin/analytics/booking-trends');
        return response.data;
    }
};

export default analyticsApi;
