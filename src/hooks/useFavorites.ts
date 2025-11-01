// src/hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import type { CoffeeShop } from '../types/restaurant';
import type { User } from '../types/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CoffeeShopService } from '../services/restaurantService';

export const useFavorites = (user: User | null) => {
  const [favorites, setFavorites] = useState<CoffeeShop[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);

    try {
  const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const favIds: string[] = data.favorites || [];
        setFavoriteIds(new Set(favIds));

        // Fetch full coffee shop details from the coffeeshops collection
        const allCoffeeShops: CoffeeShop[] = await CoffeeShopService.getAllCoffeeShops();
        const favoriteShops = allCoffeeShops.filter(shop => favIds.includes(shop.id));
        setFavorites(favoriteShops);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (coffeeShopId: string) => {
    if (!user) return;

  const userRef = doc(db, 'users', user.id);

    try {
      // Optimistic UI update: update local state first
      const wasFav = favoriteIds.has(coffeeShopId);
      const prevFavoriteIds = new Set(favoriteIds);
      const prevFavorites = [...favorites];

      // Update ids
      const newIds = new Set(favoriteIds);
      if (wasFav) newIds.delete(coffeeShopId);
      else newIds.add(coffeeShopId);
      setFavoriteIds(newIds);

      // Update favorites list using cached shop if available to avoid extra reads
      if (!wasFav) {
        const shop = CoffeeShopService.getCachedCoffeeShopById(coffeeShopId);
        if (shop) setFavorites((s) => [shop, ...s]);
      } else {
        setFavorites((s) => s.filter((sh) => sh.id !== coffeeShopId));
      }

      try {
        const userSnap2 = await getDoc(userRef);

        if (userSnap2.exists()) {
          if (wasFav) {
            await updateDoc(userRef, { favorites: arrayRemove(coffeeShopId) });
          } else {
            await updateDoc(userRef, { favorites: arrayUnion(coffeeShopId) });
          }
        } else {
          if (!wasFav) {
            await setDoc(userRef, { favorites: [coffeeShopId] }, { merge: true });
          }
        }
      } catch (err) {
        // revert optimistic change on failure
        console.error('Error updating favorite (reverting):', err);
        setFavoriteIds(prevFavoriteIds);
        setFavorites(prevFavorites);
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const isFavorite = (coffeeShopId: string) => favoriteIds.has(coffeeShopId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
  };
};
