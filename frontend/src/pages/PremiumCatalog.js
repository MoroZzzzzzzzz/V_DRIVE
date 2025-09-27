import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PremiumCatalog = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: 10000000, // Start from 10M rubles
    maxPrice: '',
    brand: '',
    location: 'Москва'
  });

  // Mock premium cars data
  const mockPremiumCars = [
    {
      id: '1',
      brand: 'Lamborghini',
      model: 'Aventador SVJ',
      year: 2024,
      price: 45000000,
      currency: 'RUB',
      color: 'Оранжевый',
      mileage: 0,
      images: ['https://images.unsplash.com/photo-1519245659620-e859806a8d3b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '6.5L V12',
      transmission: 'Робот',
      fuel_type: 'Бензин',
      features: ['Карбоновый кузов', 'Аэродинамический пакет', 'Керамические тормоза', 'Спортивные сиденья']
    },
    {
      id: '2',
      brand: 'Rolls-Royce',
      model: 'Phantom VIII',
      year: 2024,
      price: 35000000,
      currency: 'RUB',
      color: 'Черный',
      mileage: 500,
      images: ['https://images.unsplash.com/photo-1618418721668-0d1f72aa4bab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '6.75L V12 Twin-Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин',
      features: ['Звездное небо', 'Холодильник', 'Массаж сидений', 'Панорамная крыша']
    },
    {
      id: '3',
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2023,
      price: 38000000,
      currency: 'RUB',
      color: 'Красный',
      mileage: 1200,
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxmZXJyYXJpfGVufDB8fHx8MTc1ODk5NzQ1MHww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '4.0L V8 Hybrid',
      transmission: 'Робот',
      fuel_type: 'Гибрид',
      features: ['Гибридная установка', 'Карбоновые детали', 'Активная аэродинамика', 'F1-технологии']
    },
    {
      id: '4',
      brand: 'McLaren',
      model: '720S Spider',
      year: 2023,
      price: 25000000,
      currency: 'RUB',
      color: 'Синий',
      mileage: 2500,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxtY2xhcmVufGVufDB8fHx8MTc1ODk5NzQ2MHww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '4.0L V8 Twin-Turbo',
      transmission: 'Робот',
      fuel_type: 'Бензин',
      features: ['Складная крыша', 'Углепластиковый кузов', 'Активная подвеска', 'Спорт-режимы']
    },
    {
      id: '5',
      brand: 'Bentley',
      model: 'Mulsanne Speed',
      year: 2024,
      price: 18000000,
      currency: 'RUB',
      color: 'Серебристый',
      mileage: 100,
      images: ['https://images.unsplash.com/photo-1566473965997-3de9c817e938?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxiZW50bGV5fGVufDB8fHx8MTc1ODk5NzQ3MHww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '6.75L V8 Twin-Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин',
      features: ['Кожа ручной работы', 'Шпон корня ореха', 'Климат 4-зоны', 'Мультимедиа Naim']
    },
    {
      id: '6',
      brand: 'Aston Martin',
      model: 'DBS Superleggera',
      year: 2023,
      price: 22000000,
      currency: 'RUB',
      color: 'Зеленый',
      mileage: 800,
      images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxhc3RvbiUyMG1hcnRpbnxlbnwwfHx8fDE3NTg5OTc0ODB8MA&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '5.2L V12 Twin-Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин',
      features: ['Карбоновая крыша', 'Спортивная подвеска', 'Выхлопная система Akrapovic', 'Bang & Olufsen']
    }
  ];

  useEffect(() => {
    loadPremiumCars();
  }, [filters]);

  const loadPremiumCars = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('is_premium', 'true');
      
      if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
      if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
      if (filters.brand) queryParams.append('brand', filters.brand);

      const response = await axios.get(`${BACKEND_URL}/api/cars?${queryParams}`);
      setCars(response.data);
    } catch (error) {
      console.log('Using mock data for premium catalog');
      setCars(mockPremiumCars);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'RUB') => {
    if (currency === 'RUB') {
      return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const premiumBrands = [
    'Все марки', 'Lamborghini', 'Ferrari', 'McLaren', 'Rolls-Royce', 'Bentley', 
    'Aston Martin', 'Bugatti', 'Koenigsegg', 'Pagani', 'Maserati'
  ];

  return (
    <div className="pt-20 min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('${mockPremiumCars[0].images[0]}')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto container-padding">
            <div className="max-w-2xl">
              <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-4">
                <i className="fas fa-crown mr-2"></i>
                PREMIUM COLLECTION
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white text-shadow">
                Эксклюзивные
                <span className="gold-gradient block">автомобили</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 text-shadow">
                Коллекция самых редких и дорогих автомобилей в Москве. 
                Персональный сервис и индивидуальный подход.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="btn-gold text-lg px-8 py-4">
                  <i className="fas fa-phone mr-2"></i>
                  Персональный консультант
                </Button>
                <Button className="btn-outline-gold text-lg px-8 py-4">
                  <i className="fas fa-calendar-check mr-2"></i>
                  Записаться на просмотр
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute bottom-8 right-8 text-white/60">
          <div className="text-sm mb-2">От {formatPrice(filters.minPrice)}</div>
          <div className="text-2xl font-bold text-gold">PREMIUM</div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-3">
                <i className="fas fa-concierge-bell"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">VIP Сервис</h3>
              <p className="text-gray-400 text-sm">Персональный менеджер и индивидуальное обслуживание</p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-3">
                <i className="fas fa-shield-check"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Гарантия</h3>
              <p className="text-gray-400 text-sm">Полная проверка и сертификация каждого автомобиля</p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-3">
                <i className="fas fa-truck"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Доставка</h3>
              <p className="text-gray-400 text-sm">Бесплатная доставка в любую точку Москвы</p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="text-3xl text-gold mb-3">
                <i className="fas fa-handshake"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trade-in</h3>
              <p className="text-gray-400 text-sm">Выгодный обмен вашего автомобиля</p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-car mr-2"></i>Марка
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value === 'Все марки' ? '' : e.target.value)}
                  className="form-input w-full"
                >
                  {premiumBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-ruble-sign mr-2"></i>Цена от, ₽
                </label>
                <select
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="form-input w-full"
                >
                  <option value="10000000">10 млн ₽</option>
                  <option value="15000000">15 млн ₽</option>
                  <option value="20000000">20 млн ₽</option>
                  <option value="30000000">30 млн ₽</option>
                  <option value="50000000">50 млн ₽</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <i className="fas fa-ruble-sign mr-2"></i>Цена до, ₽
                </label>
                <input
                  type="number"
                  placeholder="Без ограничений"
                  className="form-input w-full"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  className="btn-gold w-full"
                  onClick={loadPremiumCars}
                >
                  <i className="fas fa-search mr-2"></i>
                  Найти
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Premium Cars Grid */}
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          {loading ? (
            <div className="text-center py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка эксклюзивных автомобилей...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">
                  Найдено: <span className="text-gold">{cars.length}</span> автомобилей
                </h2>
                <div className="flex gap-4">
                  <select className="form-input">
                    <option>Сначала дорогие</option>
                    <option>Сначала дешевые</option>
                    <option>По году (новые)</option>
                    <option>По году (старые)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {cars.map((car) => (
                  <Card key={car.id} className="premium-car-card p-0 overflow-hidden group">
                    {/* Car Image */}
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={car.images[0] || '/api/placeholder/500/400'}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Premium Badge */}
                      <Badge className="absolute top-4 left-4 bg-gold text-black font-semibold">
                        <i className="fas fa-crown mr-1"></i>
                        ЭКСКЛЮЗИВ
                      </Badge>

                      {/* Year Badge */}
                      <Badge className="absolute top-4 right-4 bg-black/60 text-white border border-gold">
                        {car.year}
                      </Badge>

                      {/* Quick Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-white">
                          <h3 className="text-xl font-bold mb-1">
                            {car.brand} {car.model}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {car.mileage?.toLocaleString()} км • {car.color}
                          </p>
                        </div>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
                        <div className="space-y-3">
                          <Link to={`/car/${car.id}`}>
                            <Button className="btn-gold w-full">
                              <i className="fas fa-eye mr-2"></i>
                              Подробнее
                            </Button>
                          </Link>
                          <Button className="btn-outline-gold w-full">
                            <i className="fas fa-phone mr-2"></i>
                            Связаться
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Car Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-bold text-gold">
                          {formatPrice(car.price, car.currency)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gold"
                        >
                          <i className="fas fa-heart"></i>
                        </Button>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Двигатель:</span>
                          <span className="text-white">{car.engine_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Коробка:</span>
                          <span className="text-white">{car.transmission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Топливо:</span>
                          <span className="text-white">{car.fuel_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Локация:</span>
                          <span className="text-white">{car.location}</span>
                        </div>
                      </div>

                      {/* Features */}
                      {car.features && car.features.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {car.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} className="bg-gray-800 text-gray-300 text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {car.features.length > 3 && (
                              <Badge className="bg-gray-800 text-gray-300 text-xs">
                                +{car.features.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link to={`/car/${car.id}`} className="flex-1">
                          <Button className="w-full btn-outline-gold">
                            Подробнее
                          </Button>
                        </Link>
                        <Button className="btn-gold px-4">
                          <i className="fas fa-phone"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* VIP Services */}
      <section className="section-padding bg-gradient-to-t from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding text-center">
          <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
            VIP УСЛУГИ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Эксклюзивное <span className="gold-gradient">обслуживание</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Для владельцев премиум автомобилей мы предлагаем особый уровень сервиса
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-card p-8">
              <div className="text-4xl text-gold mb-4">
                <i className="fas fa-user-tie"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Персональный менеджер</h3>
              <p className="text-gray-400">Индивидуальный подход и сопровождение на всех этапах</p>
            </Card>

            <Card className="glass-card p-8">
              <div className="text-4xl text-gold mb-4">
                <i className="fas fa-home"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Показ на дому</h3>
              <p className="text-gray-400">Привезем автомобиль для осмотра в удобное место</p>
            </Card>

            <Card className="glass-card p-8">
              <div className="text-4xl text-gold mb-4">
                <i className="fas fa-tools"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Техническое сопровождение</h3>
              <p className="text-gray-400">Помощь в оформлении документов и техосмотре</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button className="btn-gold text-lg px-8 py-4">
              <i className="fas fa-phone mr-2"></i>
              +7 (495) 123-45-67
            </Button>
            <Button className="btn-outline-gold text-lg px-8 py-4">
              <i className="fas fa-envelope mr-2"></i>
              premium@velesdrive.ru
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PremiumCatalog;