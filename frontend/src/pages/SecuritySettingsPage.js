import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import SecuritySettings from '@/components/SecuritySettings';

const SecuritySettingsPage = () => {
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
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Shield size={28} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Настройки безопасности
              </h1>
              <p className="text-gray-400">
                Управляйте безопасностью вашего аккаунта VELES DRIVE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Tips */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock size={20} />
              Рекомендации по безопасности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div className="space-y-2">
                <h4 className="text-white font-medium">✅ Что делать:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Включите двухфакторную аутентификацию</li>
                  <li>• Используйте надежный пароль</li>
                  <li>• Сохраните резервные коды в безопасном месте</li>
                  <li>• Регулярно проверяйте журнал активности</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-medium">❌ Чего избегать:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Не используйте простые пароли</li>
                  <li>• Не передавайте резервные коды третьим лицам</li>
                  <li>• Не входите с подозрительных устройств</li>
                  <li>• Не игнорируйте подозрительную активность</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings Component */}
        <SecuritySettings />

        {/* Account Info */}
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Информация об аккаунте</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <p className="text-sm text-gray-400">Email:</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Роль:</p>
                <p className="text-white font-medium capitalize">
                  {user.role === 'buyer' && 'Покупатель'}
                  {user.role === 'dealer' && 'Дилер'}
                  {user.role === 'admin' && 'Администратор'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Дата регистрации:</p>
                <p className="text-white font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Статус 2FA:</p>
                <p className={`font-medium ${user.two_fa_enabled ? 'text-green-400' : 'text-red-400'}`}>
                  {user.two_fa_enabled ? 'Включена' : 'Отключена'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Security Resources */}
        <Card className="bg-gray-900 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Дополнительные ресурсы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="text-white font-medium mb-2">Рекомендуемые приложения для 2FA:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Google Authenticator</strong> - для Android и iOS</li>
                  <li>• <strong>Authy</strong> - с резервным копированием</li>
                  <li>• <strong>Microsoft Authenticator</strong> - интеграция с Windows</li>
                  <li>• <strong>1Password</strong> - если используете менеджер паролей</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Признаки компрометации аккаунта:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Неизвестные входы в журнале активности</li>
                  <li>• Изменения настроек без вашего ведома</li>
                  <li>• Подозрительные уведомления или письма</li>
                  <li>• Неизвестные устройства в списке активных сессий</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;