import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import CarsManagement from '../components/erp/CarsManagement';
import SalesManagement from '../components/erp/SalesManagement';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ERPDashboard = () => {
  const { user, isDealer } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock dashboard data
  const mockDashboardData = {
    stats: {
      total_cars: 45,
      available_cars: 38,
      sold_cars: 7
    },
    recent_transactions: [
      {
        id: '1',
        type: 'sale',
        amount: 8500000,
        currency: 'RUB',
        description: 'Продажа Mercedes-Benz S-Class',
        date: '2024-01-15T10:30:00Z'
      }
    ]
  };

  useEffect(() => {
    if (isDealer) {
      loadDashboardData();
    }
  }, [isDealer]);

  const loadDashboardData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/erp/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.log('Using mock data for ERP dashboard');
      setDashboardData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isDealer) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-gray-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-gray-400 mb-6">ERP система доступна только для дилеров</p>
          <Button className="btn-gold" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left mr-2"></i>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (amount, currency = 'RUB') => {
    if (currency === 'RUB') {
      return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
    }
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка ERP системы...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Панель управления', icon: 'fas fa-tachometer-alt' },
    { id: 'cars', label: 'Склад автомобилей', icon: 'fas fa-car' },
    { id: 'sales', label: 'Продажи', icon: 'fas fa-chart-line' },
    { id: 'finance', label: 'Финансы', icon: 'fas fa-coins' },
    { id: 'reports', label: 'Отчеты', icon: 'fas fa-file-chart' }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Всего автомобилей</p>
              <p className="text-3xl font-bold text-white">{dashboardData.stats.total_cars}</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-car text-white"></i>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">В наличии</p>
              <p className="text-3xl font-bold text-white">{dashboardData.stats.available_cars}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-white"></i>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Продано</p>
              <p className="text-3xl font-bold text-white">{dashboardData.stats.sold_cars}</p>
            </div>
            <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
              <i className="fas fa-handshake text-black"></i>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Последние сделки</h3>
          <Button className="btn-outline-gold text-sm">
            <i className="fas fa-plus mr-2"></i>
            Добавить сделку
          </Button>
        </div>

        <div className="space-y-4">
          {dashboardData.recent_transactions.length > 0 ? (
            dashboardData.recent_transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                    transaction.type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    <i className={`fas ${
                      transaction.type === 'sale' ? 'fa-arrow-up' : 'fa-arrow-down'
                    } text-white`}></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{transaction.description}</p>
                    <p className="text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'sale' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {transaction.type === 'sale' ? '+' : '-'}{formatPrice(transaction.amount, transaction.currency)}
                  </p>
                  <Badge className={`${
                    transaction.type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
                  } text-white text-xs`}>
                    {transaction.type === 'sale' ? 'Продажа' : 'Покупка'}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <i className="fas fa-receipt text-4xl mb-4"></i>
              <p>Нет сделок за последнее время</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="btn-outline-gold h-20 flex-col">
            <i className="fas fa-plus text-2xl mb-2"></i>
            <span>Добавить авто</span>
          </Button>
          
          <Button className="btn-outline-gold h-20 flex-col">
            <i className="fas fa-handshake text-2xl mb-2"></i>
            <span>Новая сделка</span>
          </Button>
          
          <Button className="btn-outline-gold h-20 flex-col">
            <i className="fas fa-users text-2xl mb-2"></i>
            <span>Клиенты</span>
          </Button>
          
          <Button className="btn-outline-gold h-20 flex-col">
            <i className="fas fa-chart-bar text-2xl mb-2"></i>
            <span>Отчеты</span>
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderPlaceholder = (title, icon) => (
    <Card className="glass-card p-8 text-center">
      <i className={`${icon} text-6xl text-gray-600 mb-4`}></i>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">Раздел находится в разработке</p>
      <Button className="btn-gold">
        <i className="fas fa-hammer mr-2"></i>
        Скоро будет доступно
      </Button>
    </Card>
  );

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ERP Система <Badge className="bg-gold text-black ml-2">PRO</Badge>
          </h1>
          <p className="text-gray-400">Добро пожаловать, {user.full_name}</p>
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
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'cars' && <CarsManagement />}
          {activeTab === 'sales' && <SalesManagement />}
          {activeTab === 'finance' && renderPlaceholder('Финансы', 'fas fa-coins')}
          {activeTab === 'reports' && renderPlaceholder('Отчеты', 'fas fa-file-chart')}
        </div>
      </div>
    </div>
  );
};

export default ERPDashboard;