import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import ReviewsSystem from '../components/ReviewsSystem';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CarDetailPage = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  // Mock car data
  const mockCar = {
    id: '1',
    brand: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2024,
    price: 8500000,
    currency: 'RUB',
    color: 'Черный',
    mileage: 0,
    images: [
      'https://images.unsplash.com/photo-1618418721668-0d1f72aa4bab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85'
    ],
    is_premium: true,
    location: 'Москва',
    engine_type: '3.0L V6 Turbo',
    transmission: 'Автомат',
    fuel_type: 'Бензин',
    description: 'Роскошный седан Mercedes-Benz S-Class 2024 года в идеальном состоянии. Автомобиль не участвовал в ДТП, проходил только плановое ТО у официального дилера.',
    features: ['Панорамная крыша', 'Кожаный салон', 'Навигация', 'Камеры 360°', 'Подогрев сидений', 'Адаптивный круиз-контроль']
  };

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/cars/${id}`);
      setCar(response.data);
    } catch (error) {
      console.log('Using mock data for car detail');
      setCar(mockCar);
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

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка автомобиля...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-car text-6xl text-gray-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Автомобиль не найден</h2>
          <p className="text-gray-400 mb-6">Возможно, он был продан или снят с продажи</p>
          <Link to="/catalog">
            <Button className="btn-gold">
              <i className="fas fa-arrow-left mr-2"></i>
              Вернуться к каталогу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-black">
      {/* Breadcrumb */}
      <section className="py-8 bg-gray-900 border-b border-gold/20">
        <div className="max-w-7xl mx-auto container-padding">
          <nav className="flex items-center space-x-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-gold transition-colors">Главная</Link>
            <i className="fas fa-chevron-right"></i>
            <Link to="/catalog" className="hover:text-gold transition-colors">Каталог</Link>
            <i className="fas fa-chevron-right"></i>
            <span className="text-white">{car.brand} {car.model}</span>
          </nav>
        </div>
      </section>

      {/* Car Details */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative mb-4 rounded-2xl overflow-hidden">
                <img
                  src={car.images[currentImage] || '/api/placeholder/600/400'}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-96 object-cover"
                />
                
                {car.is_premium && (
                  <Badge className="absolute top-4 left-4 bg-gold text-black font-semibold">
                    <i className="fas fa-crown mr-1"></i>
                    ПРЕМИУМ
                  </Badge>
                )}

                {/* Navigation arrows */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : car.images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={() => setCurrentImage(prev => prev < car.images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {car.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === index ? 'border-gold' : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${car.brand} ${car.model} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Car Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {car.brand} {car.model}
                </h1>
                <div className="text-3xl font-bold text-gold mb-4">
                  {formatPrice(car.price, car.currency)}
                </div>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span><i className="fas fa-calendar-alt mr-1"></i>{car.year} год</span>
                  <span><i className="fas fa-map-marker-alt mr-1"></i>{car.location}</span>
                </div>
              </div>

              {/* Specifications */}
              <Card className="glass-card p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Характеристики</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Пробег:</span>
                    <span className="text-white">{car.mileage?.toLocaleString()} км</span>
                  </div>
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
                    <span className="text-gray-400">Цвет:</span>
                    <span className="text-white">{car.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Год выпуска:</span>
                    <span className="text-white">{car.year}</span>
                  </div>
                </div>
              </Card>

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <Card className="glass-card p-6 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Комплектация</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <i className="fas fa-check text-gold mr-2"></i>
                        {feature}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button className="btn-gold flex-1">
                    <i className="fas fa-shopping-cart mr-2"></i>
                    Купить
                  </Button>
                  <Button className="btn-outline-gold flex-1">
                    <i className="fas fa-phone mr-2"></i>
                    Позвонить
                  </Button>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1 text-gray-400 hover:text-gold">
                    <i className="fas fa-heart mr-2"></i>
                    В избранное
                  </Button>
                  <Button variant="ghost" className="flex-1 text-gray-400 hover:text-gold">
                    <i className="fas fa-share-alt mr-2"></i>
                    Поделиться
                  </Button>
                </div>

                <Button variant="ghost" className="w-full text-gray-400 hover:text-gold">
                  <i className="fas fa-calculator mr-2"></i>
                  Рассчитать кредит
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <Card className="glass-card p-8 mt-12">
              <h3 className="text-2xl font-bold text-white mb-4">Описание</h3>
              <p className="text-gray-300 leading-relaxed">{car.description}</p>
            </Card>
          )}

          {/* Reviews Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">
              Отзывы об автомобиле
            </h3>
            <ReviewsSystem 
              targetId={car.id}
              targetType="car"
              targetName={`${car.brand} ${car.model}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarDetailPage;