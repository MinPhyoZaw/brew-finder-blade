import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { CoffeeShopService } from '../services/restaurantService';
import { useFavorites } from '../hooks/useFavorites';
import type { CoffeeShop, LocationError, UserLocation } from '../types/restaurant';
import type { User } from '../types/auth';
import { hasValidCoordinates } from '../utils/coffeeShopDistance';
import { matchesCoffeeShopFilters } from '../utils/coffeeShopFilters';
import { LoadingSpinner } from './LoadingSpinner';
import { CafeGrid } from './coffee/CafeGrid';
import { ExploreNearbySection } from './coffee/ExploreNearbySection';
import { HeroCafeCollage } from './coffee/HeroCafeCollage';
import { HeroSearchPanel } from './coffee/HeroSearchPanel';
import { MoodSection } from './coffee/MoodSection';
import { SectionHeader } from './coffee/SectionHeader';

const CoffeeShopDetail = lazy(() => import('./RestaurantDetail').then((module) => ({ default: module.CoffeeShopDetail })));
const INITIAL_VISIBLE_COUNT = 4;
interface CoffeeShopListProps { user: User | null; location?: UserLocation | null; locationLoading?: boolean; locationError?: LocationError | null; onRequestLocation?: () => void; }

export function CoffeeShopList({ user, location, locationLoading = false, locationError, onRequestLocation }: CoffeeShopListProps) {
  const [shops, setShops] = useState<CoffeeShop[]>([]); const [search, setSearch] = useState(''); const [township, setTownship] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null); const [showAll, setShowAll] = useState(false); const [selected, setSelected] = useState<CoffeeShop | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [nearMeActive, setNearMeActive] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites(user);
  useEffect(() => { CoffeeShopService.getAllCoffeeShops().then(setShops).catch(() => setError('We could not load cafés right now. Please check your connection and try again.')).finally(() => setLoading(false)); }, []);
  const townships = useMemo(() => Array.from(new Set(shops.map((shop) => shop.provision).filter((value): value is string => Boolean(value)))).sort(), [shops]);
  const filtered = useMemo(() => shops.filter((shop) => matchesCoffeeShopFilters(shop, { search, township, activeFilter })), [activeFilter, search, shops, township]);
  const nearbyResults = useMemo(() => { const results = filtered.map((shop) => ({ ...shop, distance: location && hasValidCoordinates(shop) ? CoffeeShopService.calculateDistance(location.latitude, location.longitude, shop.latitude, shop.longitude) : undefined })); return nearMeActive && location ? results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)) : results; }, [filtered, location, nearMeActive]);
  const recommendations = showAll ? nearbyResults : nearbyResults.slice(0, INITIAL_VISIBLE_COUNT);
  const openShop = useCallback((shop: CoffeeShop) => setSelected(shop), []);
  const clearFilters = () => { setSearch(''); setTownship('all'); setActiveFilter(null); };
  const chooseMood = (filter: string) => { setActiveFilter(filter); requestAnimationFrame(() => document.getElementById('recommended')?.scrollIntoView({ behavior: 'smooth' })); };
  const requestNearby = () => { setNearMeActive(true); onRequestLocation?.(); };
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div role="alert" className="page-shell py-20"><div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">{error}</div></div>;
  return <>
    <section id="discover" className="page-shell hero-grid pt-10 sm:pt-14 lg:pt-20"><HeroSearchPanel search={search} onSearchChange={setSearch} township={township} townships={townships} onTownshipChange={setTownship} activeFilter={activeFilter} onFilterChange={setActiveFilter} nearMeActive={nearMeActive} location={location} locationLoading={locationLoading} locationError={locationError} onNearMe={requestNearby} /><div className="mt-9 min-w-0 lg:mt-0"><HeroCafeCollage images={shops.flatMap((shop) => shop.images ?? [])} /></div></section>
    <section id="recommended" className="page-shell section-space"><SectionHeader title="Recommended for you" text="Handpicked cafés based on what you might love." action={filtered.length > INITIAL_VISIBLE_COUNT ? (showAll ? 'Show less' : 'Show all') : undefined} onAction={() => setShowAll((value) => !value)} /><CafeGrid shops={recommendations} canFavorite={Boolean(user)} isFavorite={isFavorite} onFavorite={toggleFavorite} onOpen={openShop} onClear={clearFilters} /></section>
    <MoodSection shops={shops} onSelect={chooseMood} />
    <ExploreNearbySection shops={nearbyResults.filter(hasValidCoordinates)} location={location} onRequestLocation={onRequestLocation} onOpen={openShop} />
    {selected && <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-white/80"><LoadingSpinner /></div>}><CoffeeShopDetail coffeeShop={selected} onClose={() => setSelected(null)} /></Suspense>}
  </>;
}
