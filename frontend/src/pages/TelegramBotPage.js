import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Bot, Smartphone } from 'lucide-react';
import TelegramBot from '@/components/TelegramBot';

const TelegramBotPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Назад к профилю
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Telegram Bot
              </h1>
              <p className="text-gray-400">
                Управляйте VELES DRIVE прямо из Telegram
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bot Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-gray-700">
            <CardContent className="p-6 text-center">
              <MessageCircle size={32} className="text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Удобное общение</h3>
              <p className="text-gray-400 text-sm">
                Получайте уведомления и управляйте избранным прямо в Telegram
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-gray-700">
            <CardContent className="p-6 text-center">
              <Bot size={32} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Умный поиск</h3>
              <p className="text-gray-400 text-sm">
                Ищите автомобили по команде и получайте персональные рекомендации
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-gray-700">
            <CardContent className="p-6 text-center">
              <Smartphone size={32} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Мобильность</h3>
              <p className="text-gray-400 text-sm">
                Доступ к функциям VELES DRIVE в любое время и в любом месте
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Telegram Integration Component */}
        <TelegramBot />

        {/* Bot Commands Reference */}
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Справочник команд бота</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">🔧 Основные команды</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="text-blue-400">/start</code>
                    <span className="text-gray-400">Запуск бота</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/help</code>
                    <span className="text-gray-400">Помощь и команды</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/profile</code>
                    <span className="text-gray-400">Информация о профиле</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/connect</code>
                    <span className="text-gray-400">Привязка аккаунта</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/disconnect</code>
                    <span className="text-gray-400">Отвязка аккаунта</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-3">🔍 Команды поиска</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="text-blue-400">/search BMW</code>
                    <span className="text-gray-400">Поиск BMW</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/search motorcycle Ducati</code>
                    <span className="text-gray-400">Поиск мотоциклов Ducati</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/search boat Azimut</code>
                    <span className="text-gray-400">Поиск лодок Azimut</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/search plane Cessna</code>
                    <span className="text-gray-400">Поиск самолетов Cessna</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-blue-400">/favorites</code>
                    <span className="text-gray-400">Избранные объявления</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">💡 Советы по использованию</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Используйте команды без скобок, например: /search BMW X5</li>
                <li>• Бот понимает русский и английский языки</li>
                <li>• Для получения детальной информации используйте кнопки в сообщениях</li>
                <li>• Настройте уведомления командой /notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-2">❓ Как подключить бота?</h4>
                <p className="text-gray-400 text-sm">
                  Нажмите кнопку "Подключить Telegram" выше, автоматически откроется бот. 
                  Отправьте команду /start и аккаунт будет привязан.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">🔔 Какие уведомления я буду получать?</h4>
                <p className="text-gray-400 text-sm">
                  Новые автомобили по вашим критериям, изменения цен в избранном, 
                  обновления аукционов, сообщения от дилеров и системные уведомления.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">🔒 Безопасно ли подключать Telegram?</h4>
                <p className="text-gray-400 text-sm">
                  Да, мы используем безопасное API Telegram. Мы не имеем доступа к вашим личным 
                  сообщениям и контактам. Бот работает только с командами VELES DRIVE.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">⚙️ Как отключить уведомления?</h4>
                <p className="text-gray-400 text-sm">
                  Используйте команду /notifications в боте или отключите интеграцию на этой странице.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramBotPage;