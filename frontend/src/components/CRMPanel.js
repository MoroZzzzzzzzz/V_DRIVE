import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit, 
  Car, 
  Calendar,
  DollarSign,
  UserPlus,
  History,
  Gift,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const CRMPanel = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSales, setCustomerSales] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: []
  });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user, token, isDealer } = useAuth();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user?.role === 'dealer') {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/crm/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSales = async (customerId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/crm/customers/${customerId}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomerSales(response.data);
    } catch (error) {
      console.error('Error fetching customer sales:', error);
    }
  };

  const addCustomer = async () => {
    try {
      await axios.post(`${backendUrl}/api/crm/customers`, newCustomer, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        tags: []
      });
      setShowAddCustomer(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerSales(customer.id);
  };

  const CustomerCard = ({ customer }) => (
    <Card 
      className={`cursor-pointer transition-colors ${
        selectedCustomer?.id === customer.id 
          ? 'bg-yellow-600/20 border-yellow-600' 
          : 'bg-gray-800 border-gray-700 hover:border-yellow-600/50'
      }`}
      onClick={() => selectCustomer(customer)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-white">{customer.name}</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={12} />
                {customer.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} />
                {customer.phone}
              </div>
              {customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} />
                  {customer.address}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {customer.tags?.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
            {customer.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const CustomerDetails = ({ customer, sales }) => (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users size={20} />
            Информация о клиенте
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Имя</Label>
              <p className="text-white font-medium">{customer.name}</p>
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <p className="text-white">{customer.email}</p>
            </div>
            <div>
              <Label className="text-gray-300">Телефон</Label>
              <p className="text-white">{customer.phone}</p>
            </div>
            <div>
              <Label className="text-gray-300">Статус</Label>
              <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                {customer.status}
              </Badge>
            </div>
          </div>
          
          {customer.address && (
            <div>
              <Label className="text-gray-300">Адрес</Label>
              <p className="text-white">{customer.address}</p>
            </div>
          )}
          
          {customer.notes && (
            <div>
              <Label className="text-gray-300">Заметки</Label>
              <p className="text-gray-300">{customer.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-300">Дата добавления</Label>
              <p className="text-white">
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-gray-300">Последний контакт</Label>
              <p className="text-white">
                {customer.last_contact 
                  ? new Date(customer.last_contact).toLocaleDateString()
                  : 'Никогда'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History size={20} />
            История покупок
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-gray-400">Покупок пока нет</p>
          ) : (
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Car size={16} className="text-yellow-600" />
                    <div>
                      <p className="text-white font-medium">
                        Продажа #{sale.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {sale.sale_price.toLocaleString()} ₽
                    </p>
                    <Badge variant={
                      sale.status === 'completed' ? 'default' : 'secondary'
                    }>
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (user?.role !== 'dealer') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Доступ только для дилеров</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">CRM Система</h2>
          <p className="text-gray-400">Управление клиентами и продажами</p>
        </div>
        
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
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
                <Label className="text-gray-300">Имя *</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email *</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Телефон *</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Адрес</Label>
                <Input
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Заметки</Label>
                <Textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={addCustomer}
                className="w-full bg-yellow-600 text-black hover:bg-yellow-700"
                disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone}
              >
                <UserPlus size={16} className="mr-2" />
                Добавить клиента
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers list */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users size={20} />
                Клиенты ({customers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-gray-400">Загрузка...</p>
              ) : customers.length === 0 ? (
                <p className="text-gray-400">Клиентов пока нет</p>
              ) : (
                customers.map((customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer details */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <CustomerDetails 
              customer={selectedCustomer} 
              sales={customerSales} 
            />
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-gray-400">Выберите клиента для просмотра деталей</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMPanel;