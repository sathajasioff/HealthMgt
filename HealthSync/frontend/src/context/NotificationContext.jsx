import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const saveNotifications = useCallback((newNotifications) => {
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 5000) => {
    setToast({ message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);
    
    return newNotification;
  }, [notifications, saveNotifications]);

  const markAsRead = useCallback((id) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback((id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    showToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </NotificationContext.Provider>
  );
};
