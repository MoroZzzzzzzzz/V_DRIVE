import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CarDetailPage from './pages/CarDetailPage';
import DealersPage from './pages/DealersPage';
import DealerDetailPage from './pages/DealerDetailPage';
import ERPDashboard from './pages/ERPDashboard';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import PremiumCatalog from './pages/PremiumCatalog';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider } from './components/NotificationSystem';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <div className="App min-h-screen bg-black text-white">
          <BrowserRouter>
            <Header />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/premium" element={<PremiumCatalog />} />
                <Route path="/car/:id" element={<CarDetailPage />} />
                <Route path="/dealers" element={<DealersPage />} />
                <Route path="/dealer/:id" element={<DealerDetailPage />} />
                <Route path="/erp" element={<ERPDashboard />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
          <Toaster />
        </div>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;