import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Car, Fuel, Calendar, Palette, Settings, Gauge } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import axios from 'axios';

const CarComparison = ({ initialCarIds = [] }) => {
  const [comparisons, setComparisons] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [comparisonCars, setComparisonCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useContext(AuthContext);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user) {
      fetchComparisons();
    }
  }, [user]);

  useEffect(() => {
    if (initialCarIds.length > 0) {
      createComparison(initialCarIds);
    }
  }, [initialCarIds]);

  const fetchComparisons = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/comparisons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComparisons(response.data);
    } catch (error) {
      console.error('Error fetching comparisons:', error);
    }
  };

  const createComparison = async (carIds, name = null) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      carIds.forEach(id => formData.append('car_ids', id));
      if (name) formData.append('name', name);

      const response = await axios.post(`${backendUrl}/api/comparisons`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchComparisons();
      setSelectedComparison(response.data.id);
      await fetchComparisonCars(response.data.id);
    } catch (error) {
      console.error('Error creating comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonCars = async (comparisonId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/comparisons/${comparisonId}/cars`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComparisonCars(response.data);
    } catch (error) {
      console.error('Error fetching comparison cars:', error);
    }
  };

  const deleteComparison = async (comparisonId) => {
    try {
      await axios.delete(`${backendUrl}/api/comparisons/${comparisonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchComparisons();
      if (selectedComparison === comparisonId) {
        setSelectedComparison(null);
        setComparisonCars([]);
      }
    } catch (error) {
      console.error('Error deleting comparison:', error);
    }
  };

  const selectComparison = async (comparisonId) => {
    setSelectedComparison(comparisonId);
    await fetchComparisonCars(comparisonId);
  };

  const ComparisonTable = ({ cars }) => {
    if (cars.length === 0) return null;

    const comparisonFields = [
      { key: 'brand', label: 'Бренд', icon: Car },
      { key: 'model', label: 'Модель', icon: Car },
      { key: 'year', label: 'Год', icon: Calendar },
      { key: 'price', label: 'Цена', icon: null, format: (value) => `${value?.toLocaleString()} ₽` },
      { key: 'mileage', label: 'Пробег', icon: Gauge, format: (value) => value ? `${value.toLocaleString()} км` : 'Н/Д' },
      { key: 'fuel_type', label: 'Топливо', icon: Fuel },
      { key: 'transmission', label: 'КПП', icon: Settings },
      { key: 'color', label: 'Цвет', icon: Palette }
    ];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-300">Характеристика</th>
              {cars.map((car, index) => (
                <th key={car.id} className="text-center p-4 min-w-[200px]">
                  <div className="space-y-2">
                    <img 
                      src={car.images?.[0] || '/api/placeholder/200/150'} 
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="text-white font-semibold">
                      {car.brand} {car.model}
                    </div>
                    <Badge variant={car.is_premium ? "default" : "secondary"}>
                      {car.is_premium ? 'Premium' : 'Standard'}
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field) => (
              <tr key={field.key} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4 font-medium text-gray-300 flex items-center gap-2">
                  {field.icon && <field.icon size={16} />}
                  {field.label}
                </td>
                {cars.map((car) => (
                  <td key={`${car.id}-${field.key}`} className="p-4 text-center text-white">
                    {field.format 
                      ? field.format(car[field.key]) 
                      : car[field.key] || 'Н/Д'
                    }
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Features comparison */}
            <tr className="border-b border-gray-800">
              <td className="p-4 font-medium text-gray-300">Особенности</td>
              {cars.map((car) => (
                <td key={`${car.id}-features`} className="p-4">
                  <div className="space-y-1">
                    {car.features?.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {car.features?.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{car.features.length - 3} еще
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Войдите в систему для сравнения автомобилей</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparison selector */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Car size={20} />
            Мои сравнения
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comparisons.length === 0 ? (
            <p className="text-gray-400">У вас пока нет сравнений автомобилей</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisons.map((comparison) => (
                <Card 
                  key={comparison.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedComparison === comparison.id 
                      ? 'bg-yellow-600/20 border-yellow-600' 
                      : 'bg-gray-800 border-gray-700 hover:border-yellow-600/50'
                  }`}
                  onClick={() => selectComparison(comparison.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">
                          {comparison.name || `Сравнение ${comparison.id.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {comparison.car_ids.length} автомобиля
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comparison.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComparison(comparison.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison table */}
      {selectedComparison && comparisonCars.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Сравнение автомобилей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComparisonTable cars={comparisonCars} />
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-400">Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default CarComparison;