import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, GitCompare, Eye } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CatalogPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [filters, setFilters] = useState({
    vehicleType: 'car',
    brand: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    isPremium: false
  });

  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data for development
  const mockCars = [
    {
      id: '1',
      brand: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2024,
      price: 8500000,
      currency: 'RUB',
      color: 'Черный',
      mileage: 0,
      images: ['https://images.unsplash.com/photo-1618418721668-0d1f72aa4bab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '3.0L V6 Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин'
    },
    {
      id: '2',
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      price: 6200000,
      currency: 'RUB',
      color: 'Белый',
      mileage: 15000,
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxibXclMjBjYXJ8ZW58MHx8fHwxNzU4OTk3MzAwfDA&ixlib=rb-4.1.0&q=85'],
      is_premium: false,
      location: 'Санкт-Петербург',
      engine_type: '3.0L I6 Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин'
    }
  ];

  useEffect(() => {
    loadCars();
  }, [filters]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.model) queryParams.append('model', filters.model);
      if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
      if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
      if (filters.minYear) queryParams.append('min_year', filters.minYear);
      if (filters.maxYear) queryParams.append('max_year', filters.maxYear);
      if (filters.isPremium) queryParams.append('is_premium', 'true');

      const response = await axios.get(`${BACKEND_URL}/api/cars?${queryParams}`);
      setCars(response.data);
    } catch (error) {
      console.log('Using mock data for catalog');
      setCars(mockCars);
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

  // Record car view
  const recordCarView = async (carId) => {
    if (!user || !token) return;
    
    try {
      await axios.post(`${BACKEND_URL}/api/cars/${carId}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording car view:', error);
    }
  };

  // Comparison functions
  const toggleComparison = (carId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(carId)) {
        return prev.filter(id => id !== carId);
      } else {
        if (prev.length >= 5) {
          toast({
            title: "Максимум 5 автомобилей",
            description: "Можно сравнить не более 5 автомобилей одновременно",
            variant: "destructive"
          });
          return prev;
        }
        return [...prev, carId];
      }
    });
  };

  const compareSelected = () => {
    if (selectedForComparison.length < 2) {
      toast({
        title: "Выберите автомобили",
        description: "Для сравнения нужно выбрать минимум 2 автомобиля",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/compare', { state: { carIds: selectedForComparison } });
  };

  const clearComparison = () => {
    setSelectedForComparison([]);
  };

  return (
    <div className="pt-20 min-h-screen bg-black">
      {/* Header */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Каталог <span className="gold-gradient">автомобилей</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Более 1000 автомобилей от проверенных дилеров по всей России
            </p>
          </div>

          {/* Filters */}
          <Card className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Марка</label>
                <input
                  type="text"
                  placeholder="Например, BMW"
                  className="form-input w-full"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Модель</label>
                <input
                  type="text"
                  placeholder="Например, X5"
                  className="form-input w-full"
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Цена от, ₽</label>
                <input
                  type="number"
                  placeholder="1000000"
                  className="form-input w-full"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Цена до, ₽</label>
                <input
                  type="number"
                  placeholder="10000000"
                  className="form-input w-full"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Год от</label>
                <input
                  type="number"
                  placeholder="2020"
                  className="form-input w-full"
                  value={filters.minYear}
                  onChange={(e) => handleFilterChange('minYear', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Год до</label>
                <input
                  type="number"
                  placeholder="2024"
                  className="form-input w-full"
                  value={filters.maxYear}
                  onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={filters.isPremium}
                    onChange={(e) => handleFilterChange('isPremium', e.target.checked)}
                  />
                  Только премиум
                </label>
              </div>

              <div className="flex items-end">
                <Button 
                  className="btn-gold w-full"
                  onClick={loadCars}
                >
                  <i className="fas fa-search mr-2"></i>
                  Найти
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          {loading ? (
            <div className="text-center py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Поиск автомобилей...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Найдено автомобилей: <span className="text-gold">{cars.length}</span>
                </h2>
                <div className="flex gap-4">
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    <i className="fas fa-th-large mr-2"></i>
                    Сетка
                  </Button>
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    <i className="fas fa-list mr-2"></i>
                    Список
                  </Button>
                </div>
              </div>

              {/* Comparison Panel */}
              {selectedForComparison.length > 0 && (
                <Card className="bg-yellow-600 text-black p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <GitCompare size={20} />
                      <span className="font-semibold">
                        Выбрано для сравнения: {selectedForComparison.length} из 5
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={compareSelected}
                        disabled={selectedForComparison.length < 2}
                        className="bg-black text-yellow-600 hover:bg-gray-800"
                      >
                        <GitCompare size={16} className="mr-1" />
                        Сравнить
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={clearComparison}
                        className="border-black text-black hover:bg-black hover:text-yellow-600"
                      >
                        Очистить
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cars.map((car) => (
                    <Card key={car.id} className="premium-car-card p-0 overflow-hidden group">
                      {/* Car Image */}
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={car.images[0] || '/api/placeholder/400/300'}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {car.is_premium && (
                          <Badge className="absolute top-4 left-4 bg-gold text-black font-semibold">
                            <i className="fas fa-crown mr-1"></i>
                            ПРЕМИУМ
                          </Badge>
                        )}

                        <Badge className="absolute top-4 right-4 bg-black/60 text-white border border-gray-600">
                          {car.year}
                        </Badge>

                        {/* Comparison checkbox */}
                        <div className="absolute bottom-4 left-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox 
                              checked={selectedForComparison.includes(car.id)}
                              onCheckedChange={() => toggleComparison(car.id)}
                              className="bg-white/20 border-white"
                            />
                            <span className="text-white text-sm">Сравнить</span>
                          </label>
                        </div>
                      </div>

                      {/* Car Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {car.brand} {car.model}
                          </h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gold">
                              {formatPrice(car.price, car.currency)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-400 text-sm">
                            <i className="fas fa-tachometer-alt w-4 mr-2"></i>
                            <span>{car.mileage?.toLocaleString()} км</span>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <i className="fas fa-cog w-4 mr-2"></i>
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <i className="fas fa-gas-pump w-4 mr-2"></i>
                            <span>{car.fuel_type}</span>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <i className="fas fa-map-marker-alt w-4 mr-2"></i>
                            <span>{car.location}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Link to={`/car/${car.id}`} className="flex-1">
                              <Button 
                                className="w-full btn-outline-gold text-sm"
                                onClick={() => recordCarView(car.id)}
                              >
                                <Eye size={16} className="mr-1" />
                                Подробнее
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-400 hover:text-gold"
                            >
                              <Heart size={16} />
                            </Button>
                          </div>
                          <Link 
                            to={`/services?carId=${car.id}&price=${car.price}&brand=${car.brand}&model=${car.model}`}
                            className="w-full"
                          >
                            <Button className="w-full bg-yellow-600 text-black hover:bg-yellow-700 text-sm">
                              <i className="fas fa-concierge-bell mr-2"></i>
                              Услуги
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <i className="fas fa-car text-6xl text-gray-600 mb-4"></i>
                  <h3 className="text-2xl font-bold text-white mb-2">Автомобили не найдены</h3>
                  <p className="text-gray-400 mb-6">Попробуйте изменить параметры поиска</p>
                  <Button 
                    className="btn-outline-gold"
                    onClick={() => setFilters({
                      brand: '',
                      model: '',
                      minPrice: '',
                      maxPrice: '',
                      minYear: '',
                      maxYear: '',
                      isPremium: false
                    })}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;