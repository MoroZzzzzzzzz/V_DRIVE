import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Car, 
  Store, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Ban,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Enhanced mock data for admin dashboard
  const mockStats = {
    total_users: 1247,
    total_dealers: 89,
    total_cars: 3456,
    pending_reviews: 23,
    total_transactions: 156,
    monthly_revenue: 2856000,
    new_registrations: 45,
    active_sessions: 312,
    blocked_users: 12,
    reported_content: 8,
    system_alerts: 3,
    server_uptime: 99.8,
    avg_response_time: 142,
    total_views: 45621,
    conversion_rate: 3.2,
    premium_users: 156
  };

  const mockUsers = [
    {
      id: '1',
      email: 'john.doe@example.com',
      full_name: 'Иван Петров',
      role: 'buyer',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z',
      last_login: '2024-01-16T14:20:00Z',
      total_purchases: 2,
      two_fa_enabled: true,
      phone: '+7-900-123-4567'
    },
    {
      id: '2',
      email: 'premium.auto@dealer.ru',
      full_name: 'Премиум Авто Москва',
      role: 'dealer',
      status: 'active',
      created_at: '2024-01-10T09:15:00Z',
      last_login: '2024-01-16T16:45:00Z',
      total_sales: 45,
      two_fa_enabled: false,
      phone: '+7-495-123-4567',
      company_name: 'Премиум Авто'
    },
    {
      id: '3',
      email: 'admin@velesdrive.ru',
      full_name: 'Системный Администратор',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-01-16T17:30:00Z',
      two_fa_enabled: true,
      phone: '+7-800-555-0000'
    },
    {
      id: '4',
      email: 'blocked.user@example.com',
      full_name: 'Заблокированный Пользователь',
      role: 'buyer',
      status: 'blocked',
      created_at: '2024-01-12T12:00:00Z',
      last_login: '2024-01-14T10:00:00Z',
      total_purchases: 0,
      two_fa_enabled: false,
      phone: '+7-900-999-8888',
      block_reason: 'Спам и мошенничество'
    },
    {
      id: '5',
      email: 'new.dealer@cars.ru',
      full_name: 'Новый Автосалон',
      role: 'dealer',
      status: 'pending',
      created_at: '2024-01-16T08:00:00Z',
      last_login: '2024-01-16T08:15:00Z',
      total_sales: 0,
      two_fa_enabled: false,
      phone: '+7-812-987-6543',
      company_name: 'Авто Центр СПб'
    }
  ];

  const mockReports = [
    {
      id: '1',
      type: 'security',
      title: 'Отчет по безопасности',
      description: 'Еженедельный отчет по безопасности системы',
      created_at: '2024-01-16T10:00:00Z',
      status: 'completed',
      data: {
        failed_logins: 45,
        blocked_ips: 12,
        security_alerts: 3
      }
    },
    {
      id: '2',
      type: 'sales',
      title: 'Отчет по продажам',
      description: 'Месячный отчет по продажам и транзакциям',
      created_at: '2024-01-16T09:30:00Z',
      status: 'completed',
      data: {
        total_sales: 156,
        revenue: 2856000,
        top_dealers: ['Премиум Авто', 'Элит Моторс']
      }
    },
    {
      id: '3',
      type: 'system',
      title: 'Системный отчет',
      description: 'Производительность и мониторинг системы',
      created_at: '2024-01-16T08:00:00Z',
      status: 'generating',
      data: {
        uptime: 99.8,
        response_time: 142,
        active_sessions: 312
      }
    }
  ];

  const mockPendingItems = [
    {
      id: '1',
      type: 'car',
      title: 'Mercedes-Benz S-Class 2024',
      submitter: 'Премиум Авто Москва',
      submitted_at: '2024-01-16T10:30:00Z',
      reason: 'Новое объявление'
    },
    {
      id: '2', 
      type: 'dealer',
      title: 'Элит Моторс СПб',
      submitter: 'elite@motors.ru',
      submitted_at: '2024-01-16T09:15:00Z',
      reason: 'Регистрация дилера'
    },
    {
      id: '3',
      type: 'review',
      title: 'Отзыв о BMW X5',
      submitter: 'Иван Петров',
      submitted_at: '2024-01-16T08:45:00Z',
      reason: 'Жалоба на отзыв'
    }
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // In a real implementation, these would be API calls
      setStats(mockStats);
      setUsers(mockUsers);
      setPendingItems(mockPendingItems);
      setReports(mockReports);
    } catch (error) {
      toast.error('Ошибка загрузки данных администратора');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-shield-alt text-6xl text-red-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-gray-400 mb-6">Панель администратора доступна только для админов</p>
          <Button className="btn-gold" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left mr-2"></i>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = async (itemId, type) => {
    try {
      // Mock approval
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      toast.success(`${type === 'car' ? 'Автомобиль' : type === 'dealer' ? 'Дилер' : 'Отзыв'} одобрен`);
    } catch (error) {
      toast.error('Ошибка при одобрении');
    }
  };

  const handleReject = async (itemId, type) => {
    try {
      // Mock rejection
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      toast.success(`${type === 'car' ? 'Автомобиль' : type === 'dealer' ? 'Дилер' : 'Отзыв'} отклонен`);
    } catch (error) {
      toast.error('Ошибка при отклонении');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'blocked', block_reason: 'Заблокирован администратором' }
          : user
      ));
      toast.success('Пользователь заблокирован');
    } catch (error) {
      toast.error('Ошибка при блокировке пользователя');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'active', block_reason: null }
          : user
      ));
      toast.success('Пользователь разблокирован');
    } catch (error) {
      toast.error('Ошибка при разблокировке пользователя');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'active' }
          : user
      ));
      toast.success('Пользователь одобрен');
    } catch (error) {
      toast.error('Ошибка при одобрении пользователя');
    }
  };

  const exportReport = async (reportType) => {
    try {
      toast.success(`Отчет "${reportType}" экспортирован`);
    } catch (error) {
      toast.error('Ошибка при экспорте отчета');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.status === userFilter || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'users', label: 'Пользователи', icon: Users, count: users.filter(u => u.status === 'pending').length },
    { id: 'moderation', label: 'Модерация', icon: Shield, count: pendingItems.length },
    { id: 'analytics', label: 'Аналитика', icon: TrendingUp },
    { id: 'reports', label: 'Отчеты', icon: Activity },
    { id: 'settings', label: 'Настройки', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Всего пользователей</p>
              <p className="text-3xl font-bold text-white">{formatNumber(stats.total_users)}</p>
              <p className="text-green-400 text-sm">
                <i className="fas fa-arrow-up mr-1"></i>
                +{stats.new_registrations} за месяц
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-white"></i>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Активные дилеры</p>
              <p className="text-3xl font-bold text-white">{formatNumber(stats.total_dealers)}</p>
              <p className="text-gold text-sm">
                <i className="fas fa-store mr-1"></i>
                Верифицированных
              </p>
            </div>
            <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
              <i className="fas fa-store text-black"></i>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Автомобили</p>
              <p className="text-3xl font-bold text-white">{formatNumber(stats.total_cars)}</p>
              <p className="text-blue-400 text-sm">
                <i className="fas fa-car mr-1"></i>
                В каталоге
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-car text-white"></i>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Месячный доход</p>
              <p className="text-3xl font-bold text-white">{formatPrice(stats.monthly_revenue)}</p>
              <p className="text-green-400 text-sm">
                <i className="fas fa-arrow-up mr-1"></i>
                +12% к прошлому месяцу
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-ruble-sign text-white"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Последние действия</h3>
          <div className="space-y-4">
            {[
              { action: 'Новый дилер зарегистрирован', user: 'Элит Моторс', time: '5 мин назад', type: 'success' },
              { action: 'Автомобиль добавлен в каталог', user: 'Премиум Авто', time: '12 мин назад', type: 'info' },
              { action: 'Подписка активирована', user: 'Иван Петров', time: '25 мин назад', type: 'success' },
              { action: 'Жалоба на отзыв', user: 'Анна Смирнова', time: '1 час назад', type: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-800/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button className="btn-outline-gold h-20 flex-col">
              <i className="fas fa-plus text-2xl mb-2"></i>
              <span>Добавить админа</span>
            </Button>
            <Button className="btn-outline-gold h-20 flex-col">
              <i className="fas fa-ban text-2xl mb-2"></i>
              <span>Заблокировать пользователя</span>
            </Button>
            <Button className="btn-outline-gold h-20 flex-col">
              <i className="fas fa-bullhorn text-2xl mb-2"></i>
              <span>Отправить уведомление</span>
            </Button>
            <Button className="btn-outline-gold h-20 flex-col">
              <i className="fas fa-download text-2xl mb-2"></i>
              <span>Экспорт данных</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ожидают модерации</h2>
        <div className="flex gap-3">
          <Button className="btn-outline-gold">
            <i className="fas fa-filter mr-2"></i>
            Фильтры
          </Button>
          <Button className="btn-gold">
            <i className="fas fa-check-double mr-2"></i>
            Одобрить все
          </Button>
        </div>
      </div>

      {pendingItems.length > 0 ? (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <Card key={item.id} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.type === 'car' ? 'bg-blue-600' :
                    item.type === 'dealer' ? 'bg-gold' : 'bg-green-600'
                  }`}>
                    <i className={`fas ${
                      item.type === 'car' ? 'fa-car' :
                      item.type === 'dealer' ? 'fa-store' : 'fa-star'
                    } text-white ${item.type === 'dealer' ? 'text-black' : ''}`}></i>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.submitter} • {formatDate(item.submitted_at)}</p>
                    <p className="text-gray-500 text-xs">{item.reason}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    onClick={() => handleReject(item.id, item.type)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                    variant="ghost"
                  >
                    <i className="fas fa-times mr-1"></i>
                    Отклонить
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(item.id, item.type)}
                    className="btn-gold"
                  >
                    <i className="fas fa-check mr-1"></i>
                    Одобрить
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card p-12 text-center">
          <i className="fas fa-check-circle text-6xl text-green-400 mb-4"></i>
          <h3 className="text-2xl font-bold text-white mb-2">Все проверено!</h3>
          <p className="text-gray-400">Нет элементов, ожидающих модерации</p>
        </Card>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка панели администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Панель администратора
            <Badge className="bg-red-600 text-white ml-3">ADMIN</Badge>
          </h1>
          <p className="text-gray-400">
            Добро пожаловать, {user.full_name} • Активные сессии: {stats.active_sessions}
          </p>
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
                <Badge className="bg-red-600 text-white ml-2 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'moderation' && renderModeration()}
          {activeTab === 'users' && (
            <Card className="glass-card p-8 text-center">
              <i className="fas fa-users text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">Управление пользователями</h3>
              <p className="text-gray-400">Раздел в разработке</p>
            </Card>
          )}
          {activeTab === 'reports' && (
            <Card className="glass-card p-8 text-center">
              <i className="fas fa-chart-bar text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">Отчеты и аналитика</h3>
              <p className="text-gray-400">Раздел в разработке</p>
            </Card>
          )}
          {activeTab === 'settings' && (
            <Card className="glass-card p-8 text-center">
              <i className="fas fa-cog text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">Системные настройки</h3>
              <p className="text-gray-400">Раздел в разработке</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;