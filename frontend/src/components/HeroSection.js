import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1618418721668-0d1f72aa4bab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85',
      title: 'ПРЕМИУМ АВТОМОБИЛИ',
      subtitle: 'Эксклюзивная коллекция люксовых автомобилей',
      badge: 'LUXURY'
    },
    {
      image: 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85',
      title: 'СПОРТИВНЫЕ СУПЕРКАРЫ',
      subtitle: 'Мощность и стиль в одном автомобиле',
      badge: 'SPORT'
    },
    {
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBjYXJzfGVufDB8fHx8MTc1ODk5NzAwN3ww&ixlib=rb-4.1.0&q=85',
      title: 'БИЗНЕС КЛАСС',
      subtitle: 'Элегантность для успешных людей',
      badge: 'BUSINESS'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="max-w-3xl">
            {/* Badge */}
            <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6 animate-pulse">
              {heroSlides[currentSlide].badge}
            </Badge>

            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white text-shadow">
              <span className="block mb-2">VELES</span>
              <span className="gold-gradient">DRIVE</span>
            </h1>

            {/* Slide-specific content */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-shadow">
                {heroSlides[currentSlide].title}
              </h2>
              <p className="text-xl text-gray-200 text-shadow">
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/catalog">
                <Button className="btn-gold text-lg px-8 py-4 hover-scale">
                  <i className="fas fa-search mr-2"></i>
                  Смотреть каталог
                </Button>
              </Link>
              <Link to="/dealers">
                <Button className="btn-outline-gold text-lg px-8 py-4 hover-scale">
                  <i className="fas fa-store mr-2"></i>
                  Найти дилера
                </Button>
              </Link>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div className="glass-card p-4 text-center">
                <i className="fas fa-car text-gold text-2xl mb-2"></i>
                <div className="text-white font-semibold">1000+</div>
                <div className="text-gray-400 text-sm">Автомобилей</div>
              </div>
              <div className="glass-card p-4 text-center">
                <i className="fas fa-store text-gold text-2xl mb-2"></i>
                <div className="text-white font-semibold">50+</div>
                <div className="text-gray-400 text-sm">Дилеров</div>
              </div>
              <div className="glass-card p-4 text-center">
                <i className="fas fa-users text-gold text-2xl mb-2"></i>
                <div className="text-white font-semibold">5000+</div>
                <div className="text-gray-400 text-sm">Клиентов</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-gold w-8' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 z-20 animate-bounce">
        <div className="flex flex-col items-center text-white/60">
          <div className="text-sm mb-2">Прокрутить</div>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-gold/20 rounded-full flex items-center justify-center text-white hover:text-gold transition-all duration-300"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black/30 hover:bg-gold/20 rounded-full flex items-center justify-center text-white hover:text-gold transition-all duration-300"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </section>
  );
};

export default HeroSection;