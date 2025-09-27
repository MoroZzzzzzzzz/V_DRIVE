import React from 'react';
import { Badge } from '@/components/ui/badge';

const StatsSection = () => {
  const stats = [
    {
      value: '1000+',
      label: 'Автомобилей в каталоге',
      icon: 'fas fa-car',
      description: 'От бюджетных до премиум класса'
    },
    {
      value: '50+',
      label: 'Проверенных дилеров',
      icon: 'fas fa-store',
      description: 'По всей России'
    },
    {
      value: '5000+',
      label: 'Довольных клиентов',
      icon: 'fas fa-users',
      description: 'Успешных сделок'
    },
    {
      value: '15',
      label: 'Лет на рынке',
      icon: 'fas fa-medal',
      description: 'Опыта и доверия'
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-r from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
            СТАТИСТИКА
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Цифры, которые говорят 
            <span className="gold-gradient block">за нас</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Наши достижения и результаты работы за годы развития платформы
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-card p-8 text-center hover-glow group"
            >
              {/* Icon */}
              <div className="text-5xl text-gold mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className={stat.icon}></i>
              </div>

              {/* Value */}
              <div className="text-4xl md:text-5xl font-bold text-white mb-3 gold-gradient">
                {stat.value}
              </div>

              {/* Label */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {stat.label}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-gold text-2xl mb-2">
                  <i className="fas fa-award"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">Лучший сервис</h4>
                <p className="text-gray-400 text-sm">
                  Награда "Лучшая автомобильная платформа 2024"
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-gold text-2xl mb-2">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">100% безопасность</h4>
                <p className="text-gray-400 text-sm">
                  Все сделки защищены и гарантированы
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-gold text-2xl mb-2">
                  <i className="fas fa-headset"></i>
                </div>
                <h4 className="text-white font-semibold mb-2">24/7 поддержка</h4>
                <p className="text-gray-400 text-sm">
                  Круглосуточная техническая поддержка
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;