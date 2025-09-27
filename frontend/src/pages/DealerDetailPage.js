import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DealerDetailPage = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock dealer data
  const mockDealer = {
    id: '1',
    company_name: 'Премиум Авто Москва',
    description: 'Эксклюзивные автомобили премиум класса. Более 15 лет на рынке. Официальный дилер Mercedes-Benz, BMW, Audi в Москве. Предлагаем широкий выбор новых и подержанных автомобилей премиум-сегмента.',
    address: 'г. Москва, ул. Тверская, 10',
    phone: '+7 (495) 123-45-67',
    email: 'info@premium-auto.ru',
    website: 'https://premium-auto.ru',
    images: [
      'https://images.unsplash.com/photo-1758305447548-0f9d63c77dad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYXIlMjBkZWFsZXJzaGlwJTIwc2hvd3Jvb218ZW58MHx8fHwxNzU4OTk3MDQxfDA&ixlib=rb-4.1.0&q=85',
      'https://images.pexels.com/photos/7144209/pexels-photo-7144209.jpeg'
    ],
    rating: 4.9,
    reviews_count: 156,
    is_verified: true,
    working_hours: {
      'Понедельник': '09:00-21:00',
      'Вторник': '09:00-21:00',
      'Среда': '09:00-21:00',
      'Четверг': '09:00-21:00',
      'Пятница': '09:00-21:00',
      'Суббота': '10:00-19:00',
      'Воскресенье': '10:00-19:00'
    }
  };

  useEffect(() => {
    loadDealer();
  }, [id]);

  const loadDealer = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/dealers/${id}`);
      setDealer(response.data);
    } catch (error) {
      console.log('Using mock data for dealer detail');
      setDealer(mockDealer);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="fas fa-star text-gold text-lg"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt text-gold text-lg"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={i} className="far fa-star text-gray-400 text-lg"></i>
        ))}
        <span className="ml-3 text-lg text-white font-semibold">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка информации о дилере...</p>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-store text-6xl text-gray-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-2">Дилер не найден</h2>
          <p className="text-gray-400 mb-6">Возможно, информация была удалена</p>
          <Link to="/dealers">
            <Button className="btn-gold">
              <i className="fas fa-arrow-left mr-2"></i>
              Все дилеры
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
            <Link to="/dealers" className="hover:text-gold transition-colors">Дилеры</Link>
            <i className="fas fa-chevron-right"></i>
            <span className="text-white">{dealer.company_name}</span>
          </nav>
        </div>
      </section>

      {/* Dealer Header */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative rounded-2xl overflow-hidden mb-4">
                <img
                  src={dealer.images[0] || '/api/placeholder/600/400'}
                  alt={dealer.company_name}
                  className="w-full h-96 object-cover"
                />
                
                {dealer.is_verified && (
                  <Badge className="absolute top-4 left-4 bg-green-600 text-white font-semibold">
                    <i className="fas fa-shield-check mr-1"></i>
                    Проверенный дилер
                  </Badge>
                )}
              </div>

              {dealer.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {dealer.images.slice(1).map((image, index) => (
                    <div key={index} className="h-24 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${dealer.company_name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dealer Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {dealer.company_name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(dealer.rating)}
                  <span className="ml-4 text-gray-400">
                    ({dealer.reviews_count} отзывов)
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <Card className="glass-card p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Контакты</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <i className="fas fa-map-marker-alt w-5 mr-3 text-gold"></i>
                    <span>{dealer.address}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <i className="fas fa-phone w-5 mr-3 text-gold"></i>
                    <a href={`tel:${dealer.phone}`} className="hover:text-gold transition-colors">
                      {dealer.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <i className="fas fa-envelope w-5 mr-3 text-gold"></i>
                    <a href={`mailto:${dealer.email}`} className="hover:text-gold transition-colors">
                      {dealer.email}
                    </a>
                  </div>
                  {dealer.website && (
                    <div className="flex items-center text-gray-300">
                      <i className="fas fa-globe w-5 mr-3 text-gold"></i>
                      <a 
                        href={dealer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-gold transition-colors"
                      >
                        Посетить сайт
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Working Hours */}
              <Card className="glass-card p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Режим работы</h3>
                <div className="space-y-2">
                  {Object.entries(dealer.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-400">{day}:</span>
                      <span className="text-white">{hours}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button className="btn-gold flex-1">
                    <i className="fas fa-phone mr-2"></i>
                    Позвонить
                  </Button>
                  <Button className="btn-outline-gold flex-1">
                    <i className="fas fa-envelope mr-2"></i>
                    Написать
                  </Button>
                </div>
                
                <Button variant="ghost" className="w-full text-gray-400 hover:text-gold">
                  <i className="fas fa-map-marked-alt mr-2"></i>
                  Построить маршрут
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          {dealer.description && (
            <Card className="glass-card p-8 mt-12">
              <h3 className="text-2xl font-bold text-white mb-4">О дилере</h3>
              <p className="text-gray-300 leading-relaxed">{dealer.description}</p>
            </Card>
          )}

          {/* Cars from this dealer */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">
                Автомобили от <span className="text-gold">{dealer.company_name}</span>
              </h3>
              <Button className="btn-outline-gold">
                Все автомобили
              </Button>
            </div>
            
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-car text-4xl mb-4"></i>
              <p>Загрузка автомобилей от дилера...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealerDetailPage;