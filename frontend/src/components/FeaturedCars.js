import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FeaturedCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

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
      brand: 'Lamborghini',
      model: 'Huracán',
      year: 2023,
      price: 25000000,
      currency: 'RUB',
      color: 'Оранжевый',
      mileage: 1200,
      images: ['https://images.unsplash.com/photo-1519245659620-e859806a8d3b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '5.2L V10',
      transmission: 'Робот',
      fuel_type: 'Бензин'
    },
    {
      id: '3',
      brand: 'BMW',
      model: 'M4',
      year: 2024,
      price: 7200000,
      currency: 'RUB',
      color: 'Серый',
      mileage: 500,
      images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Санкт-Петербург',
      engine_type: '3.0L I6 Twin-Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин'
    },
    {
      id: '4',
      brand: 'Porsche',
      model: '911 Turbo S',
      year: 2023,
      price: 18500000,
      currency: 'RUB',
      color: 'Черный',
      mileage: 800,
      images: ['https://images.unsplash.com/photo-1613575192938-832cf142755a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxwcmVtaXVtJTIwY2Fyc3xlbnwwfHx8fDE3NTg5OTcwMTJ8MA&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: '3.8L H6 Twin-Turbo',
      transmission: 'Робот',
      fuel_type: 'Бензин'
    },
    {
      id: '5',
      brand: 'Audi',
      model: 'RS6 Avant',
      year: 2024,
      price: 9800000,
      currency: 'RUB',
      color: 'Серебристый',
      mileage: 200,
      images: ['https://images.unsplash.com/photo-1745421977200-77ced89731c3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwY2Fyc3xlbnwwfHx8fDE3NTg5OTcwMTJ8MA&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Екатеринбург',
      engine_type: '4.0L V8 Twin-Turbo',
      transmission: 'Автомат',
      fuel_type: 'Бензин'
    },
    {
      id: '6',
      brand: 'Tesla',
      model: 'Model S Plaid',
      year: 2024,
      price: 12000000,
      currency: 'RUB',
      color: 'Белый',
      mileage: 100,
      images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHx0ZXNsYSUyMG1vZGVsJTIwc3xlbnwwfHx8fDE3NTg5OTcyMDB8MA&ixlib=rb-4.1.0&q=85'],
      is_premium: true,
      location: 'Москва',
      engine_type: 'Electric',
      transmission: 'Автомат',
      fuel_type: 'Электро'
    }
  ];

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/cars?is_premium=true&limit=6`);
        setCars(response.data);
      } catch (error) {
        console.log('Using mock data for featured cars');
        setCars(mockCars);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const formatPrice = (price, currency = 'RUB') => {
    if (currency === 'RUB') {
      return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency;
  };

  if (loading) {
    return (
      <section className="section-padding bg-gray-900">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка автомобилей...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gray-900">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
            РЕКОМЕНДУЕМЫЕ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Популярные <span className="gold-gradient">автомобили</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Самые востребованные модели от проверенных дилеров
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
                
                {/* Premium badge */}
                {car.is_premium && (
                  <Badge className="absolute top-4 left-4 bg-gold text-black font-semibold">
                    <i className="fas fa-crown mr-1"></i>
                    ПРЕМИУМ
                  </Badge>
                )}

                {/* Year badge */}
                <Badge className="absolute top-4 right-4 bg-black/60 text-white border border-gray-600">
                  {car.year}
                </Badge>

                {/* Quick actions */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link to={`/car/${car.id}`}>
                    <Button className="btn-gold">
                      <i className="fas fa-eye mr-2"></i>
                      Подробнее
                    </Button>
                  </Link>
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

                {/* Car specs */}
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

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Link to={`/car/${car.id}`} className="flex-1">
                    <Button className="w-full btn-outline-gold text-sm">
                      Подробнее
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-gold"
                    data-testid={`favorite-btn-${car.id}`}
                  >
                    <i className="fas fa-heart"></i>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/catalog">
            <Button className="btn-gold text-lg px-8 py-4">
              <i className="fas fa-th-large mr-2"></i>
              Смотреть весь каталог
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;