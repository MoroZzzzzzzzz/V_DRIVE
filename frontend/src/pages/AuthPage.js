import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user, login, register } = useContext(AuthContext);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: 'buyer',
    company_name: ''
  });

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Login attempt:', { email: loginForm.email, password: '***' });

    try {
      const result = await login(loginForm.email, loginForm.password);
      console.log('Login result:', result);
      
      if (result.success) {
        toast.success('Успешный вход в систему!');
      } else {
        toast.error(result.error || 'Ошибка входа');
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      toast.error('Произошла ошибка при входе');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = registerForm;
      const result = await register(registerData);
      
      if (result.success) {
        toast.success('Регистрация успешна!');
      } else {
        toast.error(result.error || 'Ошибка регистрации');
      }
    } catch (error) {
      toast.error('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pt-20 min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md container-padding">
        <Card className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center text-black text-2xl font-bold">
                V
              </div>
              <div>
                <div className="text-2xl font-bold text-white">VELES</div>
                <div className="text-sm text-gold font-medium -mt-1">DRIVE</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Вход в систему' : 'Регистрация'}
            </h1>
            <p className="text-gray-400">
              {isLogin 
                ? 'Войдите в свой аккаунт для продолжения' 
                : 'Создайте аккаунт для начала работы'
              }
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex mb-8 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-gold text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-gold text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={loginForm.email}
                  onChange={handleLoginInputChange}
                  className="form-input w-full"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  className="form-input w-full"
                  placeholder="Введите пароль"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-300">
                  <input type="checkbox" className="mr-2" />
                  Запомнить меня
                </label>
                <button
                  type="button"
                  className="text-sm text-gold hover:text-yellow-400 transition-colors"
                >
                  Забыли пароль?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-gold w-full"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2 w-4 h-4 border-2"></div>
                    Вход...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Войти
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Полное имя *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={registerForm.full_name}
                    onChange={handleRegisterInputChange}
                    className="form-input w-full"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={registerForm.phone}
                    onChange={handleRegisterInputChange}
                    className="form-input w-full"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={registerForm.email}
                  onChange={handleRegisterInputChange}
                  className="form-input w-full"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={registerForm.password}
                    onChange={handleRegisterInputChange}
                    className="form-input w-full"
                    placeholder="Минимум 6 символов"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Подтвердите пароль *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterInputChange}
                    className="form-input w-full"
                    placeholder="Повторите пароль"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Тип аккаунта *
                </label>
                <select
                  name="role"
                  value={registerForm.role}
                  onChange={handleRegisterInputChange}
                  className="form-input w-full"
                >
                  <option value="buyer">Покупатель</option>
                  <option value="dealer">Дилер</option>
                </select>
              </div>

              {registerForm.role === 'dealer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название компании *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    required={registerForm.role === 'dealer'}
                    value={registerForm.company_name}
                    onChange={handleRegisterInputChange}
                    className="form-input w-full"
                    placeholder="ООО 'Автосалон'"
                  />
                </div>
              )}

              <div className="flex items-start">
                <input type="checkbox" required className="mt-1 mr-2" />
                <label className="text-sm text-gray-300">
                  Я согласен с{' '}
                  <button
                    type="button"
                    className="text-gold hover:text-yellow-400 transition-colors"
                  >
                    условиями использования
                  </button>
                  {' '}и{' '}
                  <button
                    type="button"
                    className="text-gold hover:text-yellow-400 transition-colors"
                  >
                    политикой конфиденциальности
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="btn-gold w-full"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2 w-4 h-4 border-2"></div>
                    Регистрация...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Создать аккаунт
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">или продолжите с</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="ghost" className="text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400">
                <i className="fab fa-google mr-2"></i>
                Google
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400">
                <i className="fab fa-telegram mr-2"></i>
                Telegram
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                Нет аккаунта?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-gold hover:text-yellow-400 transition-colors"
                >
                  Зарегистрируйтесь
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-gold hover:text-yellow-400 transition-colors"
                >
                  Войдите
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;