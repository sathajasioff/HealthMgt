import React from 'react';
import { X, CheckCircle, Trash2, Bell } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotification();

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-teal-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-white/90 text-sm">{unreadCount} unread</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:text-teal-600 font-medium transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAllNotifications}
              className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Bell size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'appointment' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <CheckCircle size={20} className={
                          notification.type === 'appointment' ? 'text-green-600' : 'text-blue-600'
                        } />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.details && (
                        <div className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Doctor:</span>
                              <p className="font-medium text-gray-700">{notification.details.doctor}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Patient:</span>
                              <p className="font-medium text-gray-700">{notification.details.patient}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <p className="font-medium text-gray-700">{notification.details.time}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Specialty:</span>
                              <p className="font-medium text-gray-700">{notification.details.specialization}</p>
                            </div>
                          </div>
                          {notification.details.healthIssue && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <span className="text-gray-500 text-xs">Issue:</span>
                              <p className="text-xs text-gray-700 mt-1">{notification.details.healthIssue}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;