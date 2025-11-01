import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CoffeeShop } from '../types/restaurant';

export class CoffeeShopService {
  private static readonly COLLECTION_NAME = 'coffeeshops';
  // simple in-memory cache to reduce Firestore reads during a session
  private static cache: { shops: CoffeeShop[]; fetchedAt: number } | null = null;
  private static readonly CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

  static async getAllCoffeeShops(): Promise<CoffeeShop[]> {
    try {
      // return cached copy when fresh
      if (this.cache && Date.now() - this.cache.fetchedAt < this.CACHE_TTL_MS) {
        return this.cache.shops;
      }
      const coffeeShopsRef = collection(db, this.COLLECTION_NAME);
      const q = query(coffeeShopsRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const coffeeShops: CoffeeShop[] = [];
      querySnapshot.forEach((doc) => {
        coffeeShops.push({
          id: doc.id,
          ...doc.data()
        } as CoffeeShop);
      });
      // populate cache
      this.cache = { shops: coffeeShops, fetchedAt: Date.now() };
      
      return coffeeShops;
    } catch (error) {
      console.error('Error fetching coffee shops:', error);
      throw new Error('Failed to fetch coffee shops');
    }
  }

  static getCachedCoffeeShopById(id: string): CoffeeShop | undefined {
    return this.cache?.shops.find((s) => s.id === id);
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static sortCoffeeShopsByDistance(
    coffeeShops: CoffeeShop[],
    userLat: number,
    userLon: number
  ): CoffeeShop[] {
    return coffeeShops
      .map(coffeeShop => ({
        ...coffeeShop,
        distance: this.calculateDistance(
          userLat,
          userLon,
          coffeeShop.latitude,
          coffeeShop.longitude
        )
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
}