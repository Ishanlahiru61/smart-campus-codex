import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

export const useWebSocket = () => {
  const { user } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    if (!user || !token) return;

    const socket = new SockJS('http://localhost:8081/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        setIsConnected(true);
        // Subscribe to user-specific and role-specific notifications
        client.subscribe(`/user/queue/notifications/${user.email}/${user.role}`, (message) => {
          if (message.body) {
            const newNotification = JSON.parse(message.body);
            setNotifications(prev => [newNotification, ...prev]);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [user, token]);

  const clearNewNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { isConnected, newNotifications: notifications, clearNewNotifications };
};
