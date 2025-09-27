import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import TelegramBot from '../components/TelegramBot';

const ProfilePage = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    
    // Update user context
    updateUser(profileForm);
    setEditing(false);
    toast.success('Профиль обновлен');
  };

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: 'fas fa-user' },
    { id: 'favorites', label: 'Избранное', icon: 'fas fa-heart', count: favorites.length },
    { id: 'history', label: 'История', icon: 'fas fa-history' },
    { id: 'telegram', label: 'Telegram', icon: 'fab fa-telegram' },
    { id: 'settings', label: 'Настройки', icon: 'fas fa-cog' }
  ];

  const mockHistory = [
    {
      id: '1',
      action: 'Просмотр',
      item: 'Mercedes-Benz S-Class 2024',
      date: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      action: 'Добавление в избранное',
      item: 'BMW X5 2023',
      date: '2024-01-14T15:20:00Z'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProfile = () => (
    <Card className="glass-card p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Личная информация</h2>
        <Button
          onClick={() => setEditing(!editing)}
          className={editing ? "btn-outline-gold" : "btn-gold"}
        >
          <i className={`fas ${editing ? 'fa-times' : 'fa-edit'} mr-2`}></i>
          {editing ? 'Отмена' : 'Редактировать'}
        </Button>
      </div>

      {/* User Avatar */}
      <div className="flex items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-black text-3xl font-bold mr-6">
          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{user.full_name}</h3>
          <p className="text-gray-400">{user.email}</p>
          <Badge className={`mt-2 ${
            user.role === 'dealer' ? 'bg-gold text-black' : 
            user.role === 'admin' ? 'bg-red-600 text-white' : 
            'bg-blue-600 text-white'
          }`}>
            {user.role === 'dealer' ? 'Дилер' : 
             user.role === 'admin' ? 'Администратор' : 
             'Покупатель'}
          </Badge>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Полное имя
              </label>
              <input
                type="text"
                name="full_name"
                value={profileForm.full_name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Введите полное имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="btn-gold">
              <i className="fas fa-save mr-2"></i>
              Сохранить изменения
            </Button>
            <Button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-outline-gold"
            >
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Полное имя
            </label>
            <p className="text-white text-lg">{user.full_name || 'Не указано'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Телефон
            </label>
            <p className="text-white text-lg">{user.phone || 'Не указан'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <p className="text-white text-lg">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Дата регистрации
            </label>
            <p className="text-white text-lg">
              {user.created_at ? formatDate(user.created_at) : 'Не указана'}
            </p>
          </div>
        </div>
      )}
    </Card>
  );

  const renderFavorites = () => (
    <Card className="glass-card p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">
          Избранные автомобили
          {favorites.length > 0 && (
            <Badge className="bg-gold text-black ml-3">{favorites.length}</Badge>
          )}
        </h2>
        {favorites.length > 0 && (
          <Button className="btn-outline-gold">
            <i className="fas fa-trash mr-2"></i>
            Очистить все
          </Button>
        )}
      </div>

      {favoritesLoading ? (
        <div className="text-center py-16">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка избранного...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="premium-car-card p-0 overflow-hidden">
              <div className="p-4 text-center">
                <i className="fas fa-heart text-4xl text-gold mb-4"></i>
                <h3 className="text-white font-semibold">Автомобиль #{favorite.id}</h3>
                <p className="text-gray-400 text-sm">Детали загружаются...</p>
                <div className="mt-4 space-y-2">
                  <Link to={`/car/${favorite.id}`}>
                    <Button className="w-full btn-outline-gold text-sm">
                      Подробнее
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full text-gray-400 hover:text-red-400"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Удалить
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <i className="fas fa-heart text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-2xl font-bold text-white mb-2">Нет избранных автомобилей</h3>
          <p className="text-gray-400 mb-6">Добавьте автомобили в избранное для быстрого доступа</p>
          <Link to="/catalog">
            <Button className="btn-gold">
              <i className="fas fa-search mr-2"></i>
              Посмотреть каталог
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );

  const renderHistory = () => (
    <Card className="glass-card p-8">
      <h2 className="text-2xl font-bold text-white mb-8">История активности</h2>
      
      <div className="space-y-4">
        {mockHistory.map((item) => (
          <div key={item.id} className="flex items-center p-4 bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-eye text-white"></i>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">{item.action}</p>
              <p className="text-gray-400">{item.item}</p>
            </div>
            <div className="text-gray-400 text-sm">
              {formatDate(item.date)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card className="glass-card p-8">
      <h2 className="text-2xl font-bold text-white mb-8">Настройки</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Уведомления</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Email уведомления</span>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">SMS уведомления</span>
              <input type="checkbox" className="ml-3" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-300">Push уведомления</span>
              <input type="checkbox" defaultChecked className="ml-3" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Безопасность</h3>
          <div className="space-y-3">
            <Button className="btn-outline-gold">
              <i className="fas fa-key mr-2"></i>
              Сменить пароль
            </Button>
            <Button className="btn-outline-gold">
              <i className="fas fa-shield-alt mr-2"></i>
              Двухфакторная аутентификация
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Конфиденциальность</h3>
          <div className="space-y-3">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <i className="fas fa-download mr-2"></i>
              Скачать мои данные
            </Button>
            <Button variant="ghost" className="text-red-400 hover:text-red-300">
              <i className="fas fa-user-times mr-2"></i>
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Личный кабинет</h1>
          <p className="text-gray-400">Управление профилем и настройками</p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto mb-8 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
              {tab.count > 0 && (
                <Badge className="bg-gold text-black ml-2 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'favorites' && renderFavorites()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'telegram' && <TelegramBot />}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;