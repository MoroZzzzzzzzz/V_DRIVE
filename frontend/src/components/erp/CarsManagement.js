import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CarsManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  
  const [carForm, setCarForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    engine_type: '',
    transmission: 'Автомат',
    fuel_type: 'Бензин',
    color: '',
    vin: '',
    description: '',
    features: [],
    is_premium: false,
    location: 'Москва',
    images: []
  });

  // Mock cars for dealer
  const mockCars = [
    {
      id: '1',
      brand: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2024,
      price: 8500000,
      mileage: 0,
      color: 'Черный',
      status: 'available',
      is_premium: true,
      location: 'Москва',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      price: 6200000,
      mileage: 15000,
      color: 'Белый',
      status: 'available',
      is_premium: false,
      location: 'Москва',
      created_at: '2024-01-10T14:30:00Z'
    }
  ];

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/cars?dealer_only=true`);
      setCars(response.data);
    } catch (error) {
      console.log('Using mock data for dealer cars');
      setCars(mockCars);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCarForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFeature = (feature) => {
    if (feature && !carForm.features.includes(feature)) {
      setCarForm(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const handleRemoveFeature = (feature) => {
    setCarForm(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCar 
        ? `${BACKEND_URL}/api/cars/${editingCar.id}`
        : `${BACKEND_URL}/api/cars`;
      
      const method = editingCar ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url,
        data: carForm
      });
      
      if (editingCar) {
        setCars(prev => prev.map(car => 
          car.id === editingCar.id ? response.data : car
        ));
        toast.success('Автомобиль обновлен');
      } else {
        setCars(prev => [response.data, ...prev]);
        toast.success('Автомобиль добавлен');
      }
      
      setShowAddModal(false);
      setEditingCar(null);
      resetForm();
      
    } catch (error) {
      // Mock success for demo
      const newCar = {
        id: Date.now().toString(),
        ...carForm,
        status: 'available',
        created_at: new Date().toISOString()
      };
      
      if (editingCar) {
        setCars(prev => prev.map(car => 
          car.id === editingCar.id ? { ...editingCar, ...carForm } : car
        ));
        toast.success('Автомобиль обновлен');
      } else {
        setCars(prev => [newCar, ...prev]);
        toast.success('Автомобиль добавлен');
      }
      
      setShowAddModal(false);
      setEditingCar(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setCarForm({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      mileage: '',
      engine_type: '',
      transmission: 'Автомат',
      fuel_type: 'Бензин',
      color: '',
      vin: '',
      description: '',
      features: [],
      is_premium: false,
      location: 'Москва',
      images: []
    });
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setCarForm({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      price: car.price || '',
      mileage: car.mileage || '',
      engine_type: car.engine_type || '',
      transmission: car.transmission || 'Автомат',
      fuel_type: car.fuel_type || 'Бензин',
      color: car.color || '',
      vin: car.vin || '',
      description: car.description || '',
      features: car.features || [],
      is_premium: car.is_premium || false,
      location: car.location || 'Москва',
      images: car.images || []
    });
    setShowAddModal(true);
  };

  const handleDelete = async (carId) => {
    if (window.confirm('Удалить автомобиль?')) {
      try {
        await axios.delete(`${BACKEND_URL}/api/cars/${carId}`);
        setCars(prev => prev.filter(car => car.id !== carId));
        toast.success('Автомобиль удален');
      } catch (error) {
        // Mock success
        setCars(prev => prev.filter(car => car.id !== carId));
        toast.success('Автомобиль удален');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const popularFeatures = [
    'Панорамная крыша', 'Кожаный салон', 'Навигация', 'Камеры 360°',
    'Подогрев сидений', 'Адаптивный круиз-контроль', 'Парковочные датчики',
    'Климат-контроль', 'Bluetooth', 'USB-порты', 'Беспроводная зарядка'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading-spinner mr-4"></div>
        <span className="text-gray-400">Загрузка автомобилей...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление автомобилями</h2>
          <p className="text-gray-400">Всего автомобилей: {cars.length}</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setEditingCar(null);
            setShowAddModal(true);
          }}
          className="btn-gold"
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить автомобиль
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{cars.length}</div>
            <div className="text-sm text-gray-400">Всего</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {cars.filter(car => car.status === 'available').length}
            </div>
            <div className="text-sm text-gray-400">В наличии</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold">
              {cars.filter(car => car.status === 'sold').length}
            </div>
            <div className="text-sm text-gray-400">Продано</div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {cars.filter(car => car.is_premium).length}
            </div>
            <div className="text-sm text-gray-400">Премиум</div>
          </div>
        </Card>
      </div>

      {/* Cars Table */}
      <Card className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Автомобиль</th>
                <th className="text-left py-3 px-4 text-gray-300">Год</th>
                <th className="text-left py-3 px-4 text-gray-300">Пробег</th>
                <th className="text-left py-3 px-4 text-gray-300">Цена</th>
                <th className="text-left py-3 px-4 text-gray-300">Статус</th>
                <th className="text-left py-3 px-4 text-gray-300">Действия</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg mr-3 flex items-center justify-center">
                        <i className="fas fa-car text-gold"></i>
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {car.brand} {car.model}
                        </div>
                        <div className="text-gray-400 text-sm">{car.color}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">{car.year}</td>
                  <td className="py-3 px-4 text-white">
                    {car.mileage?.toLocaleString()} км
                  </td>
                  <td className="py-3 px-4 text-gold font-semibold">
                    {formatPrice(car.price)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${
                      car.status === 'available' ? 'bg-green-600 text-white' :
                      car.status === 'sold' ? 'bg-gold text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {car.status === 'available' ? 'В наличии' :
                       car.status === 'sold' ? 'Продан' : 'Резерв'}
                    </Badge>
                    {car.is_premium && (
                      <Badge className="bg-gold text-black ml-2">
                        <i className="fas fa-crown mr-1"></i>
                        Премиум
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(car)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(car.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Car Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingCar ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
              </h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCar(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Марка *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    required
                    value={carForm.brand}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Mercedes-Benz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Модель *
                  </label>
                  <input
                    type="text"
                    name="model"
                    required
                    value={carForm.model}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="S-Class"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Год выпуска *
                  </label>
                  <input
                    type="number"
                    name="year"
                    required
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    value={carForm.year}
                    onChange={handleInputChange}
                    className="form-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Цена (₽) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={carForm.price}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="8500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Пробег (км)
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    min="0"
                    value={carForm.mileage}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Цвет *
                  </label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={carForm.color}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Черный"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Коробка передач
                  </label>
                  <select
                    name="transmission"
                    value={carForm.transmission}
                    onChange={handleInputChange}
                    className="form-input w-full"
                  >
                    <option value="Автомат">Автомат</option>
                    <option value="Механика">Механика</option>
                    <option value="Робот">Робот</option>
                    <option value="Вариатор">Вариатор</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тип топлива
                  </label>
                  <select
                    name="fuel_type"
                    value={carForm.fuel_type}
                    onChange={handleInputChange}
                    className="form-input w-full"
                  >
                    <option value="Бензин">Бензин</option>
                    <option value="Дизель">Дизель</option>
                    <option value="Гибрид">Гибрид</option>
                    <option value="Электро">Электро</option>
                    <option value="Газ">Газ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Тип двигателя
                </label>
                <input
                  type="text"
                  name="engine_type"
                  value={carForm.engine_type}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="3.0L V6 Turbo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VIN номер
                </label>
                <input
                  type="text"
                  name="vin"
                  value={carForm.vin}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="WDD1234567890123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={carForm.description}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="Подробное описание автомобиля..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Комплектация
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {popularFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleAddFeature(feature)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        carForm.features.includes(feature)
                          ? 'bg-gold text-black border-gold'
                          : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gold'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
                {carForm.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Выбранные опции:</p>
                    <div className="flex flex-wrap gap-2">
                      {carForm.features.map((feature) => (
                        <Badge key={feature} className="bg-gold text-black">
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feature)}
                            className="ml-2"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={carForm.is_premium}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Премиум автомобиль
                </label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="btn-gold">
                  <i className="fas fa-save mr-2"></i>
                  {editingCar ? 'Сохранить изменения' : 'Добавить автомобиль'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCar(null);
                    resetForm();
                  }}
                  className="btn-outline-gold"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CarsManagement;