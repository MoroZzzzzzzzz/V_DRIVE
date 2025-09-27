import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Star, 
  Eye, 
  Heart,
  TrendingUp,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AIRecommendations = ({ className = "" }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token } = useContext(AuthContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendUrl}/api/ai/recommendations?limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecommendations(response.data);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      setError('Не удалось загрузить рекомендации');
    } finally {
      setLoading(false);
    }
  };

  const recordCarView = async (carId) => {
    if (!user || !token) return;
    
    try {
      await axios.post(`${backendUrl}/api/cars/${carId}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error recording car view:', error);
    }
  };

  if (!user) {
    return (
      <Card className={`bg-gray-900 border-gray-700 ${className}`}>
        <CardContent className="text-center py-8">
          <Sparkles className="mx-auto mb-4 text-yellow-600" size={48} />
          <p className="text-gray-400">Войдите в систему для персональных AI-рекомендаций</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`bg-gray-900 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="text-yellow-600" size={20} />
            AI Рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="h-48 bg-gray-800 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-gray-900 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="text-yellow-600" size={20} />
            AI Рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={loadRecommendations}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw size={16} className="mr-2" />
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="text-yellow-600" size={20} />
            AI Рекомендации для вас
          </CardTitle>
          <Button 
            size="sm"
            onClick={loadRecommendations}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          Персональные рекомендации на основе ваших предпочтений и поведения
        </p>
      </CardHeader>
      
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Target className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-400">Нет доступных рекомендаций</p>
            <p className="text-gray-500 text-sm mt-2">
              Просматривайте автомобили, чтобы получить персональные рекомендации
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((car, index) => (
              <div key={car.id} className="group relative">
                <Card className="bg-gray-800 border-gray-700 hover:border-yellow-600/50 transition-all duration-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={car.images?.[0] || '/api/placeholder/400/300'} 
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* AI Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-black font-semibold">
                        <Zap size={12} className="mr-1" />
                        AI Match {Math.round((car.ai_match_score || 0.8) * 100)}%
                      </Badge>
                    </div>

                    {/* Premium Badge */}
                    {car.is_premium && (
                      <Badge className="absolute top-2 right-2 bg-black/60 text-yellow-600 border border-yellow-600">
                        <Star size={12} className="mr-1" />
                        Premium
                      </Badge>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="p-2">
                        <Heart size={16} />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {car.year} • {car.mileage?.toLocaleString() || 0} км
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-yellow-600 font-bold text-xl">
                          {car.price?.toLocaleString()} ₽
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {car.fuel_type || 'Не указан'}
                        </Badge>
                      </div>

                      {/* AI Reasons */}
                      {car.ai_reasons && car.ai_reasons.length > 0 && (
                        <div className="space-y-2">
                          <Separator className="bg-gray-700" />
                          <div>
                            <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                              <TrendingUp size={12} />
                              Почему рекомендуем:
                            </p>
                            <div className="space-y-1">
                              {car.ai_reasons.slice(0, 2).map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-gray-300 text-xs">{reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link 
                          to={`/car/${car.id}`} 
                          className="flex-1"
                          onClick={() => recordCarView(car.id)}
                        >
                          <Button className="w-full bg-yellow-600 text-black hover:bg-yellow-700 text-sm">
                            <Eye size={16} className="mr-2" />
                            Подробнее
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/catalog">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Посмотреть все автомобили
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;