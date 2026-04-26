import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, CheckCheck } from 'lucide-react';
import notificationApi from '../../services/notificationApi';
import { useWebSocket } from '../../hooks/useWebSocket';

const TYPE_STYLE = {
  BOOKING: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   icon: '📅' },
  TICKET:  { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', icon: '🔧' },
  SYSTEM:  { bg: 'bg-slate-100', text: 'text-slate-600',  dot: 'bg-slate-400',  icon: '🔔' },
};

const getTypeMeta = (type) => TYPE_STYLE[type] || TYPE_STYLE.SYSTEM;

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  
  const { newNotifications, clearNewNotifications } = useWebSocket();

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
      setUnreadCount(prev => prev + newNotifications.length);
      clearNewNotifications();
    }
  }, [newNotifications, clearNewNotifications]);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount()
      ]);
      setNotifications(listRes.data);
      setUnreadCount(countRes.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error('Failed to mark as read', error); }
  };

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => notificationApi.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) { console.error('Failed to mark all as read', error); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error('Failed to delete notification', error); }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-500 hover:text-slate-800 transition-all rounded-2xl hover:bg-white hover:shadow-[0_4px_16px_rgb(0,0,0,0.06)] focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-all ${isOpen ? 'text-blue-600' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-extrabold text-white bg-red-500 rounded-full px-1 border-2 border-[#F8FAFC]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-[100] overflow-hidden border border-slate-100/80">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                All read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">No notifications yet</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification, idx) => {
                  const meta = getTypeMeta(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`px-5 py-4 transition-colors border-b border-slate-50 last:border-0 ${
                        !notification.read ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type Icon */}
                        <div className={`w-9 h-9 rounded-2xl ${meta.bg} flex items-center justify-center shrink-0 text-base`}>
                          {meta.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${meta.text}`}>
                              {notification.type}
                            </span>
                            {!notification.read && (
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
                            )}
                          </div>
                          <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-1">
                            {timeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1 shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-50 text-center">
              <p className="text-xs font-semibold text-slate-400">{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
