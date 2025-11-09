import { collection, getDocs, query, orderBy, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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

  /**
   * Submit or update a user's rating for a coffee shop.
   * Stores user rating in coffeeshops/{shopId}/ratings/{userId} and
   * recomputes the average rating and ratingCount on the parent document.
   */
  static async submitRating(coffeeShopId: string, userId: string, rating: number): Promise<void> {
    try {
      const shopDocRef = doc(db, this.COLLECTION_NAME, coffeeShopId);
      const ratingsColRef = collection(shopDocRef, 'ratings');
      const userRatingDocRef = doc(ratingsColRef, userId);

      await setDoc(userRatingDocRef, { rating, updatedAt: Date.now() }, { merge: true });

      // Recompute aggregate
      const ratingsSnapshot = await getDocs(ratingsColRef);
      let sum = 0;
      let count = 0;
      ratingsSnapshot.forEach(r => {
        const data: any = r.data();
        if (typeof data.rating === 'number') {
          sum += data.rating;
          count += 1;
        }
      });

      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

      await updateDoc(shopDocRef, { rating: avg, ratingCount: count });

      // Update in-memory cache if present
      if (this.cache) {
        const idx = this.cache.shops.findIndex(s => s.id === coffeeShopId);
        if (idx >= 0) {
          this.cache.shops[idx] = { ...this.cache.shops[idx], rating: avg, ratingCount: count } as CoffeeShop;
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  static async getUserRating(coffeeShopId: string, userId: string): Promise<number | null> {
    try {
      const shopDocRef = doc(db, this.COLLECTION_NAME, coffeeShopId);
      const userRatingDocRef = doc(collection(shopDocRef, 'ratings'), userId);
      const snap = await getDoc(userRatingDocRef);
      if (!snap.exists()) return null;
      const data: any = snap.data();
      return typeof data.rating === 'number' ? data.rating : null;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
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