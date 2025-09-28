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

  // sendTestNotification function removed - not needed in new version

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="fab fa-telegram text-white text-xl"></i>
              </div>
              <div>
                <CardTitle className="text-white">Telegram интеграция</CardTitle>
                <p className="text-gray-400 text-sm">
                  Получайте уведомления и управляйте избранным через Telegram
                </p>
              </div>
            </div>
            
            <Badge className={telegramStatus.connected ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}>
              {telegramStatus.connected ? (
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
        </CardHeader>
        
        <CardContent>
          {!telegramStatus.connected ? (
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-medium mb-3">🤖 Возможности Telegram бота:</h4>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li className="flex items-center">
                    <i className="fas fa-search text-blue-400 w-4 mr-2"></i>
                    Поиск автомобилей, мотоциклов, лодок и самолетов
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-heart text-red-400 w-4 mr-2"></i>
                    Управление избранными объявлениями
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-bell text-yellow-400 w-4 mr-2"></i>
                    Уведомления о новых предложениях
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-user text-green-400 w-4 mr-2"></i>
                    Информация о профиле и статистике
                  </li>
                </ul>
              </div>

              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
                <h4 className="text-blue-400 font-medium mb-2">📋 Как подключить:</h4>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Нажмите кнопку "Подключить Telegram"</li>
                  <li>2. Автоматически откроется Telegram бот</li>
                  <li>3. Отправьте команду /start в боте</li>
                  <li>4. Аккаунт будет автоматически привязан</li>
                </ol>
              </div>

              <Button 
                onClick={generateConnectionCode}
                disabled={loading}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <i className="fab fa-telegram mr-2"></i>
                {loading ? 'Создание кода...' : 'Подключить Telegram'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-green-400 font-medium">✅ Telegram подключен!</h4>
                    <div className="text-gray-300 text-sm space-y-1 mt-2">
                      {telegramStatus.username && (
                        <p>👤 Username: @{telegramStatus.username}</p>
                      )}
                      {telegramStatus.connected_at && (
                        <p>📅 Подключен: {new Date(telegramStatus.connected_at).toLocaleDateString('ru-RU')}</p>
                      )}
                      <p>🔔 Уведомления: {telegramStatus.notifications_enabled ? 'включены' : 'отключены'}</p>
                    </div>
                  </div>
                  <i className="fab fa-telegram text-green-400 text-3xl"></i>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-medium mb-2">🎯 Доступные команды бота:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  <div>• /help - помощь</div>
                  <div>• /search - поиск</div>
                  <div>• /favorites - избранное</div>
                  <div>• /profile - профиль</div>
                  <div>• /notifications - настройки</div>
                  <div>• /disconnect - отключение</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => window.open('https://t.me/VelesDriveBot', '_blank')}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <i className="fab fa-telegram mr-2"></i>
                  Открыть бота
                </Button>
                <Button 
                  onClick={disconnectTelegram}
                  disabled={loading}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <i className="fas fa-unlink mr-2"></i>
                  {loading ? 'Отключение...' : 'Отключить'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Подтверждение подключения</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-mono text-yellow-400 bg-gray-800 p-3 rounded-lg">
                {connectionCode}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Код подключения (скопируйте если нужно)
              </p>
            </div>
            
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
              <p className="text-blue-400 text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                Если Telegram не открылся автоматически, перейдите к боту @VelesDriveBot 
                и отправьте команду: <code>/start {connectionCode}</code>
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => window.open('https://t.me/VelesDriveBot', '_blank')}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Открыть Telegram
              </Button>
              <Button 
                onClick={() => setShowConnectionDialog(false)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelegramBot;