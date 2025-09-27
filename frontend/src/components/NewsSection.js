import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NewsSection = () => {
  const news = [
    {
      id: '1',
      title: 'Новые модели BMW 2024 года уже в каталоге',
      excerpt: 'Добавлены последние модели BMW с инновационными технологиями и обновленным дизайном.',
      date: '2024-01-15',
      category: 'Новинки',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxibXclMjBjYXJ8ZW58MHx8fHwxNzU4OTk3MzAwfDA&ixlib=rb-4.1.0&q=85',
      readTime: '3 мин'
    },
    {
      id: '2',
      title: 'Электромобили: тенденции 2024',
      excerpt: 'Анализ рынка электромобилей и прогнозы развития на ближайшие годы.',
      date: '2024-01-12',
      category: 'Аналитика',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?crop=entropy&cs=srgb&fm=jpg&ixid=M3w2MzIyNzV8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhcnxlbnwwfHx8fDE3NTg5OTczMTV8MA&ixlib=rb-4.1.0&q=85',
      readTime: '5 мин'
    },
    {
      id: '3',
      title: 'Открытие нового салона в Санкт-Петербурге',
      excerpt: 'Премиум автосалон "Элит Моторс" расширяет географию присутствия.',
      date: '2024-01-10',
      category: 'Новости',
      image: 'https://images.pexels.com/photos/7144209/pexels-photo-7144209.jpeg',
      readTime: '2 мин'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Новинки': return 'bg-gold text-black';
      case 'Аналитика': return 'bg-blue-600 text-white';
      case 'Новости': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <section className="section-padding bg-black">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gold text-black text-sm font-semibold px-4 py-2 mb-6">
            НОВОСТИ И СОБЫТИЯ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Последние <span className="gold-gradient">новости</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Будьте в курсе последних событий автомобильного мира и новостей платформы
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {news.map((article) => (
            <Card key={article.id} className="glass-card p-0 overflow-hidden group hover-glow">
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Category badge */}
                <Badge className={`absolute top-4 left-4 ${getCategoryColor(article.category)}`}>
                  {article.category}
                </Badge>

                {/* Read time */}
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  <i className="fas fa-clock mr-1"></i>
                  {article.readTime}
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                {/* Date */}
                <div className="text-sm text-gray-400 mb-3">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  {formatDate(article.date)}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {article.excerpt}
                </p>

                {/* Read more */}
                <Button 
                  variant="ghost" 
                  className="text-gold hover:text-white p-0 h-auto font-medium"
                >
                  Читать далее
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* View All News Button */}
        <div className="text-center">
          <Button className="btn-outline-gold text-lg px-8 py-4">
            <i className="fas fa-newspaper mr-2"></i>
            Все новости
          </Button>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16">
          <div className="glass-card p-8 text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-3">
                Подпишитесь на новости
              </h3>
              <p className="text-gray-400">
                Получайте уведомления о новых автомобилях и специальных предложениях
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Ваш email"
                className="form-input flex-1"
              />
              <Button className="btn-gold">
                <i className="fas fa-envelope mr-2"></i>
                Подписаться
              </Button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Нажимая "Подписаться", вы соглашаетесь с условиями использования
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;