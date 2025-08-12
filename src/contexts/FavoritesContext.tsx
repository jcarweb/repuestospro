import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  brand?: string;
  addedAt: Date;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFromFavorites: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  clearFavorites: () => void;
  getFavoritesCount: () => number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Cargar favoritos desde localStorage al inicializar
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        // Convertir las fechas de string a Date
        const favoritesWithDates = parsedFavorites.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setFavorites(favoritesWithDates);
      } catch (error) {
        console.error('Error parsing saved favorites:', error);
        localStorage.removeItem('favorites');
      }
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites(prevFavorites => {
      // Verificar si el item ya existe en favoritos
      const existingItem = prevFavorites.find(fav => fav.id === item.id);
      
      if (existingItem) {
        // Si ya existe, no hacer nada
        return prevFavorites;
      } else {
        // Si no existe, agregarlo con la fecha actual
        const newFavorite: FavoriteItem = {
          ...item,
          addedAt: new Date()
        };
        return [...prevFavorites, newFavorite];
      }
    });
  };

  const removeFromFavorites = (itemId: string) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(item => item.id !== itemId)
    );
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(item => item.id === itemId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    getFavoritesCount
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 