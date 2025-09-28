import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  Car,
  TrendingUp,
  Star,
  MessageCircle,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const ClientsManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const { toast } = useToast();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Mock clients data
  const mockClients = [
    {
      id: '1',
      full_name: 'Алексей Петров',
      email: 'alexey.petrov@example.com',  
      phone: '+7-905-123-4567',
      status: 'active',
      created_at: '2024-01-10T09:00:00Z',
      last_contact: '2024-01-15T14:30:00Z',
      total_purchases: 2,
      total_spent: 15800000,
      preferred_brands: ['BMW', 'Mercedes-Benz'],
      notes: 'VIP клиент, предпочитает премиум автомобили',
      lead_source: 'website',
      rating: 5,
      purchase_history: [
        {
          id: 'p1',
          car: 'BMW X5 2023',
          amount: 6200000,
          date: '2024-01-15T00:00:00Z'
        },
        {
          id: 'p2', 
          car: 'Mercedes-Benz E-Class 2022',
          amount: 9600000,
          date: '2023-12-01T00:00:00Z'
        }
      ],
      interactions: [
        {
          id: 'i1',
          type: 'call',
          description: 'Консультация по BMW X7',
          date: '2024-01-15T14:30:00Z',
          duration: '15 мин'
        },
        {
          id: 'i2',
          type: 'email',
          description: 'Отправлено предложение по Mercedes',
          date: '2024-01-14T10:00:00Z'
        }
      ]
    },
    {
      id: '2',
      full_name: 'Мария Сидорова',
      email: 'maria.sidorova@example.com',
      phone: '+7-916-987-6543',
      status: 'lead',
      created_at: '2024-01-14T11:15:00Z',
      last_contact: '2024-01-14T11:15:00Z',
      total_purchases: 0,
      total_spent: 0,
      preferred_brands: ['Audi', 'Lexus'],
      notes: 'Интересуется кроссоверами до 5 млн',
      lead_source: 'telegram',
      rating: 3,
      purchase_history: [],
      interactions: [
        {
          id: 'i3',
          type: 'telegram',
          description: 'Первичный контакт через бот',
          date: '2024-01-14T11:15:00Z'
        }
      ]
    },
    {
      id: '3',
      full_name: 'Дмитрий Козлов',
      email: 'dmitry.kozlov@business.com',
      phone: '+7-495-555-0123',
      status: 'inactive',
      created_at: '2023-11-20T16:45:00Z',
      last_contact: '2023-12-15T09:30:00Z',
      total_purchases: 1,
      total_spent: 3200000,
      preferred_brands: ['Toyota', 'Honda'],
      notes: 'Корпоративный клиент, закупки для автопарка',
      lead_source: 'referral',
      rating: 4,
      purchase_history: [
        {
          id: 'p3',
          car: 'Toyota Camry 2023',
          amount: 3200000,
          date: '2023-12-01T00:00:00Z'
        }
      ],
      interactions: [
        {
          id: 'i4',
          type: 'meeting',
          description: 'Встреча в офисе, обсуждение корпоративных скидок',
          date: '2023-12-15T09:30:00Z',
          duration: '45 мин'
        }
      ]
    }
  ];

  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferred_brands: [],
    notes: '',
    lead_source: 'website'
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setClients(mockClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить клиентов",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    try {
      if (!newClient.full_name || !newClient.email || !newClient.phone) {
        toast({
          title: "Ошибка",
          description: "Заполните обязательные поля",
          variant: "destructive"
        });
        return;
      }

      const clientData = {
        ...newClient,
        id: Date.now().toString(),
        status: 'lead',
        created_at: new Date().toISOString(),
        last_contact: new Date().toISOString(),
        total_purchases: 0,
        total_spent: 0,
        rating: 3,
        purchase_history: [],
        interactions: [{
          id: Date.now().toString(),
          type: 'manual',
          description: 'Клиент добавлен вручную',
          date: new Date().toISOString()
        }]
      };

      setClients(prev => [clientData, ...prev]);
      setNewClient({
        full_name: '',
        email: '',
        phone: '',
        preferred_brands: [],
        notes: '',
        lead_source: 'website'
      });
      setShowAddDialog(false);

      toast({
        title: "Успешно",
        description: "Клиент добавлен"
      });

    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить клиента",
        variant: "destructive"
      });
    }
  };

  const updateClientStatus = async (clientId, newStatus) => {
    try {
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus, last_contact: new Date().toISOString() }
          : client
      ));

      toast({
        title: "Успешно",
        description: "Статус клиента обновлен"
      });

    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: "Ошибка", 
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const addInteraction = async (clientId, interaction) => {
    try {
      const newInteraction = {
        id: Date.now().toString(),
        ...interaction,
        date: new Date().toISOString()
      };

      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { 
              ...client, 
              interactions: [newInteraction, ...client.interactions],
              last_contact: new Date().toISOString()
            }
          : client
      ));

      toast({
        title: "Успешно",
        description: "Взаимодействие добавлено"
      });

    } catch (error) {
      console.error('Error adding interaction:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить взаимодействие",
        variant: "destructive"
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'lead': return 'bg-blue-600 text-white';
      case 'inactive': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'lead': return 'Лид';
      case 'inactive': return 'Неактивный';
      default: return status;
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="text-gray-400 mt-2">Загрузка клиентов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего клиентов</p>
                <p className="text-2xl font-bold text-white">{clients.length}</p>
              </div>
              <Users className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Активные</p>
                <p className="text-2xl font-bold text-white">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Star className="text-green-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Лиды</p>
                <p className="text-2xl font-bold text-white">
                  {clients.filter(c => c.status === 'lead').length}
                </p>
              </div>
              <TrendingUp className="text-blue-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Общий доход</p>
                <p className="text-2xl font-bold text-white">
                  {formatPrice(clients.reduce((sum, c) => sum + c.total_spent, 0))}
                </p>
              </div>
              <Car className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск по имени, email или телефону..."
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
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="lead">Лиды</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 text-black hover:bg-yellow-700">
              <Plus size={16} className="mr-2" />
              Добавить клиента
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Новый клиент</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Полное имя *</Label>
                <Input
                  value={newClient.full_name}
                  onChange={(e) => setNewClient({...newClient, full_name: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Иван Петров"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="ivan@example.com"
                />
              </div>
              <div>
                <Label className="text-gray-300">Телефон *</Label>
                <Input
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="+7-900-123-4567"
                />
              </div>
              <div>
                <Label className="text-gray-300">Источник лида</Label>
                <Select value={newClient.lead_source} onValueChange={(value) => setNewClient({...newClient, lead_source: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Сайт</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="phone">Телефон</SelectItem>
                    <SelectItem value="referral">Рекомендация</SelectItem>
                    <SelectItem value="advertisement">Реклама</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Заметки</Label>
                <Input
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Дополнительная информация о клиенте"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={addClient} className="flex-1 bg-green-600 text-white hover:bg-green-700">
                  Добавить клиента
                </Button>
                <Button onClick={() => setShowAddDialog(false)} variant="outline" className="border-gray-600 text-gray-300">
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Клиент</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Контакты</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Статус</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Покупки</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Последний контакт</th>
                  <th className="text-right p-4 text-gray-300 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{client.full_name}</p>
                        <p className="text-gray-400 text-sm">
                          {'⭐'.repeat(client.rating)} ({client.rating}/5)
                        </p>
                        {client.preferred_brands.length > 0 && (
                          <p className="text-gray-500 text-xs">
                            Предпочитает: {client.preferred_brands.join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Mail size={14} className="mr-2" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Phone size={14} className="mr-2" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(client.status)}>
                        {getStatusText(client.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{client.total_purchases}</p>
                        <p className="text-gray-400 text-sm">{formatPrice(client.total_spent)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar size={14} className="mr-2" />
                        {formatDate(client.last_contact)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowClientDetails(true);
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          onClick={() => window.location.href = `tel:${client.phone}`}
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300"
                        >
                          <Phone size={16} />
                        </Button>
                        <Button
                          onClick={() => window.location.href = `mailto:${client.email}`}
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Mail size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="text-gray-600 mx-auto mb-4" size={48} />
              <h3 className="text-white font-medium mb-2">Клиенты не найдены</h3>
              <p className="text-gray-400 text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить критерии поиска' 
                  : 'Добавьте первого клиента для начала работы'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedClient?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Основная информация</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedClient.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Телефон:</span>
                      <span className="text-white">{selectedClient.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Статус:</span>
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {getStatusText(selectedClient.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Рейтинг:</span>
                      <span className="text-white">{'⭐'.repeat(selectedClient.rating)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Статистика</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Покупки:</span>
                      <span className="text-white">{selectedClient.total_purchases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Потрачено:</span>
                      <span className="text-white">{formatPrice(selectedClient.total_spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Создан:</span>
                      <span className="text-white">{formatDate(selectedClient.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Источник:</span>
                      <span className="text-white capitalize">{selectedClient.lead_source}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase History */}
              {selectedClient.purchase_history.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">История покупок</h4>
                  <div className="space-y-2">
                    {selectedClient.purchase_history.map((purchase) => (
                      <div key={purchase.id} className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">{purchase.car}</p>
                            <p className="text-gray-400 text-sm">{formatDate(purchase.date)}</p>
                          </div>
                          <p className="text-yellow-400 font-bold">{formatPrice(purchase.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactions History */}
              <div>
                <h4 className="text-white font-medium mb-3">История взаимодействий</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedClient.interactions.map((interaction) => (
                    <div key={interaction.id} className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle size={14} className="text-blue-400" />
                            <span className="text-white text-sm font-medium capitalize">
                              {interaction.type}
                            </span>
                            {interaction.duration && (
                              <span className="text-gray-400 text-xs">({interaction.duration})</span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">{interaction.description}</p>
                        </div>
                        <span className="text-gray-400 text-xs">{formatDate(interaction.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h4 className="text-white font-medium mb-2">Заметки</h4>
                  <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded-lg">
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => updateClientStatus(selectedClient.id, 'active')}
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={selectedClient.status === 'active'}
                >
                  Сделать активным
                </Button>
                <Button 
                  onClick={() => updateClientStatus(selectedClient.id, 'inactive')}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  disabled={selectedClient.status === 'inactive'}
                >
                  Деактивировать
                </Button>
                <Button 
                  onClick={() => window.location.href = `tel:${selectedClient.phone}`}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Phone size={16} className="mr-2" />
                  Позвонить
                </Button>
                <Button 
                  onClick={() => window.location.href = `mailto:${selectedClient.email}`}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <Mail size={16} className="mr-2" />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsManagement;