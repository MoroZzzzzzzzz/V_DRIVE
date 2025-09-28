import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationSystem';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigationItems = [
    { path: '/', label: 'Главная', icon: 'fas fa-home' },
    { 
      label: 'Каталог', 
      icon: 'fas fa-car',
      submenu: [
        { path: '/catalog?type=car', label: '🚗 Автомобили', icon: 'fas fa-car' },
        { path: '/catalog?type=motorcycle', label: '🏍️ Мотоциклы', icon: 'fas fa-motorcycle' },
        { path: '/catalog?type=boat', label: '🛥️ Лодки', icon: 'fas fa-ship' },
        { path: '/catalog?type=plane', label: '✈️ Самолеты', icon: 'fas fa-plane' },
      ]
    },
    { path: '/premium', label: 'Премиум', icon: 'fas fa-crown' },
    { path: '/auctions', label: 'Аукционы', icon: 'fas fa-gavel' },
    { path: '/dealers', label: 'Дилеры', icon: 'fas fa-store' },
    { path: '/services', label: 'Услуги', icon: 'fas fa-concierge-bell' },
  ];

  const userNavigationItems = [
    { path: '/compare', label: 'Сравнение', icon: 'fas fa-balance-scale' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-gold/20">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover-scale">
            <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center text-black text-2xl font-bold">
              V
            </div>
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-white">VELES</div>
              <div className="text-sm text-gold font-medium -mt-1">DRIVE</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
            
            {user && userNavigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
            
            {user?.role === 'dealer' && (
              <Link
                to="/erp"
                className={`nav-link ${isActive('/erp') ? 'active' : ''}`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                ERP
                <Badge className="bg-gold text-black text-xs ml-2">PRO</Badge>
              </Link>
            )}
            
            {user?.role === 'dealer' && (
              <Link
                to="/subscription"
                className={`nav-link ${isActive('/subscription') ? 'active' : ''}`}
              >
                <i className="fas fa-crown mr-2"></i>
                Подписка
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                <i className="fas fa-shield-alt mr-2"></i>
                Админ
                <Badge className="bg-red-600 text-white text-xs ml-2">ADMIN</Badge>
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationBell />

                {/* Favorites count for buyers */}
                {user.role === 'buyer' && (
                  <Link to="/profile" className="relative">
                    <Button variant="ghost" size="sm" className="text-white hover:text-gold">
                      <i className="fas fa-heart"></i>
                    </Button>
                  </Link>
                )}

                {/* User menu */}
                <div className="relative group">
                  <Button variant="ghost" className="text-white hover:text-gold">
                    <i className="fas fa-user mr-2"></i>
                    <span className="hidden sm:inline">{user.full_name}</span>
                  </Button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gold/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-white hover:bg-gold hover:text-black rounded"
                      >
                        <i className="fas fa-user mr-2"></i>Профиль
                      </Link>
                      {user.role === 'dealer' && (
                        <Link
                          to="/erp"
                          className="block px-4 py-2 text-sm text-white hover:bg-gold hover:text-black rounded"
                        >
                          <i className="fas fa-chart-line mr-2"></i>ERP система
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 hover:text-white rounded"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>Выйти
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="ghost" className="text-white hover:text-gold hidden sm:inline-flex">
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Войти
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="btn-gold">
                    <i className="fas fa-user-plus mr-2"></i>
                    <span className="hidden sm:inline">Регистрация</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="lg:hidden text-white hover:text-gold"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gold/20 bg-black/95">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 text-white hover:text-gold hover:bg-gray-900/50 rounded ${
                    isActive(item.path) ? 'bg-gold/10 text-gold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  {item.label}
                </Link>
              ))}
              
              {user && userNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 text-white hover:text-gold hover:bg-gray-900/50 rounded ${
                    isActive(item.path) ? 'bg-gold/10 text-gold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  {item.label}
                </Link>
              ))}
              
              {user?.role === 'dealer' && (
                <Link
                  to="/erp"
                  className={`block px-4 py-3 text-white hover:text-gold hover:bg-gray-900/50 rounded ${
                    isActive('/erp') ? 'bg-gold/10 text-gold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-chart-line mr-3"></i>
                  ERP система
                  <Badge className="bg-gold text-black text-xs ml-2">PRO</Badge>
                </Link>
              )}

              {user?.role === 'dealer' && (
                <Link
                  to="/subscription"
                  className={`block px-4 py-3 text-white hover:text-gold hover:bg-gray-900/50 rounded ${
                    isActive('/subscription') ? 'bg-gold/10 text-gold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-crown mr-3"></i>
                  Подписка
                </Link>
              )}

              {!user && (
                <div className="px-4 py-3 space-y-2 border-t border-gold/20 mt-4">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-white hover:text-gold">
                      <i className="fas fa-sign-in-alt mr-3"></i>
                      Войти
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="btn-gold w-full">
                      <i className="fas fa-user-plus mr-2"></i>
                      Регистрация
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;