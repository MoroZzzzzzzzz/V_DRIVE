import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Mock notifications
  const mockNotifications = [
    {
      id: '1',
      title: 'Новый автомобиль по вашим критериям',
      message: 'BMW X5 2024 года добавлен в каталог. Цена: 6,200,000 ₽',
      type: 'car_match',
      read: false,
      created_at: '2024-01-16T10:30:00Z',
      action_url: '/car/2',
      icon: 'fas fa-car'
    },
    {
      id: '2',
      title: 'Подписка успешно активирована',
      message: 'Ваша премиум подписка активна до 16 февраля 2024',
      type: 'subscription',
      read: false,
      created_at: '2024-01-16T09:15:00Z',
      action_url: '/subscription',
      icon: 'fas fa-crown'
    },
    {
      id: '3',
      title: 'Новое сообщение от дилера',
      message: 'Премиум Авто Москва ответил на ваш запрос о Mercedes-Benz S-Class',
      type: 'message',
      read: true,
      created_at: '2024-01-15T16:45:00Z',
      action_url: '/messages',
      icon: 'fas fa-envelope'
    },
    {
      id: '4',
      title: 'Специальное предложение',
      message: 'Скидка 15% на все автомобили класса люкс до конца месяца!',
      type: 'promotion',
      read: true,
      created_at: '2024-01-15T14:20:00Z',
      action_url: '/premium',
      icon: 'fas fa-percentage'
    }
  ];

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      // Mock loading
      setNotifications(mockNotifications);
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
      
      const updatedUnread = notifications.filter(n => !n.read && n.id !== notificationId).length;
      setUnreadCount(updatedUnread);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
      toast.success('Все уведомления отмечены как прочитанные');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Уведомление удалено');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      read: false,
      created_at: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast for new notification
    toast.success(notification.title, {
      description: notification.message,
      action: notification.action_url ? {
        label: 'Открыть',
        onClick: () => window.location.href = notification.action_url
      } : undefined
    });
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Dropdown Component
export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'car_match': return 'text-blue-400';
      case 'subscription': return 'text-gold';
      case 'message': return 'text-green-400';
      case 'promotion': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-gray-900 rounded-lg shadow-xl border border-gold/20 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">
            Уведомления
            {unreadCount > 0 && (
              <Badge className="bg-gold text-black ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </h3>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                className="text-gold hover:text-yellow-400 text-xs"
              >
                Все прочитано
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                !notification.read ? 'bg-gold/5' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                  <i className={`${notification.icon} text-sm`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </Button>
                  </div>
                  
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">
                      {formatDate(notification.created_at)}
                    </span>
                    
                    <div className="flex space-x-2">
                      {notification.action_url && (
                        <Button
                          size="sm"
                          onClick={() => {
                            markAsRead(notification.id);
                            window.location.href = notification.action_url;
                            onClose();
                          }}
                          className="text-gold hover:text-yellow-400 text-xs p-1"
                        >
                          Открыть
                        </Button>
                      )}
                      
                      {!notification.read && (
                        <Button
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-white text-xs p-1"
                        >
                          Прочитано
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <i className="fas fa-bell-slash text-4xl text-gray-600 mb-3"></i>
            <h4 className="text-white font-medium mb-1">Нет уведомлений</h4>
            <p className="text-gray-400 text-sm">Здесь будут появляться ваши уведомления</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-800 text-center">
          <Button
            size="sm"
            variant="ghost"
            className="text-gold hover:text-yellow-400 w-full"
          >
            Показать все уведомления
          </Button>
        </div>
      )}
    </div>
  );
};

// Notification Bell Component for Header
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-gold relative"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};