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
  Activity,
  DollarSign,
  UserCheck,
  UserX,
  Clock,
  Globe
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
      title: 'Отзыв на BMW X5',
      submitter: 'user@example.com',
      submitted_at: '2024-01-16T08:45:00Z',
      reason: 'Жалоба на отзыв'
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
          <Shield className="text-red-600 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-gray-400 mb-6">Панель администратора доступна только для админов</p>
          <Button className="bg-yellow-600 text-black hover:bg-yellow-700" onClick={() => window.history.back()}>
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
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      toast.success(`${type === 'car' ? 'Автомобиль' : type === 'dealer' ? 'Дилер' : 'Отзыв'} одобрен`);
    } catch (error) {
      toast.error('Ошибка при одобрении');
    }
  };

  const handleReject = async (itemId, type) => {
    try {
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

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего пользователей</p>
                <p className="text-3xl font-bold text-white">{formatNumber(stats.total_users)}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +{stats.new_registrations} за месяц
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Активные дилеры</p>
                <p className="text-3xl font-bold text-white">{formatNumber(stats.total_dealers)}</p>
                <p className="text-yellow-400 text-sm flex items-center">
                  <Store size={14} className="mr-1" />
                  Верифицированных
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Store className="text-black" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Автомобили</p>
                <p className="text-3xl font-bold text-white">{formatNumber(stats.total_cars)}</p>
                <p className="text-blue-400 text-sm flex items-center">
                  <Car size={14} className="mr-1" />
                  В каталоге
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Car className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Месячный доход</p>
                <p className="text-3xl font-bold text-white">{formatPrice(stats.monthly_revenue)}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +12% к прошлому месяцу
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Система</h3>
              <Globe className="text-green-400" size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-400">{stats.server_uptime}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Время отклика</span>
                <span className="text-blue-400">{stats.avg_response_time}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Активные сессии</span>
                <span className="text-white">{stats.active_sessions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Безопасность</h3>
              <Shield className="text-red-400" size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Заблокированные</span>
                <span className="text-red-400">{stats.blocked_users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Жалобы</span>
                <span className="text-yellow-400">{stats.reported_content}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Алерты</span>
                <span className="text-red-400">{stats.system_alerts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Активность</h3>
              <Activity className="text-blue-400" size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Просмотры</span>
                <span className="text-blue-400">{formatNumber(stats.total_views)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Конверсия</span>
                <span className="text-green-400">{stats.conversion_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Premium юзеров</span>
                <span className="text-yellow-400">{stats.premium_users}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => setActiveTab('users')} 
              className="bg-blue-600 text-white hover:bg-blue-700 h-20 flex-col gap-2"
            >
              <Users size={24} />
              <span>Управление пользователями</span>
            </Button>
            <Button 
              onClick={() => setActiveTab('moderation')} 
              className="bg-yellow-600 text-black hover:bg-yellow-700 h-20 flex-col gap-2"
            >
              <Shield size={24} />
              <span>Модерация</span>
            </Button>
            <Button 
              onClick={() => setActiveTab('reports')} 
              className="bg-green-600 text-white hover:bg-green-700 h-20 flex-col gap-2"
            >
              <BarChart3 size={24} />
              <span>Отчеты</span>
            </Button>
            <Button 
              onClick={() => setActiveTab('settings')} 
              className="bg-gray-600 text-white hover:bg-gray-700 h-20 flex-col gap-2"
            >
              <Settings size={24} />
              <span>Настройки</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Фильтр" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все пользователи</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="blocked">Заблокированные</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
            <SelectItem value="buyer">Покупатели</SelectItem>
            <SelectItem value="dealer">Дилеры</SelectItem>
            <SelectItem value="admin">Администраторы</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Пользователь</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Роль</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Статус</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Последний вход</th>
                  <th className="text-left p-4 text-gray-300 font-medium">2FA</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{userData.full_name}</p>
                        <p className="text-gray-400 text-sm">{userData.email}</p>
                        {userData.company_name && (
                          <p className="text-gray-500 text-xs">{userData.company_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge 
                        className={
                          userData.role === 'admin' ? 'bg-red-600 text-white' :
                          userData.role === 'dealer' ? 'bg-yellow-600 text-black' :
                          'bg-blue-600 text-white'
                        }
                      >
                        {userData.role === 'admin' ? 'Админ' : 
                         userData.role === 'dealer' ? 'Дилер' : 'Покупатель'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge 
                        className={
                          userData.status === 'active' ? 'bg-green-600 text-white' :
                          userData.status === 'blocked' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-black'
                        }
                      >
                        {userData.status === 'active' ? 'Активен' :
                         userData.status === 'blocked' ? 'Заблокирован' : 'Ожидание'}
                      </Badge>
                      {userData.block_reason && (
                        <p className="text-red-400 text-xs mt-1">{userData.block_reason}</p>
                      )}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {formatDate(userData.last_login)}
                    </td>
                    <td className="p-4">
                      {userData.two_fa_enabled ? (
                        <CheckCircle className="text-green-400" size={18} />
                      ) : (
                        <XCircle className="text-red-400" size={18} />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => setSelectedUser(userData)}
                            >
                              <Eye size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Детали пользователя</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-gray-300">Имя</Label>
                                    <p className="text-white">{selectedUser.full_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Email</Label>
                                    <p className="text-white">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Телефон</Label>
                                    <p className="text-white">{selectedUser.phone}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Роль</Label>
                                    <p className="text-white">{selectedUser.role}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Дата регистрации</Label>
                                    <p className="text-white">{formatDate(selectedUser.created_at)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">Статус</Label>
                                    <p className="text-white">{selectedUser.status}</p>
                                  </div>
                                </div>
                                {selectedUser.role === 'buyer' && (
                                  <div>
                                    <Label className="text-gray-300">Покупки</Label>
                                    <p className="text-white">{selectedUser.total_purchases || 0}</p>
                                  </div>
                                )}
                                {selectedUser.role === 'dealer' && (
                                  <div>
                                    <Label className="text-gray-300">Продажи</Label>
                                    <p className="text-white">{selectedUser.total_sales || 0}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {userData.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveUser(userData.id)}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <UserCheck size={16} />
                          </Button>
                        )}
                        
                        {userData.status === 'active' && userData.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleBlockUser(userData.id)}
                          >
                            <Ban size={16} />
                          </Button>
                        )}
                        
                        {userData.status === 'blocked' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUnblockUser(userData.id)}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <UserX size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Модерация контента</h2>
        <Button onClick={loadAdminData} className="bg-gray-600 text-white hover:bg-gray-700">
          <RefreshCw size={16} className="mr-2" />
          Обновить
        </Button>
      </div>

      {pendingItems.length === 0 ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="text-center py-16">
            <CheckCircle className="text-green-400 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">Нет элементов для модерации</h3>
            <p className="text-gray-400">Все элементы проверены</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <Card key={item.id} className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge 
                        className={
                          item.type === 'car' ? 'bg-blue-600 text-white' :
                          item.type === 'dealer' ? 'bg-yellow-600 text-black' :
                          'bg-green-600 text-white'
                        }
                      >
                        {item.type === 'car' ? 'Автомобиль' : 
                         item.type === 'dealer' ? 'Дилер' : 'Отзыв'}
                      </Badge>
                      <h3 className="text-white font-medium">{item.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">От: {item.submitter}</p>
                    <p className="text-gray-500 text-xs">
                      {formatDate(item.submitted_at)} • {item.reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleApprove(item.id, item.type)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Одобрить
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(item.id, item.type)}
                    >
                      <XCircle size={16} className="mr-1" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Отчеты системы</h2>
        <Button onClick={() => exportReport('all')} className="bg-yellow-600 text-black hover:bg-yellow-700">
          <Download size={16} className="mr-2" />
          Экспорт всех отчетов
        </Button>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      className={
                        report.status === 'completed' ? 'bg-green-600 text-white' :
                        report.status === 'generating' ? 'bg-yellow-600 text-black' :
                        'bg-gray-600 text-white'
                      }
                    >
                      {report.status === 'completed' ? 'Готов' :
                       report.status === 'generating' ? 'Генерируется' : 'Ожидание'}
                    </Badge>
                    <h3 className="text-white font-medium">{report.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                  <p className="text-gray-500 text-xs">
                    Создан: {formatDate(report.created_at)}
                  </p>
                  {report.data && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(report.data).map(([key, value]) => (
                        <div key={key} className="bg-gray-800 p-3 rounded">
                          <p className="text-gray-400 text-xs capitalize">{key.replace('_', ' ')}</p>
                          <p className="text-white font-medium">
                            {typeof value === 'number' ? formatNumber(value) : 
                             Array.isArray(value) ? value.join(', ') : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {report.status === 'completed' && (
                    <Button 
                      size="sm"
                      onClick={() => exportReport(report.type)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Download size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Настройки системы</h2>
      
      <div className="grid gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Общие настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Название платформы</Label>
              <Input 
                defaultValue="VELES DRIVE" 
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Email поддержки</Label>
              <Input 
                defaultValue="support@velesdrive.ru" 
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Максимальное количество изображений на автомобиль</Label>
              <Input 
                type="number"
                defaultValue="10" 
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Настройки безопасности</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Требовать 2FA для дилеров</Label>
                <p className="text-gray-500 text-sm">Обязательная двухфакторная аутентификация</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Автоматическая модерация</Label>
                <p className="text-gray-500 text-sm">AI-модерация объявлений</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
            <div>
              <Label className="text-gray-300">Максимальное количество попыток входа</Label>
              <Input 
                type="number"
                defaultValue="5" 
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Backup и восстановление</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Автоматический backup</Label>
                <p className="text-gray-500 text-sm">Ежедневное резервное копирование в 3:00 МСК</p>
              </div>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Включено
              </Button>
            </div>
            <div className="flex gap-4">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Download size={16} className="mr-2" />
                Создать backup
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <RefreshCw size={16} className="mr-2" />
                Восстановить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Загрузка панели администратора...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Панель администратора</h1>
          <p className="text-gray-400">Управление платформой VELES DRIVE</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-white data-[state=active]:bg-yellow-600 data-[state=active]:text-black flex items-center gap-2"
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="bg-red-600 text-white text-xs">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="users">{renderUsers()}</TabsContent>
          <TabsContent value="moderation">{renderModeration()}</TabsContent>
          <TabsContent value="analytics">{renderOverview()}</TabsContent>
          <TabsContent value="reports">{renderReports()}</TabsContent>
          <TabsContent value="settings">{renderSettings()}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;