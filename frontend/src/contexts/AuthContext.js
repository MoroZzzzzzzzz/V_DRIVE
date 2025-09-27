import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('veles_token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get current user info (this would need to be implemented in the backend)
        // For now, we'll just check if token exists and is valid by making a test request
        await axios.get(`${BACKEND_URL}/api/`);
        
        // In a real app, you'd decode the token or make a /me endpoint call
        // For now, we'll set a mock user based on token existence
        setUser({
          id: 'mock-user-id',
          email: 'user@example.com',
          full_name: 'Пользователь',
          role: 'buyer' // This would come from the backend
        });
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('veles_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('veles_token', access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Ошибка входа';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);

      const { access_token, user: newUser } = response.data;
      
      setToken(access_token);
      setUser(newUser);
      localStorage.setItem('veles_token', access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.detail || 'Ошибка регистрации';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('veles_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const isAuthenticated = !!user;
  const isDealer = user?.role === 'dealer';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isDealer,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };