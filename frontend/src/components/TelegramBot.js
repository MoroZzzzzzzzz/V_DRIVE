import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const TelegramBot = () => {
  const { user, isAuthenticated } = useAuth();
  const [telegramStatus, setTelegramStatus] = useState({
    connected: false,
    username: null,
    connected_at: null,
    notifications_enabled: true
  });
  const [connectionCode, setConnectionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated) {
      loadTelegramStatus();
    }
  }, [isAuthenticated]);

  const loadTelegramStatus = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/telegram/status`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setTelegramStatus(response.data);
    } catch (error) {
      console.error('Error loading Telegram status:', error);
    }
  };

  const generateConnectionCode = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/telegram/generate-code`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      const { connection_code, bot_username } = response.data;
      setConnectionCode(connection_code);
      
      // Open Telegram bot
      const telegramUrl = `https://t.me/${bot_username}?start=${connection_code}`;
      window.open(telegramUrl, '_blank');
      
      toast.success('Код подключения создан! Перейдите в Telegram и отправьте команду /start');
      setShowConnectionDialog(true);
      
    } catch (error) {
      console.error('Error generating connection code:', error);
      toast.error(error.response?.data?.detail || 'Ошибка создания кода подключения');
    } finally {
      setLoading(false);
    }
  };

  const connectTelegramWithCode = async () => {
    try {
      setLoading(true);
      await axios.post(`${backendUrl}/api/telegram/connect`, {
        connection_code: connectionCode
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setTelegramStatus(prev => ({ ...prev, connected: true }));
      setShowConnectionDialog(false);
      toast.success('Telegram аккаунт успешно подключен!');
      await loadTelegramStatus(); // Refresh status
      
    } catch (error) {
      console.error('Error connecting Telegram:', error);
      toast.error(error.response?.data?.detail || 'Ошибка подключения Telegram');
    } finally {
      setLoading(false);
    }
  };

  const disconnectTelegram = async () => {
    try {
      setLoading(true);
      await axios.post(`${backendUrl}/api/telegram/disconnect`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setTelegramStatus({
        connected: false,
        username: null,
        connected_at: null,
        notifications_enabled: true
      });
      toast.success('Telegram аккаунт отключен');
      
    } catch (error) {
      console.error('Error disconnecting Telegram:', error);
      toast.error('Ошибка отключения Telegram');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!botConnected) {
      toast.error('Сначала подключите Telegram');
      return;
    }

    try {
      // In real app would send notification through backend to Telegram API
      toast.success('Тестовое уведомление отправлено в Telegram!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Ошибка отправки уведомления');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="fab fa-telegram text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Telegram бот</h3>
            <p className="text-gray-400 text-sm">
              Получайте уведомления в Telegram
            </p>
          </div>
        </div>
        
        <Badge className={botConnected ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
          {botConnected ? (
            <>
              <i className="fas fa-check-circle mr-1"></i>
              Подключен
            </>
          ) : (
            <>
              <i className="fas fa-times-circle mr-1"></i>
              Не подключен
            </>
          )}
        </Badge>
      </div>

      {!botConnected ? (
        <div className="space-y-4">
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Как подключить Telegram
            </h4>
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
              <li>Нажмите "Подключить Telegram"</li>
              <li>В открывшемся боте нажмите "Старт"</li>
              <li>Введите код подключения: <code className="bg-gray-800 px-2 py-1 rounded text-gold">{connectionCode}</code></li>
              <li>Готово! Теперь вы будете получать уведомления</li>
            </ol>
          </div>

          <Button onClick={connectTelegram} className="btn-gold w-full">
            <i className="fab fa-telegram mr-2"></i>
            Подключить Telegram
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection Info */}
          <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">
              <i className="fas fa-check-circle mr-2"></i>
              Telegram успешно подключен
            </h4>
            <p className="text-gray-300 text-sm">
              Вы будете получать уведомления о новых автомобилях, сообщениях и специальных предложениях.
            </p>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Настройки уведомлений</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-gray-300 text-sm">Новые автомобили</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-gray-300 text-sm">Сообщения от дилеров</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-gray-300 text-sm">Специальные предложения</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300 text-sm">Изменения цен</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={sendTestNotification} className="btn-outline-gold flex-1">
              <i className="fas fa-bell mr-2"></i>
              Тест уведомления
            </Button>
            
            <Button onClick={disconnectTelegram} variant="ghost" className="text-red-400 hover:text-red-300">
              <i className="fas fa-unlink mr-2"></i>
              Отключить
            </Button>
          </div>
        </div>
      )}

      {/* Bot Features */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h4 className="text-white font-medium mb-3">Возможности бота</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <i className="fas fa-search text-blue-400"></i>
            <span>Поиск автомобилей</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-heart text-red-400"></i>
            <span>Управление избранным</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-bell text-gold"></i>
            <span>Мгновенные уведомления</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-phone text-green-400"></i>
            <span>Связь с дилерами</span>
          </div>
        </div>
      </div>

      {/* Bot Commands */}
      {botConnected && (
        <div className="mt-4 bg-gray-800/30 rounded-lg p-4">
          <h5 className="text-white font-medium mb-2">Команды бота:</h5>
          <div className="space-y-1 text-xs text-gray-400">
            <div><code>/search</code> - Поиск автомобилей</div>
            <div><code>/favorites</code> - Избранные автомобили</div>
            <div><code>/dealers</code> - Список дилеров</div>
            <div><code>/help</code> - Справка по командам</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TelegramBot;