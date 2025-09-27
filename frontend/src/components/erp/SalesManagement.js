import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('sale'); // 'sale' or 'client'

  const [saleForm, setSaleForm] = useState({
    car_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    sale_price: '',
    payment_method: 'cash',
    notes: ''
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    budget_min: '',
    budget_max: '',
    preferred_brands: [],
    notes: ''
  });

  // Mock data
  const mockSales = [
    {
      id: '1',
      car: { brand: 'Mercedes-Benz', model: 'S-Class', year: 2024 },
      customer_name: 'Иван Петров',
      customer_phone: '+7 (495) 123-45-67',
      sale_price: 8500000,
      payment_method: 'cash',
      date: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      car: { brand: 'BMW', model: 'X5', year: 2023 },
      customer_name: 'Анна Смирнова',
      customer_phone: '+7 (495) 987-65-43',
      sale_price: 6200000,
      payment_method: 'credit',
      date: '2024-01-12T14:20:00Z',
      status: 'pending'
    }
  ];

  const mockClients = [
    {
      id: '1',
      name: 'Александр Козлов',
      phone: '+7 (495) 555-11-22',
      email: 'kozlov@email.com',
      budget_min: 5000000,
      budget_max: 10000000,
      preferred_brands: ['Mercedes-Benz', 'BMW'],
      last_contact: '2024-01-16T09:15:00Z',
      status: 'active'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load sales and clients
      setSales(mockSales);
      setClients(mockClients);
    } catch (error) {
      console.log('Using mock data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newSale = {
        id: Date.now().toString(),
        ...saleForm,
        car: { brand: 'Tesla', model: 'Model S', year: 2024 }, // Mock car data
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      setSales(prev => [newSale, ...prev]);
      toast.success('Продажа оформлена');
      setShowAddModal(false);
      resetSaleForm();
    } catch (error) {
      toast.error('Ошибка при оформлении продажи');
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newClient = {
        id: Date.now().toString(),
        ...clientForm,
        last_contact: new Date().toISOString(),
        status: 'active'
      };
      
      setClients(prev => [newClient, ...prev]);
      toast.success('Клиент добавлен');
      setShowAddModal(false);
      resetClientForm();
    } catch (error) {
      toast.error('Ошибка при добавлении клиента');
    }
  };

  const resetSaleForm = () => {
    setSaleForm({
      car_id: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      sale_price: '',
      payment_method: 'cash',
      notes: ''
    });
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      phone: '',
      email: '',
      budget_min: '',
      budget_max: '',
      preferred_brands: [],
      notes: ''
    });
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

  const getTotalSales = () => {
    return sales.reduce((sum, sale) => sum + sale.sale_price, 0);
  };

  const getCompletedSales = () => {
    return sales.filter(sale => sale.status === 'completed').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner mr-4"></div>
        <span className="text-gray-400">Загрузка данных о продажах...</span>
      </div>
    );
  }

  const renderSales = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{sales.length}</div>
            <div className="text-sm text-gray-400">Всего сделок</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{getCompletedSales()}</div>
            <div className="text-sm text-gray-400">Завершено</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold">
              {formatPrice(getTotalSales()).split(' ₽')[0]}
            </div>
            <div className="text-sm text-gray-400">Общая сумма</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {sales.filter(sale => sale.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">В процессе</div>
          </div>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Автомобиль</th>
                <th className="text-left py-3 px-4 text-gray-300">Клиент</th>
                <th className="text-left py-3 px-4 text-gray-300">Сумма</th>
                <th className="text-left py-3 px-4 text-gray-300">Способ оплаты</th>
                <th className="text-left py-3 px-4 text-gray-300">Дата</th>
                <th className="text-left py-3 px-4 text-gray-300">Статус</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <div className="text-white font-semibold">
                      {sale.car.brand} {sale.car.model}
                    </div>
                    <div className="text-gray-400 text-sm">{sale.car.year} год</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white">{sale.customer_name}</div>
                    <div className="text-gray-400 text-sm">{sale.customer_phone}</div>
                  </td>
                  <td className="py-3 px-4 text-gold font-semibold">
                    {formatPrice(sale.sale_price)}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {sale.payment_method === 'cash' ? 'Наличные' :
                     sale.payment_method === 'credit' ? 'Кредит' :
                     sale.payment_method === 'bank_transfer' ? 'Перевод' : 'Другое'}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {formatDate(sale.date)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${
                      sale.status === 'completed' ? 'bg-green-600 text-white' :
                      sale.status === 'pending' ? 'bg-yellow-600 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {sale.status === 'completed' ? 'Завершено' :
                       sale.status === 'pending' ? 'В процессе' : 'Отменено'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      {/* Clients Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{clients.length}</div>
            <div className="text-sm text-gray-400">Всего клиентов</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {clients.filter(client => client.status === 'active').length}
            </div>
            <div className="text-sm text-gray-400">Активные</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold">
              {clients.filter(client => 
                new Date(client.last_contact) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="text-sm text-gray-400">Новые за неделю</div>
          </div>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-black font-bold mr-3">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{client.name}</h3>
                  <Badge className={`${
                    client.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                  } text-white text-xs`}>
                    {client.status === 'active' ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-400 text-sm">
                <i className="fas fa-phone w-4 mr-2"></i>
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <i className="fas fa-envelope w-4 mr-2"></i>
                <span>{client.email}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <i className="fas fa-ruble-sign w-4 mr-2"></i>
                <span>
                  {formatPrice(client.budget_min)} - {formatPrice(client.budget_max)}
                </span>
              </div>
            </div>

            {client.preferred_brands.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Предпочтения:</p>
                <div className="flex flex-wrap gap-1">
                  {client.preferred_brands.map((brand) => (
                    <Badge key={brand} className="bg-blue-600 text-white text-xs">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-gray-400 text-xs mb-4">
              Последний контакт: {formatDate(client.last_contact)}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="btn-outline-gold text-xs flex-1">
                <i className="fas fa-phone mr-1"></i>
                Звонок
              </Button>
              <Button size="sm" className="btn-outline-gold text-xs flex-1">
                <i className="fas fa-envelope mr-1"></i>
                Email
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {activeTab === 'sales' ? 'Управление продажами' : 'Управление клиентами'}
          </h2>
          <p className="text-gray-400">
            {activeTab === 'sales' 
              ? `Всего сделок: ${sales.length}` 
              : `Всего клиентов: ${clients.length}`}
          </p>
        </div>
        <Button 
          onClick={() => {
            setModalType(activeTab === 'sales' ? 'sale' : 'client');
            setShowAddModal(true);
          }}
          className="btn-gold"
        >
          <i className="fas fa-plus mr-2"></i>
          {activeTab === 'sales' ? 'Новая продажа' : 'Добавить клиента'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'sales'
              ? 'text-gold border-b-2 border-gold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fas fa-handshake mr-2"></i>
          Продажи
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'clients'
              ? 'text-gold border-b-2 border-gold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <i className="fas fa-users mr-2"></i>
          Клиенты
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'sales' ? renderSales() : renderClients()}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {modalType === 'sale' ? 'Новая продажа' : 'Добавить клиента'}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>

            {modalType === 'sale' ? (
              <form onSubmit={handleSaleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Автомобиль *
                  </label>
                  <select
                    name="car_id"
                    required
                    value={saleForm.car_id}
                    onChange={(e) => setSaleForm(prev => ({...prev, car_id: e.target.value}))}
                    className="form-input w-full"
                  >
                    <option value="">Выберите автомобиль</option>
                    <option value="1">Mercedes-Benz S-Class 2024</option>
                    <option value="2">BMW X5 2023</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя клиента *
                    </label>
                    <input
                      type="text"
                      required
                      value={saleForm.customer_name}
                      onChange={(e) => setSaleForm(prev => ({...prev, customer_name: e.target.value}))}
                      className="form-input w-full"
                      placeholder="Иван Петров"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      required
                      value={saleForm.customer_phone}
                      onChange={(e) => setSaleForm(prev => ({...prev, customer_phone: e.target.value}))}
                      className="form-input w-full"
                      placeholder="+7 (495) 123-45-67"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={saleForm.customer_email}
                    onChange={(e) => setSaleForm(prev => ({...prev, customer_email: e.target.value}))}
                    className="form-input w-full"
                    placeholder="client@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Цена продажи *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={saleForm.sale_price}
                      onChange={(e) => setSaleForm(prev => ({...prev, sale_price: e.target.value}))}
                      className="form-input w-full"
                      placeholder="8500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Способ оплаты
                    </label>
                    <select
                      value={saleForm.payment_method}
                      onChange={(e) => setSaleForm(prev => ({...prev, payment_method: e.target.value}))}
                      className="form-input w-full"
                    >
                      <option value="cash">Наличные</option>
                      <option value="bank_transfer">Банковский перевод</option>
                      <option value="credit">Кредит</option>
                      <option value="trade_in">Трейд-ин</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Примечания
                  </label>
                  <textarea
                    rows={3}
                    value={saleForm.notes}
                    onChange={(e) => setSaleForm(prev => ({...prev, notes: e.target.value}))}
                    className="form-input w-full"
                    placeholder="Дополнительная информация о сделке"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="btn-gold">
                    <i className="fas fa-handshake mr-2"></i>
                    Оформить продажу
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline-gold"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleClientSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Имя клиента *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientForm.name}
                      onChange={(e) => setClientForm(prev => ({...prev, name: e.target.value}))}
                      className="form-input w-full"
                      placeholder="Александр Иванов"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientForm.phone}
                      onChange={(e) => setClientForm(prev => ({...prev, phone: e.target.value}))}
                      className="form-input w-full"
                      placeholder="+7 (495) 123-45-67"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm(prev => ({...prev, email: e.target.value}))}
                    className="form-input w-full"
                    placeholder="client@email.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Бюджет от (₽)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={clientForm.budget_min}
                      onChange={(e) => setClientForm(prev => ({...prev, budget_min: e.target.value}))}
                      className="form-input w-full"
                      placeholder="3000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Бюджет до (₽)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={clientForm.budget_max}
                      onChange={(e) => setClientForm(prev => ({...prev, budget_max: e.target.value}))}
                      className="form-input w-full"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Примечания
                  </label>
                  <textarea
                    rows={3}
                    value={clientForm.notes}
                    onChange={(e) => setClientForm(prev => ({...prev, notes: e.target.value}))}
                    className="form-input w-full"
                    placeholder="Предпочтения клиента, история взаимодействий"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="btn-gold">
                    <i className="fas fa-user-plus mr-2"></i>
                    Добавить клиента
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-outline-gold"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;