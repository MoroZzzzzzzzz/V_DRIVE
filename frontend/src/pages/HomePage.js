import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeroSection from '../components/HeroSection';
import FeaturedCars from '../components/FeaturedCars';
import TopDealers from '../components/TopDealers';
import StatsSection from '../components/StatsSection';
import NewsSection from '../components/NewsSection';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <div className="text-2xl font-bold text-gold mb-2">VELES DRIVE</div>
          <div className="text-gray-400">Загрузка премиум платформы...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Возможности <span className="gold-gradient">VELES DRIVE</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Единая экосистема для автомобильного бизнеса с премиум возможностями
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="glass-card p-8 text-center hover-glow">
              <div className="text-4xl text-gold mb-4">
                <i className="fas fa-car"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Каталог автомобилей</h3>
              <p className="text-gray-400">
                От бюджетных до премиум класса. Умный поиск и фильтры для быстрого поиска.
              </p>
            </Card>

            <Card className="glass-card p-8 text-center hover-glow">
              <div className="text-4xl text-gold mb-4">
                <i className="fas fa-store"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">ERP для дилеров</h3>
              <p className="text-gray-400">
                Полноценная система управления бизнесом: склад, продажи, финансы.
              </p>
            </Card>

            <Card className="glass-card p-8 text-center hover-glow">
              <div className="text-4xl text-gold mb-4">
                <i className="fas fa-crown"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Премиум раздел</h3>
              <p className="text-gray-400">
                Эксклюзивные автомобили и особые предложения для VIP клиентов.
              </p>
            </Card>

            <Card className="glass-card p-8 text-center hover-glow">
              <div className="text-4xl text-gold mb-4">
                <i className="fab fa-telegram"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Telegram бот</h3>
              <p className="text-gray-400">
                Быстрый доступ через мобильный телефон с уведомлениями.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <FeaturedCars />

      {/* Top Dealers */}
      <TopDealers />

      {/* Stats Section */}
      <StatsSection />

      {/* Premium Section */}
      <section className="section-padding bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center">
            <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
              ПРЕМИУМ
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Эксклюзивные автомобили
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Специальный каталог для дорогих автомобилей в Москве. 
              Персональный подход и эксклюзивные предложения.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-gold text-lg px-8 py-4">
                <i className="fas fa-crown mr-2"></i>
                Смотреть премиум
              </Button>
              <Button className="btn-outline-gold text-lg px-8 py-4">
                <i className="fas fa-phone mr-2"></i>
                Связаться с консультантом
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <NewsSection />

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-t from-black to-gray-900">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Присоединяйтесь к <span className="gold-gradient">VELES DRIVE</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Начните продавать или покупать автомобили на лучшей платформе
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button className="btn-gold text-lg px-8 py-4">
                <i className="fas fa-user-plus mr-2"></i>
                Стать дилером
              </Button>
            </Link>
            <Link to="/catalog">
              <Button className="btn-outline-gold text-lg px-8 py-4">
                <i className="fas fa-search mr-2"></i>
                Найти автомобиль
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;