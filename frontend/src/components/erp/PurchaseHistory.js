import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ShoppingBag, 
  Calendar, 
  User, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter,
  Eye,
  Download,
  BarChart3,
  Clock,
  CreditCard,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('purchases');
  const { toast } = useToast();

  // Mock purchase history data
  const mockPurchases = [
    {
      id: '1',
      transaction_id: 'TX-2024-001',
      client_id: '1',
      client_name: 'Алексей Петров',
      client_email: 'alexey.petrov@example.com',
      client_phone: '+7-905-123-4567',
      car: {
        id: 'c1',
        brand: 'BMW',
        model: 'X5',
        year: 2024,
        vin: 'WBAFR9C50DD000001',
        color: 'Черный металлик',
        engine: '3.0L Турбо',
        transmission: 'Автомат'
      },
      purchase_date: '2024-01-15T14:30:00Z',
      delivery_date: '2024-01-18T10:00:00Z',
      price: 6200000,
      discount: 300000,
      final_price: 5900000,
      payment_method: 'financing',
      payment_status: 'completed',
      financing_details: {
        down_payment: 1500000,
        loan_amount: 4400000,
        interest_rate: 12.5,
        term_months: 36,
        monthly_payment: 145833,
        bank: 'Сбербанк'
      },
      status: 'delivered',
      sales_manager: 'Иван Петров',
      additional_services: [
        { name: 'Расширенная гарантия', price: 150000 },
        { name: 'Страхование КАСКО', price: 85000 },
        { name: 'Установка сигнализации', price: 25000 }
      ],
      documents: [
        { name: 'Договор купли-продажи', type: 'contract', date: '2024-01-15T14:30:00Z' },
        { name: 'ПТС', type: 'title', date: '2024-01-16T12:00:00Z' },
        { name: 'ОСАГО', type: 'insurance', date: '2024-01-17T09:00:00Z' }
      ],
      service_history: [
        {
          id: 's1',
          date: '2024-01-20T10:00:00Z',
          type: 'maintenance',
          description: 'Предпродажная подготовка',
          cost: 15000
        }
      ],
      notes: 'VIP клиент, быстрое оформление сделки, доставка на дом',
      rating: 5,
      feedback: 'Отличное обслуживание, всем доволен!'
    },
    {
      id: '2',
      transaction_id: 'TX-2024-002',
      client_id: '2',
      client_name: 'Мария Козлова',
      client_email: 'maria.kozlova@example.com',
      client_phone: '+7-916-987-6543',
      car: {
        id: 'c2',
        brand: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2023,
        vin: 'WDD213001CA000002',
        color: 'Белый перламутр',
        engine: '2.0L Турбо',
        transmission: 'Автомат'
      },
      purchase_date: '2024-01-10T11:20:00Z',
      delivery_date: '2024-01-12T15:00:00Z',
      price: 5800000,
      discount: 200000,
      final_price: 5600000,
      payment_method: 'trade_in_cash',
      payment_status: 'completed',
      trade_in_details: {
        old_car: 'Mercedes C-Class 2020',
        trade_in_value: 2800000,
        cash_payment: 2800000
      },
      status: 'delivered',
      sales_manager: 'Елена Смирнова',
      additional_services: [
        { name: 'Детейлинг', price: 45000 },
        { name: 'Тонировка', price: 18000 }
      ],
      documents: [
        { name: 'Договор купли-продажи', type: 'contract', date: '2024-01-10T11:20:00Z' },
        { name: 'Договор Trade-In', type: 'trade_in', date: '2024-01-10T11:30:00Z' },
        { name: 'ПТС', type: 'title', date: '2024-01-11T14:00:00Z' }
      ],
      service_history: [],
      notes: 'Клиент очень довольна Trade-In программой',
      rating: 5,
      feedback: 'Быстро и удобно обменяли старый автомобиль!'
    },
    {
      id: '3',
      transaction_id: 'TX-2023-156',
      client_id: '3',
      client_name: 'Дмитрий Новиков',
      client_email: 'dmitry.novikov@business.com',
      client_phone: '+7-495-555-0123',
      car: {
        id: 'c3',
        brand: 'Audi',
        model: 'A6',
        year: 2023,
        vin: 'WAUZZZ4G5DN000003',
        color: 'Серый металлик',
        engine: '3.0L TFSI',
        transmission: 'Типтроник'
      },
      purchase_date: '2023-12-20T16:45:00Z',
      delivery_date: '2023-12-22T10:00:00Z',
      price: 4200000,
      discount: 150000,
      final_price: 4050000,
      payment_method: 'leasing',
      payment_status: 'active',
      leasing_details: {
        monthly_payment: 125000,
        term_months: 36,
        residual_value: 1600000,
        leasing_company: 'VEB Лизинг'
      },
      status: 'delivered',
      sales_manager: 'Андрей Волков',
      additional_services: [
        { name: 'ТО на 3 года', price: 120000 },
        { name: 'Зимние шины', price: 65000 }
      ],
      documents: [
        { name: 'Лизинговый договор', type: 'leasing', date: '2023-12-20T16:45:00Z' },
        { name: 'ПТС', type: 'title', date: '2023-12-21T11:00:00Z' }
      ],
      service_history: [
        {
          id: 's2',
          date: '2024-01-15T09:00:00Z',
          type: 'maintenance',
          description: 'Плановое ТО 5000 км',
          cost: 25000
        }
      ],
      notes: 'Корпоративный клиент, лизинг, регулярные закупки',
      rating: 4,
      feedback: 'Хорошие условия лизинга, удобное обслуживание'
    },
    {
      id: '4',
      transaction_id: 'TX-2023-189',
      client_id: '4',
      client_name: 'Елена Соколова',
      client_email: 'elena.sokolova@example.com',
      client_phone: '+7-903-444-5566',
      car: {
        id: 'c4',
        brand: 'Lexus',
        model: 'RX',
        year: 2023,
        vin: 'JTJBK1BA6D2000004',
        color: 'Белый',
        engine: '2.4L Гибрид',
        transmission: 'CVT'
      },
      purchase_date: '2023-11-28T13:15:00Z',
      delivery_date: '2023-11-30T16:00:00Z',
      price: 4950000,
      discount: 0,
      final_price: 4950000,
      payment_method: 'cash',
      payment_status: 'completed',
      status: 'delivered',
      sales_manager: 'Ольга Федорова',
      additional_services: [
        { name: 'Защитная пленка', price: 75000 },
        { name: 'Керамическое покрытие', price: 55000 }
      ],
      documents: [
        { name: 'Договор купли-продажи', type: 'contract', date: '2023-11-28T13:15:00Z' },
        { name: 'ПТС', type: 'title', date: '2023-11-29T10:00:00Z' },
        { name: 'КАСКО', type: 'insurance', date: '2023-11-29T14:00:00Z' }
      ],
      service_history: [
        {
          id: 's3',
          date: '2024-01-05T11:00:00Z',
          type: 'maintenance',
          description: 'ТО 10,000 км',
          cost: 32000
        }
      ],
      notes: 'Премиум клиент, полная оплата наличными',
      rating: 5,
      feedback: 'Превосходное качество автомобиля и сервиса!'
    }
  ];

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setPurchases(mockPurchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю покупок",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    // Period filter
    const purchaseDate = new Date(purchase.purchase_date);
    const now = new Date();
    let matchesPeriod = true;
    
    if (periodFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesPeriod = purchaseDate >= weekAgo;
    } else if (periodFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesPeriod = purchaseDate >= monthAgo;
    } else if (periodFilter === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      matchesPeriod = purchaseDate >= quarterAgo;
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600 text-black';
      case 'processing': return 'bg-blue-600 text-white';
      case 'delivered': return 'bg-green-600 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'В обработке';
      case 'processing': return 'Оформляется';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидает оплаты';
      case 'completed': return 'Оплачено';
      case 'active': return 'Активный';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Наличные';
      case 'financing': return 'Кредит';
      case 'leasing': return 'Лизинг';
      case 'trade_in_cash': return 'Trade-In + доплата';
      case 'installment': return 'Рассрочка';
      default: return method;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOverview = () => {
    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((sum, p) => sum + p.final_price, 0);
    const averagePrice = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;
    const deliveredPurchases = purchases.filter(p => p.status === 'delivered').length;
    const currentMonthPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.purchase_date);
      const now = new Date();
      return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
    }).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего покупок</p>
                <p className="text-2xl font-bold text-white">{totalPurchases}</p>
              </div>
              <ShoppingBag className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Общий доход</p>
                <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Средний чек</p>
                <p className="text-2xl font-bold text-white">{formatPrice(averagePrice)}</p>
              </div>
              <TrendingUp className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Доставлено</p>
                <p className="text-2xl font-bold text-white">{deliveredPurchases}</p>
              </div>
              <Car className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">В этом месяце</p>
                <p className="text-2xl font-bold text-white">{currentMonthPurchases}</p>
              </div>
              <Calendar className="text-purple-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="text-gray-400 mt-2">Загрузка истории покупок...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">История покупок</h2>
            <p className="text-gray-400">Полная история всех транзакций и продаж</p>
          </div>
        </div>

        <div className="flex space-x-1 mb-6">
          {[
            { id: 'purchases', label: 'История покупок', icon: ShoppingBag },
            { id: 'analytics', label: 'Аналитика', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-600 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'purchases' && (
        <>
          {/* Overview Stats */}
          {renderOverview()}

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по клиенту, номеру сделки, автомобилю..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <Filter size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">В обработке</SelectItem>
                  <SelectItem value="processing">Оформляется</SelectItem>
                  <SelectItem value="delivered">Доставлено</SelectItem>
                  <SelectItem value="cancelled">Отменено</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <Calendar size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Весь период</SelectItem>
                  <SelectItem value="week">Последняя неделя</SelectItem>
                  <SelectItem value="month">Последний месяц</SelectItem>
                  <SelectItem value="quarter">Последние 3 месяца</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-green-600 text-white hover:bg-green-700">
              <Download size={16} className="mr-2" />
              Экспорт
            </Button>
          </div>

          {/* Purchases List */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Сделка</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Клиент</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Автомобиль</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Сумма</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Оплата</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Статус</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Дата</th>
                      <th className="text-right p-4 text-gray-300 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{purchase.transaction_id}</p>
                            <p className="text-gray-400 text-sm">
                              Менеджер: {purchase.sales_manager}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{purchase.client_name}</p>
                            <div className="flex items-center text-gray-300 text-sm mt-1">
                              <User size={12} className="mr-1" />
                              {purchase.client_phone}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">
                              {purchase.car.brand} {purchase.car.model}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {purchase.car.year} • {purchase.car.color}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{formatPrice(purchase.final_price)}</p>
                            {purchase.discount > 0 && (
                              <p className="text-green-400 text-sm">
                                Скидка: {formatPrice(purchase.discount)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-gray-300 text-sm">{getPaymentMethodText(purchase.payment_method)}</p>
                            <Badge className={getPaymentStatusColor(purchase.payment_status)}>
                              {getPaymentStatusText(purchase.payment_status)}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(purchase.status)}>
                            {getStatusText(purchase.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-sm">
                            <p>📅 {formatDate(purchase.purchase_date)}</p>
                            {purchase.delivery_date && (
                              <p className="text-green-400">🚚 {formatDate(purchase.delivery_date)}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedPurchase(purchase);
                                setShowPurchaseDetails(true);
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <FileText size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-400 hover:text-green-300"
                            >
                              <Download size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPurchases.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="text-gray-600 mx-auto mb-4" size={48} />
                  <h3 className="text-white font-medium mb-2">Покупки не найдены</h3>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== 'all' || periodFilter !== 'all'
                      ? 'Попробуйте изменить критерии поиска' 
                      : 'История покупок пуста'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Продажи по брендам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { brand: 'BMW', sales: 1, revenue: 5900000, percentage: 28 },
                    { brand: 'Mercedes-Benz', sales: 1, revenue: 5600000, percentage: 27 },
                    { brand: 'Audi', sales: 1, revenue: 4050000, percentage: 19 },
                    { brand: 'Lexus', sales: 1, revenue: 4950000, percentage: 24 }
                  ].map((item) => (
                    <div key={item.brand} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.brand}</p>
                        <p className="text-gray-400 text-sm">{item.sales} продаж</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{formatPrice(item.revenue)}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${item.percentage}%`}}></div>
                          </div>
                          <span className="text-yellow-400 text-sm">{item.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Методы оплаты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { method: 'financing', count: 1, percentage: 25, label: 'Кредит' },
                    { method: 'trade_in_cash', count: 1, percentage: 25, label: 'Trade-In + доплата' },
                    { method: 'leasing', count: 1, percentage: 25, label: 'Лизинг' },
                    { method: 'cash', count: 1, percentage: 25, label: 'Наличные' }
                  ].map((item) => (
                    <div key={item.method} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.label}</p>
                        <p className="text-gray-400 text-sm">{item.count} сделок</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${item.percentage}%`}}></div>
                        </div>
                        <span className="text-blue-400 text-sm w-10">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Purchase Details Dialog */}
      <Dialog open={showPurchaseDetails} onOpenChange={setShowPurchaseDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="text-blue-400" size={20} />
              Сделка {selectedPurchase?.transaction_id}
            </DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Purchase and Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Информация о сделке</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Номер:</span>
                      <span className="text-white">{selectedPurchase.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Дата покупки:</span>
                      <span className="text-white">{formatDate(selectedPurchase.purchase_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Менеджер:</span>
                      <span className="text-white">{selectedPurchase.sales_manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Статус:</span>
                      <Badge className={getStatusColor(selectedPurchase.status)}>
                        {getStatusText(selectedPurchase.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Клиент</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Имя:</span>
                      <span className="text-white">{selectedPurchase.client_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedPurchase.client_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Телефон:</span>
                      <span className="text-white">{selectedPurchase.client_phone}</span>
                    </div>
                    {selectedPurchase.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Оценка:</span>
                        <span className="text-yellow-400">{'⭐'.repeat(selectedPurchase.rating)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Автомобиль</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Модель:</span>
                      <span className="text-white">{selectedPurchase.car.brand} {selectedPurchase.car.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Год:</span>
                      <span className="text-white">{selectedPurchase.car.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Цвет:</span>
                      <span className="text-white">{selectedPurchase.car.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VIN:</span>
                      <span className="text-white font-mono text-xs">{selectedPurchase.car.vin}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Финансы</h4>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Цена автомобиля:</span>
                      <span className="text-white">{formatPrice(selectedPurchase.price)}</span>
                    </div>
                    {selectedPurchase.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Скидка:</span>
                        <span className="text-green-400">-{formatPrice(selectedPurchase.discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Итоговая сумма:</span>
                        <span className="text-yellow-400 text-lg">{formatPrice(selectedPurchase.final_price)}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Способ оплаты:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <CreditCard size={16} className="text-blue-400" />
                        <span className="text-white">{getPaymentMethodText(selectedPurchase.payment_method)}</span>
                        <Badge className={getPaymentStatusColor(selectedPurchase.payment_status)}>
                          {getPaymentStatusText(selectedPurchase.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h4 className="text-white font-medium mb-3">Детали оплаты</h4>
                  <div className="bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                    {selectedPurchase.financing_details && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Первоначальный взнос:</span>
                          <span className="text-white">{formatPrice(selectedPurchase.financing_details.down_payment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Сумма кредита:</span>
                          <span className="text-white">{formatPrice(selectedPurchase.financing_details.loan_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ставка:</span>
                          <span className="text-white">{selectedPurchase.financing_details.interest_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ежемесячный платеж:</span>
                          <span className="text-yellow-400">{formatPrice(selectedPurchase.financing_details.monthly_payment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Банк:</span>
                          <span className="text-white">{selectedPurchase.financing_details.bank}</span>
                        </div>
                      </>
                    )}

                    {selectedPurchase.trade_in_details && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Автомобиль в зачет:</span>
                          <span className="text-white">{selectedPurchase.trade_in_details.old_car}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Оценка Trade-In:</span>
                          <span className="text-green-400">{formatPrice(selectedPurchase.trade_in_details.trade_in_value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Доплата:</span>
                          <span className="text-white">{formatPrice(selectedPurchase.trade_in_details.cash_payment)}</span>
                        </div>
                      </>
                    )}

                    {selectedPurchase.leasing_details && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ежемесячный платеж:</span>
                          <span className="text-yellow-400">{formatPrice(selectedPurchase.leasing_details.monthly_payment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Срок:</span>
                          <span className="text-white">{selectedPurchase.leasing_details.term_months} мес.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Остаточная стоимость:</span>
                          <span className="text-white">{formatPrice(selectedPurchase.leasing_details.residual_value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Лизинговая компания:</span>
                          <span className="text-white">{selectedPurchase.leasing_details.leasing_company}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              {selectedPurchase.additional_services && selectedPurchase.additional_services.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Дополнительные услуги</h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="space-y-2">
                      {selectedPurchase.additional_services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-white">{service.name}</span>
                          <span className="text-yellow-400">{formatPrice(service.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedPurchase.documents && selectedPurchase.documents.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Документы</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedPurchase.documents.map((doc, index) => (
                      <div key={index} className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-blue-400" />
                          <span className="text-white text-sm font-medium">{doc.name}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{formatDate(doc.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Feedback */}
              {selectedPurchase.feedback && (
                <div>
                  <h4 className="text-white font-medium mb-3">Отзыв клиента</h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">{'⭐'.repeat(selectedPurchase.rating || 5)}</span>
                      <span className="text-gray-400 text-sm">({selectedPurchase.rating}/5)</span>
                    </div>
                    <p className="text-gray-300 text-sm italic">"{selectedPurchase.feedback}"</p>
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              {selectedPurchase.notes && (
                <div>
                  <h4 className="text-white font-medium mb-3">Внутренние заметки</h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm">{selectedPurchase.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;