import React from 'react';
import { useLocation } from 'react-router-dom';
import CarComparison from '@/components/CarComparison';

const ComparisonPage = () => {
  const location = useLocation();
  
  // Get car IDs from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const carIds = searchParams.getAll('car') || location.state?.carIds || [];

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Сравнение автомобилей
          </h1>
          <p className="text-gray-400">
            Сравните характеристики различных автомобилей
          </p>
        </div>
        
        <CarComparison initialCarIds={carIds} />
      </div>
    </div>
  );
};

export default ComparisonPage;