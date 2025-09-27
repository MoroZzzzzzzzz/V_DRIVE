import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const FavoritesContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load favorites when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/favorites`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      // If API fails, try to load from localStorage as fallback
      const localFavorites = JSON.parse(localStorage.getItem('veles_favorites') || '[]');
      setFavorites(localFavorites);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (carId) => {
    if (!isAuthenticated) {
      toast.error('Войдите в систему, чтобы добавлять в избранное');
      return false;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/favorites/${carId}`);
      
      // Add to local state optimistically
      setFavorites(prev => [...prev.filter(fav => fav.id !== carId), { id: carId }]);
      
      // Update localStorage as backup
      const updatedFavorites = [...favorites.filter(fav => fav.id !== carId), { id: carId }];
      localStorage.setItem('veles_favorites', JSON.stringify(updatedFavorites));
      
      toast.success('Добавлено в избранное');
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      // Fallback to localStorage if API fails
      const updatedFavorites = [...favorites.filter(fav => fav.id !== carId), { id: carId }];
      setFavorites(updatedFavorites);
      localStorage.setItem('veles_favorites', JSON.stringify(updatedFavorites));
      
      toast.success('Добавлено в избранное (локально)');
      return true;
    }
  };

  const removeFromFavorites = async (carId) => {
    if (!isAuthenticated) {
      toast.error('Войдите в систему, чтобы управлять избранным');
      return false;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/favorites/${carId}`);
      
      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.id !== carId));
      
      // Update localStorage
      const updatedFavorites = favorites.filter(fav => fav.id !== carId);
      localStorage.setItem('veles_favorites', JSON.stringify(updatedFavorites));
      
      toast.success('Удалено из избранного');
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      
      // Fallback to localStorage
      const updatedFavorites = favorites.filter(fav => fav.id !== carId);
      setFavorites(updatedFavorites);
      localStorage.setItem('veles_favorites', JSON.stringify(updatedFavorites));
      
      toast.success('Удалено из избранного (локально)');
      return true;
    }
  };

  const toggleFavorite = async (carId) => {
    const isFavorite = favorites.some(fav => fav.id === carId);
    
    if (isFavorite) {
      return await removeFromFavorites(carId);
    } else {
      return await addToFavorites(carId);
    }
  };

  const isFavorite = (carId) => {
    return favorites.some(fav => fav.id === carId);
  };

  const getFavoriteIds = () => {
    return favorites.map(fav => fav.id);
  };

  const clearFavorites = async () => {
    if (!isAuthenticated) return;

    try {
      // Clear all favorites on server
      const favoriteIds = getFavoriteIds();
      await Promise.all(favoriteIds.map(id => 
        axios.delete(`${BACKEND_URL}/api/favorites/${id}`)
      ));
      
      setFavorites([]);
      localStorage.removeItem('veles_favorites');
      
      toast.success('Избранное очищено');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      
      // Fallback to local clear
      setFavorites([]);
      localStorage.removeItem('veles_favorites');
      
      toast.success('Избранное очищено (локально)');
    }
  };

  const value = {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
    clearFavorites,
    loadFavorites,
    favoritesCount: favorites.length
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export { FavoritesContext };