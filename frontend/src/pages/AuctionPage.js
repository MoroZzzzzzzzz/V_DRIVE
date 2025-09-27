import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const AuctionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // Mock auctions data
  const mockAuctions = [
    {
      id: '1',
      car: {
        brand: 'Mercedes-Benz',
        model: 'S-Class AMG',
        year: 2023,
        mileage: 8500,
        color: 'Черный',
        image: 'https://images.unsplash.com/photo-1618418721668-0d1f72aa4bab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'
      },
      starting_price: 7500000,
      current_bid: 8200000,
      reserve_price: 8500000,
      total_bids: 15,
      ends_at: '2024-01-20T18:00:00Z',
      status: 'active',
      seller: 'Премиум Авто Москва',
      is_reserve_met: false,
      last_bidder: 'И***в А.',
      min_increment: 50000
    },
    {
      id: '2',
      car: {
        brand: 'Porsche',
        model: '911 Turbo S',
        year: 2024,
        mileage: 1200,
        color: 'Красный',
        image: 'https://images.unsplash.com/photo-1613575192938-832cf142755a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxwcmVtaXVtJTIwY2Fyc3xlbnwwfHx8fDE3NTg5OTcwMTJ8MA&ixlib=rb-4.1.0&q=85'
      },
      starting_price: 18000000,
      current_bid: 19500000,
      reserve_price: 20000000,
      total_bids: 23,
      ends_at: '2024-01-18T20:30:00Z',
      status: 'active',
      seller: 'Элит Моторс СПб',
      is_reserve_met: false,
      last_bidder: 'С***й К.',
      min_increment: 100000
    },
    {
      id: '3',
      car: {
        brand: 'Ferrari',
        model: 'F8 Tributo',
        year: 2023,
        mileage: 2800,
        color: 'Желтый',
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxmZXJyYXJpfGVufDB8fHx8MTc1ODk5NzQ1MHww&ixlib=rb-4.1.0&q=85'
      },
      starting_price: 22000000,
      current_bid: 24800000,
      reserve_price: 25000000,
      total_bids: 31,
      ends_at: '2024-01-17T16:00:00Z',
      status: 'ending_soon',
      seller: 'Драйв Центр',
      is_reserve_met: false,
      last_bidder: 'М***а П.',
      min_increment: 200000
    }
  ];

  useEffect(() => {
    loadAuctions();
    // Setup real-time updates (in real app would use WebSocket)
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      // Mock loading
      setAuctions(mockAuctions);
    } catch (error) {
      console.error('Error loading auctions:', error);
      toast.error('Ошибка загрузки аукционов');
    } finally {
      setLoading(false);
    }
  };

  const updateCountdowns = () => {
    setAuctions(prev => prev.map(auction => {
      const now = new Date();
      const endTime = new Date(auction.ends_at);
      const timeLeft = endTime - now;
      
      if (timeLeft <= 0 && auction.status === 'active') {
        return { ...auction, status: 'ended' };
      }
      
      if (timeLeft <= 300000 && auction.status === 'active') { // 5 minutes
        return { ...auction, status: 'ending_soon' };
      }
      
      return auction;
    }));
  };

  const handlePlaceBid = async (auctionId, amount) => {
    if (!isAuthenticated) {
      toast.error('Войдите в систему для участия в аукционе');
      return;
    }

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

    const bidValue = parseInt(amount);
    const minBid = auction.current_bid + auction.min_increment;

    if (bidValue < minBid) {
      toast.error(`Минимальная ставка: ${formatPrice(minBid)}`);
      return;
    }

    try {
      // Mock bid placement
      setAuctions(prev => prev.map(a => 
        a.id === auctionId 
          ? {
              ...a,
              current_bid: bidValue,
              total_bids: a.total_bids + 1,
              last_bidder: user.full_name.charAt(0) + '***' + user.full_name.split(' ')[1]?.charAt(0) + '.',
              is_reserve_met: bidValue >= a.reserve_price
            }
          : a
      ));
      
      setBidAmount('');
      setSelectedAuction(null);
      toast.success('Ставка размещена успешно!');
      
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Ошибка размещения ставки');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const formatTimeLeft = (endTime) => {
    const now = new Date();
    const timeLeft = new Date(endTime) - now;
    
    if (timeLeft <= 0) return 'Аукцион завершен';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    if (minutes > 0) return `${minutes}м ${seconds}с`;
    return `${seconds}с`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'ending_soon': return 'bg-red-600';
      case 'ended': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'ending_soon': return 'Заканчивается';
      case 'ended': return 'Завершен';
      default: return 'Неизвестно';
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    if (activeTab === 'active') return auction.status === 'active' || auction.status === 'ending_soon';
    if (activeTab === 'ended') return auction.status === 'ended';
    return true;
  });

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка аукционов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
              <i className="fas fa-gavel mr-2"></i>
              ПРЕМИУМ АУКЦИОНЫ
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Аукционы <span className="gold-gradient">автомобилей</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Участвуйте в торгах за эксклюзивные и редкие автомобили
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-2">
                <i className="fas fa-gavel"></i>
              </div>
              <div className="text-2xl font-bold text-white">{auctions.length}</div>
              <div className="text-sm text-gray-400">Активных аукционов</div>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-2">
                <i className="fas fa-users"></i>
              </div>
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-sm text-gray-400">Участников</div>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-2">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="text-2xl font-bold text-white">89%</div>
              <div className="text-sm text-gray-400">Успешных сделок</div>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-2">
                <i className="fas fa-ruble-sign"></i>
              </div>
              <div className="text-2xl font-bold text-white">150М+</div>
              <div className="text-sm text-gray-400">Оборот в месяц</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Auctions */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-play mr-2"></i>
              Активные ({auctions.filter(a => a.status === 'active' || a.status === 'ending_soon').length})
            </button>
            <button
              onClick={() => setActiveTab('ended')}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'ended'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-flag-checkered mr-2"></i>
              Завершенные
            </button>
          </div>

          {/* Auction Cards */}
          {filteredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAuctions.map((auction) => (
                <Card key={auction.id} className="premium-car-card p-0 overflow-hidden">
                  {/* Car Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={auction.car.image}
                      alt={`${auction.car.brand} ${auction.car.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Status Badge */}
                    <Badge className={`absolute top-4 left-4 ${getStatusColor(auction.status)} text-white`}>
                      {getStatusText(auction.status)}
                    </Badge>

                    {/* Reserve Status */}
                    {auction.is_reserve_met && (
                      <Badge className="absolute top-4 right-4 bg-green-600 text-white">
                        <i className="fas fa-check mr-1"></i>
                        Резерв достигнут
                      </Badge>
                    )}

                    {/* Time Left */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                      <i className="fas fa-clock mr-1"></i>
                      {formatTimeLeft(auction.ends_at)}
                    </div>
                  </div>

                  {/* Auction Details */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {auction.car.brand} {auction.car.model}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {auction.car.year} • {auction.car.mileage?.toLocaleString()} км • {auction.car.color}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Продавец: {auction.seller}
                      </p>
                    </div>

                    {/* Bid Information */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Стартовая цена:</span>
                        <span className="text-white text-sm">{formatPrice(auction.starting_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Текущая ставка:</span>
                        <span className="text-gold font-bold">{formatPrice(auction.current_bid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Всего ставок:</span>
                        <span className="text-white text-sm">{auction.total_bids}</span>
                      </div>
                      {auction.last_bidder && (
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Лидер:</span>
                          <span className="text-white text-sm">{auction.last_bidder}</span>
                        </div>
                      )}
                    </div>

                    {/* Bid Actions */}
                    {auction.status === 'active' || auction.status === 'ending_soon' ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={`Мин. ${formatPrice(auction.current_bid + auction.min_increment)}`}
                            className="form-input flex-1 text-sm"
                            value={selectedAuction === auction.id ? bidAmount : ''}
                            onChange={(e) => {
                              setSelectedAuction(auction.id);
                              setBidAmount(e.target.value);
                            }}
                          />
                          <Button
                            onClick={() => handlePlaceBid(auction.id, bidAmount)}
                            disabled={!bidAmount || !isAuthenticated}
                            className="btn-gold"
                          >
                            <i className="fas fa-gavel mr-1"></i>
                            Ставка
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Минимальный шаг: {formatPrice(auction.min_increment)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <Badge className="bg-gray-600 text-white">
                          Аукцион завершен
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card p-12 text-center">
              <i className="fas fa-gavel text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeTab === 'active' ? 'Нет активных аукционов' : 'Нет завершенных аукционов'}
              </h3>
              <p className="text-gray-400">
                {activeTab === 'active' 
                  ? 'Скоро появятся новые лоты для торгов'
                  : 'История аукционов пока пуста'
                }
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="section-padding bg-gradient-to-t from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Как работают <span className="gold-gradient">аукционы</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Регистрация</h3>
              <p className="text-gray-400 text-sm">
                Войдите в систему или зарегистрируйтесь для участия в торгах
              </p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Выбор лота</h3>
              <p className="text-gray-400 text-sm">
                Изучите автомобиль, его характеристики и условия аукциона
              </p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Участие</h3>
              <p className="text-gray-400 text-sm">
                Делайте ставки в режиме реального времени до завершения торгов
              </p>
            </Card>

            <Card className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-black text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Победа</h3>
              <p className="text-gray-400 text-sm">
                Оформите сделку и получите автомобиль при выигрыше аукциона
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuctionPage;