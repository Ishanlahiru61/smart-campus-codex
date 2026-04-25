import api from './api';

const notificationApi = {
  getNotifications: () => api.get('/api/notifications'),
  
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`)
};

export default notificationApi;
