import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TopDealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for development
  const mockDealers = [
    {
      id: '1',
      company_name: 'Премиум Авто Москва',
      description: 'Эксклюзивные автомобили премиум класса. Более 15 лет на рынке.',
      address: 'г. Москва, ул. Тверская, 10',
      phone: '+7 (495) 123-45-67',
      email: 'info@premium-auto.ru',
      website: 'https://premium-auto.ru',
      logo_url: null,
      images: ['https://images.unsplash.com/photo-1758305447548-0f9d63c77dad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYXIlMjBkZWFsZXJzaGlwJTIwc2hvd3Jvb218ZW58MHx8fHwxNzU4OTk3MDQxfDA&ixlib=rb-4.1.0&q=85'],
      rating: 4.9,
      reviews_count: 156,
      is_verified: true,
      working_hours: {
        'Пн-Пт': '09:00-21:00',
        'Сб-Вс': '10:00-19:00'
      }
    },
    {
      id: '2',
      company_name: 'Элит Моторс СПб',
      description: 'Спортивные и люксовые автомобили. Официальный дилер ведущих брендов.',
      address: 'г. Санкт-Петербург, Невский пр., 120',
      phone: '+7 (812) 987-65-43',
      email: 'sales@elit-motors.ru',
      website: 'https://elit-motors.ru',
      logo_url: null,
      images: ['https://images.pexels.com/photos/7144209/pexels-photo-7144209.jpeg'],
      rating: 4.8,
      reviews_count: 203,
      is_verified: true,
      working_hours: {
        'Пн-Вс': '10:00-20:00'
      }
    },
    {
      id: '3',
      company_name: 'Авто Империя',
      description: 'Широкий выбор автомобилей всех классов. Выгодные условия покупки.',
      address: 'г. Екатеринбург, ул. Ленина, 45',
      phone: '+7 (343) 555-11-22',
      email: 'info@auto-imperiya.ru',
      website: 'https://auto-imperiya.ru',
      logo_url: null,
      images: ['https://images.pexels.com/photos/376674/pexels-photo-376674.jpeg'],
      rating: 4.7,
      reviews_count: 98,
      is_verified: true,
      working_hours: {
        'Пн-Пт': '09:00-20:00',
        'Сб': '10:00-18:00',
        'Вс': 'Выходной'
      }
    },
    {
      id: '4',
      company_name: 'Драйв Центр',
      description: 'Современный автосалон с полным спектром услуг и сервисом.',
      address: 'г. Казань, ул. Баумана, 78',
      phone: '+7 (843) 333-77-88',
      email: 'contact@drive-center.ru',
      website: 'https://drive-center.ru',
      logo_url: null,
      images: ['https://images.pexels.com/photos/7144182/pexels-photo-7144182.jpeg'],
      rating: 4.6,
      reviews_count: 145,
      is_verified: false,
      working_hours: {
        'Ежедневно': '10:00-21:00'
      }
    }
  ];

  useEffect(() => {
    const fetchTopDealers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/dealers?limit=4`);
        setDealers(response.data);
      } catch (error) {
        console.log('Using mock data for dealers');
        setDealers(mockDealers);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDealers();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="fas fa-star text-gold text-sm"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt text-gold text-sm"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={i} className="far fa-star text-gray-400 text-sm"></i>
        ))}
        <span className="ml-2 text-sm text-gray-400">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="section-padding bg-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка дилеров...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-black">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
            ПРОВЕРЕННЫЕ ДИЛЕРЫ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Лучшие <span className="gold-gradient">автосалоны</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Надежные партнеры с высоким рейтингом и отличным сервисом
          </p>
        </div>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {dealers.map((dealer) => (
            <Card key={dealer.id} className="glass-card p-0 overflow-hidden group hover-glow">
              {/* Dealer Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dealer.images[0] || '/api/placeholder/400/200'}
                  alt={dealer.company_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Verified badge */}
                {dealer.is_verified && (
                  <Badge className="absolute top-4 right-4 bg-green-600 text-white">
                    <i className="fas fa-check-circle mr-1"></i>
                    Проверен
                  </Badge>
                )}

                {/* Logo overlay if exists */}
                {dealer.logo_url && (
                  <div className="absolute bottom-4 left-4">
                    <img
                      src={dealer.logo_url}
                      alt="Logo"
                      className="w-12 h-12 rounded-full bg-white/90 p-2"
                    />
                  </div>
                )}
              </div>

              {/* Dealer Info */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {dealer.company_name}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {dealer.description}
                  </p>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  {renderStars(dealer.rating)}
                  <p className="text-xs text-gray-500 mt-1">
                    {dealer.reviews_count} отзывов
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-xs">
                    <i className="fas fa-map-marker-alt w-3 mr-2"></i>
                    <span className="line-clamp-1">{dealer.address}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <i className="fas fa-phone w-3 mr-2"></i>
                    <span>{dealer.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <i className="fas fa-clock w-3 mr-2"></i>
                    <span>
                      {Object.entries(dealer.working_hours)[0]?.[1] || 'Уточняйте'}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  <Link to={`/dealer/${dealer.id}`}>
                    <Button className="w-full btn-outline-gold text-sm">
                      Подробнее
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-1 text-gray-400 hover:text-gold text-xs"
                    >
                      <i className="fas fa-phone mr-1"></i>
                      Звонок
                    </Button>
                    {dealer.website && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 text-gray-400 hover:text-gold text-xs"
                        onClick={() => window.open(dealer.website, '_blank')}
                      >
                        <i className="fas fa-globe mr-1"></i>
                        Сайт
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/dealers">
            <Button className="btn-gold text-lg px-8 py-4">
              <i className="fas fa-store mr-2"></i>
              Все дилеры
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopDealers;