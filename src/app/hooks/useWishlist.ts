import { useState, useEffect } from 'react';

export function useWishlist() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const item = window.localStorage.getItem('satvik_wishlist');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem('satvik_wishlist', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  return { favorites, toggleFavorite, isFavorite };
}
