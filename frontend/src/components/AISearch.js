import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Sparkles, 
  Mic,
  MicOff,
  Loader2,
  Zap,
  Eye,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AISearch = ({ onResults, className = "" }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleAISearch = async () => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      
      const formData = new FormData();
      formData.append('query', query);

      const response = await axios.post(`${backendUrl}/api/ai/search`, formData);
      
      setSearchResults(response.data);
      
      if (onResults) {
        onResults(response.data);
      }
      
    } catch (error) {
      console.error('AI search error:', error);
      setSearchResults({
        query,
        results: [],
        total_found: 0,
        search_type: 'error',
        error: 'Ошибка поиска. Попробуйте еще раз.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAISearch();
    }
  };

  // Voice search (if supported)
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Голосовой поиск не поддерживается в вашем браузере');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        
        // Automatically search after voice input
        setTimeout(() => {
          handleAISearch();
        }, 500);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const suggestedQueries = [
    "Семейный автомобиль до 2 миллионов рублей",
    "Спортивная машина красного цвета",
    "Экономичный автомобиль для города",
    "Премиум внедорожник с полным приводом",
    "Электромобиль или гибрид"
  ];

  return (
    <div className={className}>
      {/* Search Input */}
      <Card className="bg-gray-900 border-gray-700 mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-yellow-600" size={20} />
              <h3 className="text-white font-semibold">AI Поиск автомобилей</h3>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Опишите какой автомобиль вы ищете... (например: 'Нужен семейный автомобиль до 2 млн')"
                  className="bg-gray-800 border-gray-600 text-white pr-12"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleVoiceSearch}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 ${
                    isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
              </div>
              
              <Button 
                onClick={handleAISearch}
                disabled={!query.trim() || isSearching}
                className="bg-yellow-600 text-black hover:bg-yellow-700 px-6"
              >
                {isSearching ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Zap size={16} className="mr-2" />
                    AI Поиск
                  </>
                )}
              </Button>
            </div>

            {/* Suggested Queries */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Примеры запросов:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((suggestion, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() => setQuery(suggestion)}
                    className="text-xs bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="text-yellow-600" size={20} />
                <h3 className="text-white font-semibold">Результаты поиска</h3>
                <Badge variant="secondary">
                  {searchResults.total_found} найдено
                </Badge>
              </div>
              
              <Badge className={`${
                searchResults.search_type === 'ai_natural_language' 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {searchResults.search_type === 'ai_natural_language' ? 'AI Поиск' : 'Текстовый поиск'}
              </Badge>
            </div>

            {searchResults.error ? (
              <div className="text-center py-8">
                <p className="text-red-400">{searchResults.error}</p>
              </div>
            ) : searchResults.results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Автомобили не найдены</p>
                <p className="text-gray-500 text-sm mt-2">
                  Попробуйте изменить запрос или использовать другие ключевые слова
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.results.map((car) => (
                  <Card key={car.id} className="bg-gray-800 border-gray-700 hover:border-yellow-600/50 transition-colors group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={car.images?.[0] || '/api/placeholder/400/300'} 
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {car.is_premium && (
                        <Badge className="absolute top-2 right-2 bg-yellow-600 text-black">
                          Premium
                        </Badge>
                      )}
                      
                      <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="p-2">
                          <Heart size={16} />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-white">
                            {car.brand} {car.model}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {car.year} • {car.mileage?.toLocaleString() || 0} км
                          </p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-yellow-600 font-bold">
                            {car.price?.toLocaleString()} ₽
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {car.fuel_type || 'Не указан'}
                          </Badge>
                        </div>

                        <Link to={`/car/${car.id}`} className="block">
                          <Button className="w-full bg-yellow-600 text-black hover:bg-yellow-700 text-sm">
                            <Eye size={16} className="mr-2" />
                            Подробнее
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {searchResults.results.length > 0 && (
              <div className="text-center mt-6">
                <Link to={`/catalog?search=${encodeURIComponent(query)}`}>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Смотреть все результаты в каталоге
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISearch;