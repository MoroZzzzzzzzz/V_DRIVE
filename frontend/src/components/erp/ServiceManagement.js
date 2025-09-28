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
  Wrench, 
  Calendar, 
  Clock, 
  User, 
  Car, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Star,
  Settings,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const { toast } = useToast();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Mock services data
  const mockServices = [
    {
      id: '1',
      service_number: 'SRV-2024-001',
      client_name: 'Алексей Петров',
      client_phone: '+7-905-123-4567',
      client_email: 'alexey.petrov@example.com',
      car: {
        brand: 'BMW',
        model: 'X5',
        year: 2023,
        license_plate: 'А123БВ77',
        vin: 'WBAFR9C50DD000001'
      },
      service_type: 'maintenance',
      description: 'Плановое ТО - 15,000 км',
      scheduled_date: '2024-01-20T10:00:00Z',
      estimated_completion: '2024-01-20T16:00:00Z',
      actual_completion: null,
      status: 'scheduled',
      technician: 'Иван Сидоров',
      cost_estimate: 25000,
      actual_cost: null,
      parts_required: [
        { name: 'Масло моторное', quantity: 5, cost: 3500 },
        { name: 'Фильтр масляный', quantity: 1, cost: 800 },
        { name: 'Фильтр воздушный', quantity: 1, cost: 1200 }
      ],
      work_description: 'Замена масла, фильтров, диагностика',
      notes: 'Клиент просил проверить тормозную систему',
      created_at: '2024-01-18T09:00:00Z',
      updated_at: '2024-01-18T09:00:00Z'
    },
    {
      id: '2',
      service_number: 'SRV-2024-002',
      client_name: 'Мария Козлова',
      client_phone: '+7-916-987-6543',
      client_email: 'maria.kozlova@example.com',
      car: {
        brand: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2022,
        license_plate: 'В456ГД77',
        vin: 'WDD213001CA000002'
      },
      service_type: 'repair',
      description: 'Ремонт двигателя - посторонние шумы',
      scheduled_date: '2024-01-19T14:00:00Z',
      estimated_completion: '2024-01-22T12:00:00Z',
      actual_completion: '2024-01-22T11:30:00Z',
      status: 'completed',
      technician: 'Петр Васильев',
      cost_estimate: 85000,
      actual_cost: 78500,
      parts_required: [
        { name: 'Прокладка ГБЦ', quantity: 1, cost: 15000 },
        { name: 'Ремень ГРМ', quantity: 1, cost: 4500 },
        { name: 'Помпа', quantity: 1, cost: 18000 }
      ],
      work_description: 'Замена прокладки ГБЦ, ремня ГРМ, помпы',
      notes: 'Ремонт завершен досрочно, клиент доволен',
      created_at: '2024-01-17T15:30:00Z',
      updated_at: '2024-01-22T11:30:00Z'
    },
    {
      id: '3',
      service_number: 'SRV-2024-003',
      client_name: 'Дмитрий Новиков',
      client_phone: '+7-495-555-0123',
      client_email: 'dmitry.novikov@business.com',
      car: {
        brand: 'Audi',
        model: 'A6',
        year: 2024,
        license_plate: 'С789ЕЖ77',
        vin: 'WAUZZZ4G5DN000003'
      },
      service_type: 'warranty',
      description: 'Гарантийный ремонт - неисправность электроники',
      scheduled_date: '2024-01-18T09:00:00Z',
      estimated_completion: '2024-01-19T17:00:00Z',
      actual_completion: null,
      status: 'in_progress',
      technician: 'Андрей Морозов',
      cost_estimate: 0,
      actual_cost: null,
      parts_required: [
        { name: 'Блок управления', quantity: 1, cost: 0 },
        { name: 'Датчик ABS', quantity: 1, cost: 0 }
      ],
      work_description: 'Замена блока управления и датчика ABS по гарантии',
      notes: 'Детали заказаны, ожидается поставка',
      created_at: '2024-01-16T11:00:00Z',
      updated_at: '2024-01-18T16:00:00Z'
    },
    {
      id: '4',
      service_number: 'SRV-2024-004',
      client_name: 'Елена Соколова',
      client_phone: '+7-903-444-5566',
      client_email: 'elena.sokolova@example.com',
      car: {
        brand: 'Lexus',
        model: 'RX',
        year: 2023,
        license_plate: 'З012ИК77',
        vin: 'JTJBK1BA6D2000004'
      },
      service_type: 'diagnostics',
      description: 'Компьютерная диагностика - Check Engine',
      scheduled_date: '2024-01-21T13:00:00Z',
      estimated_completion: '2024-01-21T15:00:00Z',
      actual_completion: null,
      status: 'scheduled',
      technician: 'Сергей Лебедев',
      cost_estimate: 5000,
      actual_cost: null,
      parts_required: [],
      work_description: 'Полная компьютерная диагностика всех систем',
      notes: 'Загорелся Check Engine, других симптомов нет',
      created_at: '2024-01-19T10:30:00Z',
      updated_at: '2024-01-19T10:30:00Z'
    }
  ];

  const [newService, setNewService] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    car_brand: '',
    car_model: '',
    car_year: '',
    license_plate: '',
    vin: '',
    service_type: 'maintenance',
    description: '',
    scheduled_date: '',
    estimated_completion: '',
    technician: '',
    cost_estimate: '',
    work_description: '',
    notes: ''
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setServices(mockServices);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заявки на сервис",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    try {
      if (!newService.client_name || !newService.client_phone || !newService.description) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля",
          variant: "destructive"
        });
        return;
      }

      const serviceData = {
        ...newService,
        id: Date.now().toString(),
        service_number: `SRV-${new Date().getFullYear()}-${String(services.length + 1).padStart(3, '0')}`,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        car: {
          brand: newService.car_brand,
          model: newService.car_model,
          year: parseInt(newService.car_year),
          license_plate: newService.license_plate,
          vin: newService.vin
        },
        parts_required: [],
        actual_cost: null,
        actual_completion: null
      };

      setServices(prev => [serviceData, ...prev]);
      setNewService({
        client_name: '',
        client_phone: '',
        client_email: '',
        car_brand: '',
        car_model: '',
        car_year: '',
        license_plate: '',
        vin: '',
        service_type: 'maintenance',
        description: '',
        scheduled_date: '',
        estimated_completion: '',
        technician: '',
        cost_estimate: '',
        work_description: '',
        notes: ''
      });
      setShowAddDialog(false);

      toast({
        title: "Успешно",
        description: "Заявка на сервис создана"
      });

    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заявку",
        variant: "destructive"
      });
    }
  };

  const updateServiceStatus = async (serviceId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updateData.actual_completion = new Date().toISOString();
      }

      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, ...updateData }
          : service
      ));

      toast({
        title: "Успешно",
        description: "Статус заявки обновлен"
      });

    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "Ошибка", 
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-600 text-white';
      case 'in_progress': return 'bg-yellow-600 text-black';
      case 'completed': return 'bg-green-600 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Запланировано';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const getServiceTypeText = (type) => {
    switch (type) {
      case 'maintenance': return 'Обслуживание';
      case 'repair': return 'Ремонт';
      case 'warranty': return 'Гарантия';
      case 'diagnostics': return 'Диагностика';
      default: return type;
    }
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'repair': return 'bg-red-100 text-red-800';
      case 'warranty': return 'bg-green-100 text-green-800';
      case 'diagnostics': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
    const totalServices = services.length;
    const scheduledServices = services.filter(s => s.status === 'scheduled').length;
    const inProgressServices = services.filter(s => s.status === 'in_progress').length;
    const completedServices = services.filter(s => s.status === 'completed').length;
    const totalRevenue = services.filter(s => s.actual_cost).reduce((sum, s) => sum + s.actual_cost, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего заявок</p>
                <p className="text-2xl font-bold text-white">{totalServices}</p>
              </div>
              <Wrench className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Запланировано</p>
                <p className="text-2xl font-bold text-white">{scheduledServices}</p>
              </div>
              <Calendar className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">В работе</p>
                <p className="text-2xl font-bold text-white">{inProgressServices}</p>
              </div>
              <Clock className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Завершено</p>
                <p className="text-2xl font-bold text-white">{completedServices}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Доход</p>
                <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
              <DollarSign className="text-green-400" size={24} />
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
        <p className="text-gray-400 mt-2">Загрузка сервисных заявок...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Управление сервисом</h2>
            <p className="text-gray-400">Сервисное обслуживание и ремонт автомобилей</p>
          </div>
        </div>

        <div className="flex space-x-1 mb-6">
          {[
            { id: 'services', label: 'Заявки на сервис', icon: Wrench },
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

      {activeTab === 'services' && (
        <>
          {/* Overview Stats */}
          {renderOverview()}

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по клиенту, номеру заявки, автомобилю..."
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
                  <SelectItem value="scheduled">Запланировано</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="cancelled">Отменено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-600 text-black hover:bg-yellow-700">
                  <Plus size={16} className="mr-2" />
                  Новая заявка
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Новая заявка на сервис</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <div>
                    <Label className="text-gray-300">Имя клиента *</Label>
                    <Input
                      value={newService.client_name}
                      onChange={(e) => setNewService({...newService, client_name: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Иван Петров"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Телефон *</Label>
                    <Input
                      value={newService.client_phone}
                      onChange={(e) => setNewService({...newService, client_phone: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="+7-900-123-4567"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={newService.client_email}
                      onChange={(e) => setNewService({...newService, client_email: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="ivan@example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Марка авто</Label>
                    <Input
                      value={newService.car_brand}
                      onChange={(e) => setNewService({...newService, car_brand: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="BMW"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Модель</Label>
                    <Input
                      value={newService.car_model}
                      onChange={(e) => setNewService({...newService, car_model: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="X5"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Год</Label>
                    <Input
                      type="number"
                      value={newService.car_year}
                      onChange={(e) => setNewService({...newService, car_year: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="2023"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Гос. номер</Label>
                    <Input
                      value={newService.license_plate}
                      onChange={(e) => setNewService({...newService, license_plate: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="А123БВ77"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">VIN</Label>
                    <Input
                      value={newService.vin}
                      onChange={(e) => setNewService({...newService, vin: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="WBAFR9C50DD000001"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Тип услуги</Label>
                    <Select value={newService.service_type} onValueChange={(value) => setNewService({...newService, service_type: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Обслуживание</SelectItem>
                        <SelectItem value="repair">Ремонт</SelectItem>
                        <SelectItem value="warranty">Гарантия</SelectItem>
                        <SelectItem value="diagnostics">Диагностика</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Мастер</Label>
                    <Input
                      value={newService.technician}
                      onChange={(e) => setNewService({...newService, technician: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Иван Сидоров"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-gray-300">Описание работ *</Label>
                    <Textarea
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Описание необходимых работ..."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Дата/время записи</Label>
                    <Input
                      type="datetime-local"
                      value={newService.scheduled_date}
                      onChange={(e) => setNewService({...newService, scheduled_date: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Примерная стоимость</Label>
                    <Input
                      type="number"
                      value={newService.cost_estimate}
                      onChange={(e) => setNewService({...newService, cost_estimate: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="25000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-gray-300">Примечания</Label>
                    <Textarea
                      value={newService.notes}
                      onChange={(e) => setNewService({...newService, notes: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Дополнительные примечания..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={addService} className="flex-1 bg-green-600 text-white hover:bg-green-700">
                    Создать заявку
                  </Button>
                  <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-gray-600 text-gray-300">
                    Отмена
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Services List */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-gray-300 font-medium">Заявка</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Клиент</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Автомобиль</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Услуга</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Статус</th>
                      <th className="text-left p-4 text-gray-300 font-medium">Дата</th>
                      <th className="text-right p-4 text-gray-300 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{service.service_number}</p>
                            <p className="text-gray-400 text-sm">
                              {service.technician && `Мастер: ${service.technician}`}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{service.client_name}</p>
                            <div className="flex items-center text-gray-300 text-sm mt-1">
                              <Phone size={12} className="mr-1" />
                              {service.client_phone}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">
                              {service.car.brand} {service.car.model}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {service.car.year} • {service.car.license_plate}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <Badge className={getServiceTypeColor(service.service_type)}>
                              {getServiceTypeText(service.service_type)}
                            </Badge>
                            <p className="text-gray-300 text-sm mt-1">{service.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusText(service.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-sm">
                            <p>📅 {formatDate(service.scheduled_date)}</p>
                            {service.cost_estimate && (
                              <p className="text-yellow-400">💰 {formatPrice(service.cost_estimate)}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedService(service);
                                setShowServiceDetails(true);
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white"
                            >
                              <Settings size={16} />
                            </Button>
                            {service.status === 'scheduled' && (
                              <Button
                                onClick={() => updateServiceStatus(service.id, 'in_progress')}
                                size="sm"
                                variant="ghost"
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                <Clock size={16} />
                              </Button>
                            )}
                            {service.status === 'in_progress' && (
                              <Button
                                onClick={() => updateServiceStatus(service.id, 'completed')}
                                size="sm"
                                variant="ghost"
                                className="text-green-400 hover:text-green-300"
                              >
                                <CheckCircle size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <Wrench className="text-gray-600 mx-auto mb-4" size={48} />
                  <h3 className="text-white font-medium mb-2">Заявки не найдены</h3>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Попробуйте изменить критерии поиска' 
                      : 'Создайте первую заявку на сервис'
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
                <CardTitle className="text-white">Популярные услуги</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { service: 'Плановое ТО', count: 12, percentage: 35 },
                    { service: 'Ремонт двигателя', count: 8, percentage: 24 },
                    { service: 'Диагностика', count: 7, percentage: 21 },
                    { service: 'Гарантийный ремонт', count: 7, percentage: 20 }
                  ].map((item) => (
                    <div key={item.service} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <span className="text-white">{item.service}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{item.count}</span>
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${item.percentage}%`}}></div>
                        </div>
                        <span className="text-yellow-400 text-sm w-10">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Эффективность мастеров</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Иван Сидоров', completed: 8, rating: 4.9 },
                    { name: 'Петр Васильев', completed: 6, rating: 4.7 },
                    { name: 'Андрей Морозов', completed: 5, rating: 4.8 },
                    { name: 'Сергей Лебедев', completed: 4, rating: 4.6 }
                  ].map((tech) => (
                    <div key={tech.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{tech.name}</p>
                        <p className="text-gray-400 text-sm">{tech.completed} завершенных работ</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-400" size={16} />
                        <span className="text-white font-bold">{tech.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Service Details Dialog */}
      <Dialog open={showServiceDetails} onOpenChange={setShowServiceDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Заявка {selectedService?.service_number}
            </DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Service and Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Информация о клиенте</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Имя:</span>
                      <span className="text-white">{selectedService.client_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Телефон:</span>
                      <span className="text-white">{selectedService.client_phone}</span>
                    </div>
                    {selectedService.client_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedService.client_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Информация об автомобиле</h4>
                  <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Автомобиль:</span>
                      <span className="text-white">{selectedService.car.brand} {selectedService.car.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Год:</span>
                      <span className="text-white">{selectedService.car.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Гос. номер:</span>
                      <span className="text-white">{selectedService.car.license_plate}</span>
                    </div>
                    {selectedService.car.vin && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">VIN:</span>
                        <span className="text-white">{selectedService.car.vin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="text-white font-medium mb-3">Детали заявки</h4>
                <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-4">
                    <Badge className={getServiceTypeColor(selectedService.service_type)}>
                      {getServiceTypeText(selectedService.service_type)}
                    </Badge>
                    <Badge className={getStatusColor(selectedService.status)}>
                      {getStatusText(selectedService.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Описание работ:</p>
                    <p className="text-white">{selectedService.description}</p>
                  </div>
                  {selectedService.work_description && (
                    <div>
                      <p className="text-gray-400 text-sm">Детали работы:</p>
                      <p className="text-white">{selectedService.work_description}</p>
                    </div>
                  )}
                  {selectedService.technician && (
                    <div>
                      <p className="text-gray-400 text-sm">Мастер:</p>
                      <p className="text-white">{selectedService.technician}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parts and Cost */}
              {selectedService.parts_required.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Запчасти</h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="space-y-2">
                      {selectedService.parts_required.map((part, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-white">{part.name} x{part.quantity}</span>
                          <span className="text-yellow-400">{formatPrice(part.cost)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule and Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-white font-medium mb-2">Расписание</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Запланировано:</span>
                      <span className="text-white">{formatDate(selectedService.scheduled_date)}</span>
                    </div>
                    {selectedService.estimated_completion && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Планируемое завершение:</span>
                        <span className="text-white">{formatDate(selectedService.estimated_completion)}</span>
                      </div>
                    )}
                    {selectedService.actual_completion && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Фактически завершено:</span>
                        <span className="text-green-400">{formatDate(selectedService.actual_completion)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h5 className="text-white font-medium mb-2">Стоимость</h5>
                  <div className="space-y-2 text-sm">
                    {selectedService.cost_estimate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Оценка:</span>
                        <span className="text-white">{formatPrice(selectedService.cost_estimate)}</span>
                      </div>
                    )}
                    {selectedService.actual_cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Фактически:</span>
                        <span className="text-green-400">{formatPrice(selectedService.actual_cost)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedService.notes && (
                <div>
                  <h4 className="text-white font-medium mb-2">Примечания</h4>
                  <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded-lg">
                    {selectedService.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {selectedService.status === 'scheduled' && (
                  <Button 
                    onClick={() => updateServiceStatus(selectedService.id, 'in_progress')}
                    className="bg-yellow-600 text-black hover:bg-yellow-700"
                  >
                    <Clock size={16} className="mr-2" />
                    Начать работу
                  </Button>
                )}
                {selectedService.status === 'in_progress' && (
                  <Button 
                    onClick={() => updateServiceStatus(selectedService.id, 'completed')}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Завершить
                  </Button>
                )}
                <Button 
                  onClick={() => window.location.href = `tel:${selectedService.client_phone}`}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Phone size={16} className="mr-2" />
                  Позвонить
                </Button>
                {selectedService.client_email && (
                  <Button 
                    onClick={() => window.location.href = `mailto:${selectedService.client_email}`}
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManagement;