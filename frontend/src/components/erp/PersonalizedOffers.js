import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Gift, 
  Target, 
  Users, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter,
  Mail,
  MessageCircle,
  Calendar,
  DollarSign,
  Car,
  Sparkles,
  Send,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const PersonalizedOffers = () => {
  const [offers, setOffers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('offers');
  const { toast } = useToast();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Mock offers data
  const mockOffers = [
    {
      id: '1',
      title: 'Специальное предложение BMW X5',
      description: 'Эксклюзивная скидка 15% на BMW X5 2024 года для VIP клиентов',
      client_id: '1',
      client_name: 'Алексей Петров',
      client_email: 'alexey.petrov@example.com',
      client_phone: '+7-905-123-4567',
      client_segment: 'VIP',
      offer_type: 'discount',
      discount_type: 'percentage',
      discount_value: 15,
      target_cars: [
        {
          id: 'c1',
          brand: 'BMW',
          model: 'X5',
          year: 2024,
          price: 6200000,
          discounted_price: 5270000
        }
      ],
      valid_from: '2024-01-20T00:00:00Z',
      valid_until: '2024-02-20T23:59:59Z',
      status: 'active',
      created_at: '2024-01-18T10:00:00Z',
      sent_at: '2024-01-18T14:30:00Z',
      opened_at: '2024-01-19T09:15:00Z',
      response_status: 'interested',
      notes: 'Клиент проявил интерес, планирует тест-драйв на выходных',
      personalization_factors: [
        'Предыдущие покупки BMW',
        'VIP статус',
        'Бюджет > 5M RUB',
        'Предпочтение премиум SUV'
      ],
      interaction_history: [
        {
          id: 'i1',
          type: 'email_sent',
          description: 'Персональное предложение отправлено',
          date: '2024-01-18T14:30:00Z'
        },
        {
          id: 'i2',
          type: 'email_opened',
          description: 'Письмо открыто клиентом',
          date: '2024-01-19T09:15:00Z'
        },
        {
          id: 'i3',
          type: 'phone_call',
          description: 'Звонок клиента, проявил интерес',
          date: '2024-01-19T11:30:00Z'
        }
      ]
    },
    {
      id: '2',
      title: 'Выгодный обмен Mercedes-Benz E-Class',
      description: 'Специальная программа Trade-In для Mercedes с доплатой всего 2.5М',
      client_id: '2',
      client_name: 'Мария Козлова',
      client_email: 'maria.kozlova@example.com',
      client_phone: '+7-916-987-6543',
      client_segment: 'Business',
      offer_type: 'trade_in',
      discount_type: 'fixed',
      discount_value: 500000,
      target_cars: [
        {
          id: 'c2',
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          price: 5800000,
          discounted_price: 5300000,
          trade_in_value: 2800000,
          additional_payment: 2500000
        }
      ],
      valid_from: '2024-01-15T00:00:00Z',
      valid_until: '2024-02-15T23:59:59Z',
      status: 'active',
      created_at: '2024-01-15T11:00:00Z',
      sent_at: '2024-01-15T16:00:00Z',
      opened_at: '2024-01-16T08:30:00Z',
      response_status: 'considering',
      notes: 'Клиент запросил дополнительную информацию об оценке Trade-In',
      personalization_factors: [
        'Владеет Mercedes C-Class 2020',
        'Бизнес сегмент',
        'Интерес к Trade-In',
        'Семейный автомобиль'
      ],
      interaction_history: [
        {
          id: 'i4',
          type: 'email_sent',
          description: 'Trade-In предложение отправлено',
          date: '2024-01-15T16:00:00Z'
        },
        {
          id: 'i5',
          type: 'email_opened',
          description: 'Письмо просмотрено',
          date: '2024-01-16T08:30:00Z'
        },
        {
          id: 'i6',
          type: 'telegram_message',
          description: 'Запрос через Telegram об оценке авто',
          date: '2024-01-16T14:45:00Z'
        }
      ]
    },
    {
      id: '3',
      title: 'Лизинговое предложение Audi Q7',
      description: 'Выгодные условия лизинга: 0% первоначальный взнос, ставка 8.5%',
      client_id: '3',
      client_name: 'Дмитрий Новиков',
      client_email: 'dmitry.novikov@business.com',
      client_phone: '+7-495-555-0123',
      client_segment: 'Business',
      offer_type: 'financing',
      discount_type: 'financing',
      discount_value: 0,
      financing_terms: {
        down_payment: 0,
        interest_rate: 8.5,
        term_months: 36,
        monthly_payment: 178500
      },
      target_cars: [
        {
          id: 'c3',
          brand: 'Audi',
          model: 'Q7',
          year: 2024,
          price: 6400000
        }
      ],
      valid_from: '2024-01-12T00:00:00Z',
      valid_until: '2024-02-29T23:59:59Z',
      status: 'active',
      created_at: '2024-01-12T13:00:00Z',
      sent_at: '2024-01-12T17:30:00Z',
      opened_at: null,
      response_status: 'no_response',
      notes: 'Письмо не открыто, возможно попало в спам',
      personalization_factors: [
        'Корпоративный клиент',
        'Интерес к лизингу',
        'Предпочтение Audi',
        'Большой автопарк'
      ],
      interaction_history: [
        {
          id: 'i7',
          type: 'email_sent',
          description: 'Лизинговое предложение отправлено',
          date: '2024-01-12T17:30:00Z'
        }
      ]
    },
    {
      id: '4',
      title: 'Эксклюзивный показ Lexus RX',
      description: 'Приглашение на закрытый показ новой модели с тест-драйвом',
      client_id: '4',
      client_name: 'Елена Соколова',
      client_email: 'elena.sokolova@example.com',
      client_phone: '+7-903-444-5566',
      client_segment: 'Premium',
      offer_type: 'event',
      discount_type: null,
      discount_value: 0,
      event_details: {
        event_type: 'exclusive_preview',
        date: '2024-01-25T18:00:00Z',
        location: 'Салон VELES DRIVE, Москва',
        includes: ['Тест-драйв', 'Ужин', 'Консультация эксперта']
      },
      target_cars: [
        {
          id: 'c4',
          brand: 'Lexus',
          model: 'RX',
          year: 2024,
          price: 4950000
        }
      ],
      valid_from: '2024-01-10T00:00:00Z',
      valid_until: '2024-01-24T23:59:59Z',
      status: 'active',
      created_at: '2024-01-10T15:00:00Z',
      sent_at: '2024-01-10T18:00:00Z',
      opened_at: '2024-01-11T10:20:00Z',
      response_status: 'confirmed',
      notes: 'Клиент подтвердил участие, забронировано место на 25.01',
      personalization_factors: [
        'Premium сегмент',
        'Интерес к японским авто',
        'VIP обслуживание',
        'Женский автомобиль'
      ],
      interaction_history: [
        {
          id: 'i8',
          type: 'email_sent',
          description: 'Приглашение на мероприятие отправлено',
          date: '2024-01-10T18:00:00Z'
        },
        {
          id: 'i9',
          type: 'email_opened',
          description: 'Приглашение просмотрено',
          date: '2024-01-11T10:20:00Z'
        },
        {
          id: 'i10',
          type: 'phone_call',
          description: 'Звонок клиента, подтверждение участия',
          date: '2024-01-11T16:45:00Z'
        }
      ]
    }
  ];

  // Mock clients data for targeting
  const mockClients = [
    {
      id: '1',
      full_name: 'Алексей Петров',
      email: 'alexey.petrov@example.com',
      phone: '+7-905-123-4567',
      segment: 'VIP',
      total_spent: 15800000,
      preferred_brands: ['BMW', 'Mercedes-Benz'],
      last_purchase: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      full_name: 'Мария Козлова',
      email: 'maria.kozlova@example.com',
      phone: '+7-916-987-6543',
      segment: 'Business',
      total_spent: 8200000,
      preferred_brands: ['Mercedes-Benz', 'Audi'],
      last_purchase: '2023-11-20T00:00:00Z'
    }
  ];

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    client_id: '',
    offer_type: 'discount',
    discount_type: 'percentage',
    discount_value: '',
    valid_from: '',
    valid_until: '',
    target_cars: [],
    notes: '',
    personalization_factors: []
  });

  useEffect(() => {
    loadOffers();
    loadClients();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setOffers(mockOffers);
    } catch (error) {
      console.error('Error loading offers:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить предложения",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const createOffer = async () => {
    try {
      if (!newOffer.title || !newOffer.client_id || !newOffer.description) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля",
          variant: "destructive"
        });
        return;
      }

      const selectedClient = clients.find(c => c.id === newOffer.client_id);
      const offerData = {
        ...newOffer,
        id: Date.now().toString(),
        client_name: selectedClient?.full_name || '',
        client_email: selectedClient?.email || '',
        client_phone: selectedClient?.phone || '',
        client_segment: selectedClient?.segment || 'Standard',
        status: 'draft',
        created_at: new Date().toISOString(),
        sent_at: null,
        opened_at: null,
        response_status: 'no_response',
        interaction_history: []
      };

      setOffers(prev => [offerData, ...prev]);
      setNewOffer({
        title: '',
        description: '',
        client_id: '',
        offer_type: 'discount',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_until: '',
        target_cars: [],
        notes: '',
        personalization_factors: []
      });
      setShowAddDialog(false);

      toast({
        title: "Успешно",
        description: "Персональное предложение создано"
      });

    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать предложение",
        variant: "destructive"
      });
    }
  };

  const sendOffer = async (offerId) => {
    try {
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { 
              ...offer, 
              status: 'sent',
              sent_at: new Date().toISOString(),
              interaction_history: [
                {
                  id: Date.now().toString(),
                  type: 'email_sent',
                  description: 'Предложение отправлено клиенту',
                  date: new Date().toISOString()
                },
                ...offer.interaction_history
              ]
            }
          : offer
      ));

      toast({
        title: "Успешно",
        description: "Предложение отправлено клиенту"
      });

    } catch (error) {
      console.error('Error sending offer:', error);
      toast({
        title: "Ошибка", 
        description: "Не удалось отправить предложение",
        variant: "destructive"
      });
    }
  };

  const updateResponseStatus = async (offerId, newStatus) => {
    try {
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, response_status: newStatus }
          : offer
      ));

      toast({
        title: "Успешно",
        description: "Статус ответа обновлен"
      });

    } catch (error) {
      console.error('Error updating response status:', error);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-600 text-white';
      case 'sent': return 'bg-blue-600 text-white';
      case 'active': return 'bg-green-600 text-white';
      case 'expired': return 'bg-red-600 text-white';
      case 'completed': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'sent': return 'Отправлено';
      case 'active': return 'Активно';
      case 'expired': return 'Истекло';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  const getResponseStatusColor = (status) => {
    switch (status) {
      case 'no_response': return 'bg-gray-100 text-gray-800';
      case 'opened': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'considering': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseStatusText = (status) => {
    switch (status) {
      case 'no_response': return 'Нет ответа';
      case 'opened': return 'Просмотрено';
      case 'interested': return 'Заинтересован';
      case 'considering': return 'Рассматривает';
      case 'declined': return 'Отклонил';
      case 'confirmed': return 'Подтвердил';
      default: return status;
    }
  };

  const getOfferTypeText = (type) => {
    switch (type) {
      case 'discount': return 'Скидка';
      case 'trade_in': return 'Trade-In';
      case 'financing': return 'Финансирование';
      case 'event': return 'Мероприятие';
      default: return type;
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
    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.status === 'active').length;
    const sentOffers = offers.filter(o => o.sent_at).length;
    const interestedClients = offers.filter(o => o.response_status === 'interested' || o.response_status === 'confirmed').length;
    const conversionRate = sentOffers > 0 ? (interestedClients / sentOffers * 100) : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего предложений</p>
                <p className="text-2xl font-bold text-white">{totalOffers}</p>
              </div>
              <Gift className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Активные</p>
                <p className="text-2xl font-bold text-white">{activeOffers}</p>
              </div>
              <Target className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Отправлено</p>
                <p className="text-2xl font-bold text-white">{sentOffers}</p>
              </div>
              <Send className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Заинтересованы</p>
                <p className="text-2xl font-bold text-white">{interestedClients}</p>
              </div>
              <Users className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Конверсия</p>
                <p className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="text-yellow-400" size={24} />
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
        <p className="text-gray-400 mt-2">Загрузка персональных предложений...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Персональные предложения</h2>
            <p className="text-gray-400">Индивидуальные предложения для клиентов</p>
          </div>
        </div>

        <div className="flex space-x-1 mb-6">
          {[
            { id: 'offers', label: 'Предложения', icon: Gift },
            { id: 'analytics', label: 'Аналитика', icon: TrendingUp }
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

      {activeTab === 'offers' && (
        <>
          {/* Overview Stats */}
          {renderOverview()}

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по названию, клиенту, описанию..."
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
                  <SelectItem value="draft">Черновики</SelectItem>
                  <SelectItem value="sent">Отправленные</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="expired">Истекшие</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-600 text-black hover:bg-yellow-700">
                  <Plus size={16} className="mr-2" />
                  Создать предложение
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Новое персональное предложение</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label className="text-gray-300">Название предложения *</Label>
                    <Input
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Специальное предложение BMW X5"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Клиент *</Label>
                    <Select value={newOffer.client_id} onValueChange={(value) => setNewOffer({...newOffer, client_id: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Выберите клиента" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name} ({client.segment})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Тип предложения</Label>
                    <Select value={newOffer.offer_type} onValueChange={(value) => setNewOffer({...newOffer, offer_type: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Скидка</SelectItem>
                        <SelectItem value="trade_in">Trade-In</SelectItem>
                        <SelectItem value="financing">Финансирование</SelectItem>
                        <SelectItem value="event">Мероприятие</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newOffer.offer_type === 'discount' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Тип скидки</Label>
                        <Select value={newOffer.discount_type} onValueChange={(value) => setNewOffer({...newOffer, discount_type: value})}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Процент</SelectItem>
                            <SelectItem value="fixed">Фиксированная сумма</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Значение скидки</Label>
                        <Input
                          type="number"
                          value={newOffer.discount_value}
                          onChange={(e) => setNewOffer({...newOffer, discount_value: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder={newOffer.discount_type === 'percentage' ? '15' : '500000'}
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-gray-300">Описание *</Label>
                    <Textarea
                      value={newOffer.description}
                      onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Подробное описание предложения..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Действует с</Label>
                      <Input
                        type="datetime-local"
                        value={newOffer.valid_from}
                        onChange={(e) => setNewOffer({...newOffer, valid_from: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Действует до</Label>
                      <Input
                        type="datetime-local"
                        value={newOffer.valid_until}
                        onChange={(e) => setNewOffer({...newOffer, valid_until: e.target.value})}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Дополнительные заметки</Label>
                    <Textarea
                      value={newOffer.notes}
                      onChange={(e) => setNewOffer({...newOffer, notes: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Внутренние заметки о предложении..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={createOffer} className="flex-1 bg-green-600 text-white hover:bg-green-700">
                    Создать предложение
                  </Button>
                  <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-gray-600 text-gray-300">
                    Отмена
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Offers List */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Предложение</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Клиент</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Тип</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Статус</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Ответ</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Срок действия</th>
                      <th className="text-right p-4 text-gray-300 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{offer.title}</p>
                            <p className="text-gray-400 text-sm line-clamp-2">{offer.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{offer.client_name}</p>
                            <Badge className="bg-purple-600 text-white text-xs">{offer.client_segment}</Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-blue-600 text-white">
                            {getOfferTypeText(offer.offer_type)}
                          </Badge>
                          {offer.offer_type === 'discount' && offer.discount_value && (
                            <p className="text-yellow-400 text-sm mt-1">
                              {offer.discount_type === 'percentage' ? `${offer.discount_value}%` : formatPrice(offer.discount_value)}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(offer.status)}>
                            {getStatusText(offer.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getResponseStatusColor(offer.response_status)}>
                            {getResponseStatusText(offer.response_status)}
                          </Badge>
                          {offer.opened_at && (
                            <p className="text-gray-400 text-xs mt-1">
                              Открыто: {formatDate(offer.opened_at)}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-sm">
                            {offer.valid_from && (
                              <p>С: {formatDate(offer.valid_from)}</p>
                            )}
                            {offer.valid_until && (
                              <p>До: {formatDate(offer.valid_until)}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedOffer(offer);
                                setShowOfferDetails(true);
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye size={16} />
                            </Button>
                            {offer.status === 'draft' && (
                              <Button
                                onClick={() => sendOffer(offer.id)}
                                size="sm"
                                variant="ghost"
                                className="text-green-400 hover:text-green-300"
                              >
                                <Send size={16} />
                              </Button>
                            )}
                            <Button
                              onClick={() => window.location.href = `tel:${offer.client_phone}`}
                              size="sm"
                              variant="ghost"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <MessageCircle size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOffers.length === 0 && (
                <div className="text-center py-12">
                  <Gift className="text-gray-600 mx-auto mb-4" size={48} />
                  <h3 className="text-white font-medium mb-2">Предложения не найдены</h3>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Попробуйте изменить критерии поиска' 
                      : 'Создайте первое персональное предложение'
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
                <CardTitle className="text-white">Эффективность по типам предложений</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'discount', sent: 8, interested: 5, conversion: 62.5 },
                    { type: 'trade_in', sent: 6, interested: 3, conversion: 50.0 },
                    { type: 'financing', sent: 4, interested: 1, conversion: 25.0 },
                    { type: 'event', sent: 3, interested: 2, conversion: 66.7 }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{getOfferTypeText(item.type)}</p>
                        <p className="text-gray-400 text-sm">{item.sent} отправлено • {item.interested} заинтересованы</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">{item.conversion.toFixed(1)}%</p>
                        <p className="text-gray-400 text-sm">Конверсия</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Сегменты клиентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { segment: 'VIP', offers: 5, conversion: 80.0 },
                    { segment: 'Premium', offers: 7, conversion: 57.1 },
                    { segment: 'Business', offers: 6, conversion: 50.0 },
                    { segment: 'Standard', offers: 3, conversion: 33.3 }
                  ].map((item) => (
                    <div key={item.segment} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.segment}</p>
                        <p className="text-gray-400 text-sm">{item.offers} предложений</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold">{item.conversion.toFixed(1)}%</p>
                        <p className="text-gray-400 text-sm">Конверсия</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Offer Details Dialog */}
      <Dialog open={showOfferDetails} onOpenChange={setShowOfferDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="text-yellow-400" size={20} />
              {selectedOffer?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Offer and Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Информация о предложении</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Тип:</span>
                      <Badge className="bg-blue-600 text-white">{getOfferTypeText(selectedOffer.offer_type)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Статус:</span>
                      <Badge className={getStatusColor(selectedOffer.status)}>{getStatusText(selectedOffer.status)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Создано:</span>
                      <span className="text-white">{formatDate(selectedOffer.created_at)}</span>
                    </div>
                    {selectedOffer.sent_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Отправлено:</span>
                        <span className="text-white">{formatDate(selectedOffer.sent_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Клиент</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Имя:</span>
                      <span className="text-white">{selectedOffer.client_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Сегмент:</span>
                      <Badge className="bg-purple-600 text-white">{selectedOffer.client_segment}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedOffer.client_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Телефон:</span>
                      <span className="text-white">{selectedOffer.client_phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div>
                <h4 className="text-white font-medium mb-3">Описание предложения</h4>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-300 mb-4">{selectedOffer.description}</p>
                  
                  {selectedOffer.offer_type === 'discount' && selectedOffer.discount_value && (
                    <div className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg mb-4">
                      <p className="text-yellow-400 font-medium">
                        Скидка: {selectedOffer.discount_type === 'percentage' ? `${selectedOffer.discount_value}%` : formatPrice(selectedOffer.discount_value)}
                      </p>
                    </div>
                  )}

                  {selectedOffer.target_cars && selectedOffer.target_cars.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Автомобили:</p>
                      {selectedOffer.target_cars.map((car, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                          <span className="text-white">{car.brand} {car.model} {car.year}</span>
                          <div className="text-right">
                            {car.discounted_price && (
                              <p className="text-green-400 font-bold">{formatPrice(car.discounted_price)}</p>
                            )}
                            {car.price && car.discounted_price && (
                              <p className="text-gray-400 line-through text-sm">{formatPrice(car.price)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Personalization Factors */}
              {selectedOffer.personalization_factors && selectedOffer.personalization_factors.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Факторы персонализации</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.personalization_factors.map((factor, index) => (
                      <Badge key={index} className="bg-blue-600 text-white">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Status */}
              <div>
                <h4 className="text-white font-medium mb-3">Статус ответа</h4>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <Badge className={getResponseStatusColor(selectedOffer.response_status)}>
                      {getResponseStatusText(selectedOffer.response_status)}
                    </Badge>
                    {selectedOffer.opened_at && (
                      <span className="text-gray-400 text-sm">
                        Открыто: {formatDate(selectedOffer.opened_at)}
                      </span>
                    )}
                  </div>
                  {selectedOffer.notes && (
                    <p className="text-gray-300 text-sm">{selectedOffer.notes}</p>
                  )}
                </div>
              </div>

              {/* Interaction History */}
              {selectedOffer.interaction_history && selectedOffer.interaction_history.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">История взаимодействий</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOffer.interaction_history.map((interaction) => (
                      <div key={interaction.id} className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle size={14} className="text-blue-400" />
                          <span className="text-white text-sm font-medium capitalize">
                            {interaction.type.replace('_', ' ')}
                          </span>
                          <span className="text-gray-400 text-xs">{formatDate(interaction.date)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{interaction.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {selectedOffer.status === 'draft' && (
                  <Button 
                    onClick={() => sendOffer(selectedOffer.id)}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Send size={16} className="mr-2" />
                    Отправить предложение
                  </Button>
                )}
                <Select value={selectedOffer.response_status} onValueChange={(value) => updateResponseStatus(selectedOffer.id, value)}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_response">Нет ответа</SelectItem>
                    <SelectItem value="opened">Просмотрено</SelectItem>
                    <SelectItem value="interested">Заинтересован</SelectItem>
                    <SelectItem value="considering">Рассматривает</SelectItem>
                    <SelectItem value="declined">Отклонил</SelectItem>
                    <SelectItem value="confirmed">Подтвердил</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => window.location.href = `tel:${selectedOffer.client_phone}`}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Связаться
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalizedOffers;