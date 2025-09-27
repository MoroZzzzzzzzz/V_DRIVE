import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ReviewsSystem = ({ targetId, targetType, targetName }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    anonymous: false
  });

  // Mock reviews data
  const mockReviews = [
    {
      id: '1',
      user_name: 'Алексей Иванов',
      user_avatar: null,
      rating: 5,
      comment: 'Отличный сервис! Быстро помогли найти нужный автомобиль. Менеджеры профессиональные, все объяснили подробно.',
      created_at: '2024-01-15T10:30:00Z',
      likes: 12,
      dislikes: 1,
      verified_purchase: true
    },
    {
      id: '2',
      user_name: 'Мария Петрова',
      user_avatar: null,
      rating: 4,
      comment: 'Хорошая платформа, много автомобилей на выбор. Единственный минус - иногда долго отвечают на сообщения.',
      created_at: '2024-01-12T14:20:00Z',
      likes: 8,
      dislikes: 0,
      verified_purchase: false
    },
    {
      id: '3',
      user_name: 'Сергей К.',
      user_avatar: null,
      rating: 5,
      comment: 'Купил BMW X5 через эту платформу. Все прошло идеально, от поиска до оформления документов. Рекомендую!',
      created_at: '2024-01-10T16:45:00Z',
      likes: 15,
      dislikes: 0,
      verified_purchase: true
    },
    {
      id: '4',
      user_name: 'Анна Смирнова',
      user_avatar: null,
      rating: 3,
      comment: 'Неплохо, но есть куда расти. Хотелось бы больше фильтров для поиска и лучшую мобильную версию.',
      created_at: '2024-01-08T11:15:00Z',
      likes: 5,
      dislikes: 2,
      verified_purchase: false
    }
  ];

  useEffect(() => {
    loadReviews();
  }, [targetId, targetType]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Mock loading reviews
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Войдите в систему, чтобы оставить отзыв');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Пожалуйста, напишите отзыв');
      return;
    }

    try {
      const newReview = {
        id: Date.now().toString(),
        user_name: reviewForm.anonymous ? 'Анонимный пользователь' : user.full_name,
        user_avatar: null,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        created_at: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        verified_purchase: user.role === 'buyer' // Mock logic
      };

      setReviews(prev => [newReview, ...prev]);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', anonymous: false });
      toast.success('Отзыв добавлен');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Ошибка при отправке отзыва');
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    if (!isAuthenticated) {
      toast.error('Войдите в систему');
      return;
    }

    try {
      setReviews(prev => prev.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            likes: action === 'like' ? review.likes + 1 : review.likes,
            dislikes: action === 'dislike' ? review.dislikes + 1 : review.dislikes
          };
        }
        return review;
      }));

      toast.success(action === 'like' ? 'Лайк добавлен' : 'Дизлайк добавлен');
    } catch (error) {
      console.error('Error handling review action:', error);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`text-lg ${
              star <= rating ? 'text-gold' : 'text-gray-400'
            } ${interactive ? 'hover:text-gold cursor-pointer' : ''}`}
          >
            <i className="fas fa-star"></i>
          </button>
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner mr-4"></div>
          <span className="text-gray-400">Загрузка отзывов...</span>
        </div>
      </Card>
    );
  }

  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="glass-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
              <div className="text-4xl font-bold text-gold">{averageRating}</div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-gray-400 text-sm mt-1">
                  Основано на {reviews.length} отзывах
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowReviewForm(true)}
              className="btn-gold"
              disabled={!isAuthenticated}
            >
              <i className="fas fa-star mr-2"></i>
              Оставить отзыв
            </Button>
            
            {!isAuthenticated && (
              <p className="text-gray-500 text-sm mt-2">
                Войдите в систему, чтобы оставить отзыв
              </p>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-8">{stars}</span>
                <i className="fas fa-star text-gold text-sm"></i>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDistribution[stars] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">
                  {ratingDistribution[stars]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Написать отзыв</h3>
            <Button
              variant="ghost"
              onClick={() => setShowReviewForm(false)}
              className="text-gray-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Ваша оценка
              </label>
              {renderStars(reviewForm.rating, true, (rating) => 
                setReviewForm(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ваш отзыв
              </label>
              <textarea
                rows={4}
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                className="form-input w-full"
                placeholder="Поделитесь своим мнением..."
              />
              <p className="text-gray-500 text-xs mt-1">
                Минимум 10 символов, максимум 500
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={reviewForm.anonymous}
                onChange={(e) => setReviewForm(prev => ({ ...prev, anonymous: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="anonymous" className="text-gray-300 text-sm">
                Оставить отзыв анонимно
              </label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="btn-gold">
                <i className="fas fa-paper-plane mr-2"></i>
                Отправить отзыв
              </Button>
              <Button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn-outline-gold"
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                    {review.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-semibold">{review.user_name}</h4>
                      {review.verified_purchase && (
                        <Badge className="bg-green-600 text-white text-xs">
                          <i className="fas fa-check-circle mr-1"></i>
                          Проверенная покупка
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-gray-400 text-sm">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">
                {review.comment}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleReviewAction(review.id, 'like')}
                    className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <i className="fas fa-thumbs-up"></i>
                    <span>{review.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleReviewAction(review.id, 'dislike')}
                    className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <i className="fas fa-thumbs-down"></i>
                    <span>{review.dislikes}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <i className="fas fa-reply mr-1"></i>
                    Ответить
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400"
                  >
                    <i className="fas fa-flag mr-1"></i>
                    Пожаловаться
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="glass-card p-12 text-center">
            <i className="fas fa-star text-6xl text-gray-600 mb-4"></i>
            <h3 className="text-2xl font-bold text-white mb-2">Пока нет отзывов</h3>
            <p className="text-gray-400 mb-6">
              Станьте первым, кто оставит отзыв о {targetName}
            </p>
            {isAuthenticated ? (
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="btn-gold"
              >
                <i className="fas fa-star mr-2"></i>
                Оставить первый отзыв
              </Button>
            ) : (
              <p className="text-gray-500">
                Войдите в систему, чтобы оставить отзыв
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Load More Button */}
      {reviews.length > 0 && (
        <div className="text-center">
          <Button className="btn-outline-gold">
            <i className="fas fa-chevron-down mr-2"></i>
            Показать еще отзывы
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSystem;