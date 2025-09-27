import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DealersPage = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  const mockDealers = [
    {
      id: '1',
      company_name: 'Премиум Авто Москва',
      description: 'Эксклюзивные автомобили премиум класса. Более 15 лет на рынке.',
      address: 'г. Москва, ул. Тверская, 10',
      phone: '+7 (495) 123-45-67',
      email: 'info@premium-auto.ru',
      website: 'https://premium-auto.ru',
      images: ['https://images.unsplash.com/photo-1758305447548-0f9d63c77dad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjYXIlMjBkZWFsZXJzaGlwJTIwc2hvd3Jvb218ZW58MHx8fHwxNzU4OTk3MDQxfDA&ixlib=rb-4.1.0&q=85'],
      rating: 4.9,
      reviews_count: 156,
      is_verified: true,
      working_hours: {
        'Пн-Пт': '09:00-21:00',
        'Сб-Вс': '10:00-19:00'
      }
    }
  ];

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dealers`);
      setDealers(response.data);
    } catch (error) {
      console.log('Using mock data for dealers');
      setDealers(mockDealers);
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

  return (
    <div className="pt-20 min-h-screen bg-black">
      {/* Header */}
      <section className="section-padding bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Автосалоны и <span className="gold-gradient">дилеры</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Проверенные партнеры с высоким рейтингом по всей России
            </p>
          </div>
        </div>
      </section>

      {/* Dealers Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {loading ? (
            <div className="text-center py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка дилеров...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Найдено дилеров: <span className="text-gold">{dealers.length}</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dealers.map((dealer) => (
                  <Card key={dealer.id} className="glass-card p-0 overflow-hidden group hover-glow">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={dealer.images[0] || '/api/placeholder/400/200'}
                        alt={dealer.company_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      
                      {dealer.is_verified && (
                        <Badge className="absolute top-4 right-4 bg-green-600 text-white">
                          <i className="fas fa-check-circle mr-1"></i>
                          Проверен
                        </Badge>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {dealer.company_name}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {dealer.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        {renderStars(dealer.rating)}
                        <p className="text-xs text-gray-500 mt-1">
                          {dealer.reviews_count} отзывов
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                          <i className="fas fa-map-marker-alt w-4 mr-2"></i>
                          <span className="line-clamp-1">{dealer.address}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <i className="fas fa-phone w-4 mr-2"></i>
                          <span>{dealer.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <i className="fas fa-clock w-4 mr-2"></i>
                          <span>
                            {Object.entries(dealer.working_hours)[0]?.[1] || 'Уточняйте'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link to={`/dealer/${dealer.id}`}>
                          <Button className="w-full btn-outline-gold">
                            Подробнее
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 text-gray-400 hover:text-gold text-sm"
                          >
                            <i className="fas fa-phone mr-1"></i>
                            Звонок
                          </Button>
                          {dealer.website && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="flex-1 text-gray-400 hover:text-gold text-sm"
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
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DealersPage;