import React from 'react';
import SecuritySettings from '@/components/SecuritySettings';

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Настройки безопасности
          </h1>
          <p className="text-gray-400">
            Управление безопасностью аккаунта и защитой данных
          </p>
        </div>
        
        <SecuritySettings />
      </div>
    </div>
  );
};

export default SecurityPage;