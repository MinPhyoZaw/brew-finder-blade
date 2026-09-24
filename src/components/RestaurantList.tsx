import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Camera, ChevronRight, Coffee, Crosshair, Heart, MapPin,
  PartyPopper, Search, SlidersHorizontal, Sparkles, Star, Sun, Users, Wifi, X,
} from 'lucide-react';
import { CoffeeShopService } from '../services/restaurantService';
import { useFavorites } from '../hooks/useFavorites';
import type { CoffeeShop, LocationError, UserLocation } from '../types/restaurant';
import type { User } from '../types/auth';
import { LoadingSpinner } from './LoadingSpinner';
import { HeroCafeCollage } from './HeroCafeCollage';
import { MapSection } from './MapSection';

const CoffeeShopDetail = lazy(() => import('./RestaurantDetail').then((m) => ({ default: m.CoffeeShopDetail })));
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg';
interface CoffeeShopListProps {
  user: User | null;
  location?: UserLocation | null;
  locationLoading?: boolean;
  locationError?: LocationError | null;
  onRequestLocation?: () => void;
}

const normalize = (value = '') => value.toLowerCase().replace(/\s*&\s*/g, '_').replace(/[\s-]+/g, '_');
const getImage = (shop?: CoffeeShop) => shop?.images?.[0] || FALLBACK_IMAGE;
const hasValidCoordinates = (shop: CoffeeShop) => Number.isFinite(shop.latitude)
  && Number.isFinite(shop.longitude)
  && shop.latitude >= -90
  && shop.latitude <= 90
  && shop.longitude >= -180
  && shop.longitude <= 180;

export const CoffeeShopList: React.FC<CoffeeShopListProps> = ({ user, location, locationLoading = false, locationError, onRequestLocation }) => {
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [search, setSearch] = useState('');
  const [township, setTownship] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<CoffeeShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites(user);

  useEffect(() => {
    CoffeeShopService.getAllCoffeeShops()
      .then(setShops)
      .catch(() => setError('We could not load cafés right now. Please check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const townships = useMemo(() => Array.from(new Set(shops.map((s) => s.provision).filter(Boolean) as string[])).sort(), [shops]);
  const filtered = useMemo(() => shops.filter((shop) => {
    const haystack = [shop.name, shop.provision, shop.address, shop.type, ...(shop.tags || [])].join(' ').toLowerCase();
    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (township !== 'all' && normalize(shop.provision) !== normalize(township)) return false;
    if (!activeFilter) return true;
    const tags = (shop.tags || []).map(normalize);
    if (activeFilter === 'open') return Boolean(shop.hours) && !normalize(shop.hours).includes('closed');
    if (activeFilter === 'specialty') return normalize(shop.type).includes('specialty');
    if (activeFilter === 'wifi') return tags.some((tag) => tag.includes('wifi') || tag.includes('wi_fi'));
    if (activeFilter === 'quiet') return tags.some((tag) => tag.includes('quiet') || tag.includes('study'));
    if (activeFilter === 'outdoor') return tags.some((tag) => tag.includes('outdoor'));
    return tags.includes(activeFilter);
  }), [activeFilter, search, shops, township]);

  const nearbyResults = useMemo(() => {
    const withDistances = filtered.map((shop) => ({
      ...shop,
      distance: location && hasValidCoordinates(shop)
        ? CoffeeShopService.calculateDistance(location.latitude, location.longitude, shop.latitude, shop.longitude)
        : undefined,
    }));

    if (!nearMeActive || !location) return withDistances;

    return withDistances.sort((a, b) => {
      if (a.distance == null) return b.distance == null ? 0 : 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
  }, [filtered, location, nearMeActive]);
  const initialVisibleCount = 4;
  const recommendations = showAll ? nearbyResults : nearbyResults.slice(0, initialVisibleCount);
  const heroImages = useMemo(() => shops.flatMap((shop) => shop.images || []), [shops]);

  const openShop = useCallback((shop: CoffeeShop) => setSelected(shop), []);
  const chooseMood = (key: string) => {
    setActiveFilter(key);
    requestAnimationFrame(() => document.getElementById('recommended')?.scrollIntoView({ behavior: 'smooth' }));
  };
  const requestNearby = () => {
    setNearMeActive(true);
    onRequestLocation?.();
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div role="alert" className="page-shell py-20"><div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-800">{error}</div></div>;

  const moods = [
    { key: 'first_date', label: 'First Date', icon: Heart },
    { key: 'study_spot', label: 'Study Spot', icon: BookOpen },
    { key: 'group_hangout', label: 'Group Hangout', icon: PartyPopper },
    { key: 'photograph', label: 'Photograph', icon: Camera },
    { key: 'family', label: 'Family', icon: Users },
    { key: 'relax_chill', label: 'Relax & Chill', icon: Coffee },
  ];

  return <>
    <section id="discover" className="page-shell hero-grid pt-10 sm:pt-14 lg:pt-20">
      <div className="flex min-w-0 flex-col justify-center">
        <p className="mb-4 text-xs font-bold tracking-[.2em] text-[#B5663D]">GOOD COFFEE. A BRIGHTER YANGON.</p>
        <h1 className="max-w-2xl text-4xl font-bold leading-[1.06] tracking-[-.035em] text-[#241711] sm:text-5xl lg:text-6xl">Find your perfect coffee spot</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#6F675F] sm:text-lg">Discover the best cafés in Yangon — from cozy hideaways to vibrant community spaces.</p>
        <div className="mt-8 grid min-w-0 gap-2 rounded-2xl border border-[#EAE3D8] bg-white p-2 shadow-soft sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:gap-0">
          <label className="flex min-h-12 min-w-0 items-center gap-3 px-3">
            <Search className="h-5 w-5 shrink-0 text-[#6F675F]" aria-hidden="true" />
            <span className="sr-only">Search cafés</span>
            <input data-testid="coffee-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cafés, neighborhoods or vibes" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8C847C]" />
            {search && <button aria-label="Clear search" onClick={() => setSearch('')} className="icon-button"><X className="h-4 w-4" /></button>}
          </label>
          <div className="my-1 hidden w-px bg-[#EAE3D8] sm:block" />
          <select aria-label="Select township" value={township} onChange={(e) => setTownship(e.target.value)} className="min-h-12 min-w-0 w-full rounded-xl bg-transparent px-3 text-sm font-semibold outline-none">
            <option value="all">All townships</option>{townships.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button
            onClick={requestNearby}
            disabled={nearMeActive && locationLoading}
            aria-pressed={nearMeActive}
            className={`button-primary w-full sm:w-auto ${nearMeActive ? 'ring-2 ring-[#28613E] ring-offset-2' : ''} disabled:cursor-wait disabled:opacity-70`}
          >
            <Crosshair className="h-4 w-4" />
            {nearMeActive && locationLoading ? 'Finding you...' : nearMeActive && location ? 'Nearest first' : 'Near me'}
          </button>
        </div>
        {nearMeActive && locationError && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{locationError.message}</p>}
        <FilterChips active={activeFilter} onChange={setActiveFilter} />
      </div>
      <div className="mt-9 min-w-0 lg:mt-0">
        <HeroCafeCollage images={heroImages} />
      </div>
    </section>

    <section id="recommended" className="page-shell section-space">
      <SectionHeader title="Recommended for you" text="Handpicked cafés based on what you might love." action={filtered.length > initialVisibleCount ? (showAll ? 'Show less' : 'Show all') : undefined} onAction={() => setShowAll(!showAll)} />
      {recommendations.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        {recommendations.map((shop) => <CafeCard key={shop.id} shop={shop} favorite={isFavorite(shop.id)} canFavorite={!!user} onFavorite={() => toggleFavorite(shop.id)} onOpen={() => openShop(shop)} />)}
      </div> : <div className="mt-8 rounded-3xl border border-dashed border-[#D8CEC0] p-12 text-center"><Coffee className="mx-auto mb-3 h-8 w-8 text-[#B5663D]" /><h3 className="font-bold">No cafés match those filters</h3><p className="mt-2 text-sm text-[#6F675F]">Try another township, mood, or search term.</p><button className="mt-5 text-sm font-bold text-[#28613E]" onClick={() => { setSearch(''); setTownship('all'); setActiveFilter(null); }}>Clear all filters</button></div>}
    </section>

    <section id="collections" className="bg-[#F2ECE2]"><div className="page-shell section-space">
      <SectionHeader title="Browse by mood" text="Find the right café for your moment." />
      <div className="mood-grid mt-8">{moods.map(({ key, label, icon: Icon }, index) => {
        const match = shops.find((shop) => (shop.tags || []).map(normalize).includes(key)) || shops[index % Math.max(shops.length, 1)];
        return <button key={key} onClick={() => chooseMood(key)} className="mood-card group" aria-label={`Browse cafés for ${label}`}><img src={getImage(match)} alt="" loading="lazy" width="280" height="360" /><span className="mood-overlay" /><span className="relative z-10 flex h-full flex-col items-start justify-end p-5 text-white"><Icon className="mb-3 h-6 w-6" /><strong>{label}</strong></span></button>;
      })}</div>
    </div></section>

    <MapSection shops={nearbyResults.filter(hasValidCoordinates)} location={location} onRequestLocation={onRequestLocation} onOpen={openShop} />
    {selected && <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-white/80"><LoadingSpinner /></div>}><CoffeeShopDetail coffeeShop={selected} onClose={() => setSelected(null)} /></Suspense>}
  </>;
};

const FilterChips = ({ active, onChange }: { active: string | null; onChange: (value: string | null) => void }) => {
  const filters = [
    { key: 'open', label: 'Open now', icon: Coffee }, { key: 'quiet', label: 'Quiet', icon: BookOpen }, { key: 'outdoor', label: 'Outdoor', icon: Sun },
    { key: 'wifi', label: 'Wi-Fi', icon: Wifi }, { key: 'specialty', label: 'Specialty coffee', icon: Sparkles },
  ];
  return <div className="no-scrollbar -mx-4 mt-4 flex max-w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-2 pr-8 sm:mx-0 sm:max-w-full sm:px-0 sm:pr-0" aria-label="Quick filters">{filters.map(({ key, label, icon: Icon }) => <button key={key} aria-pressed={active === key} onClick={() => onChange(active === key ? null : key)} className={`filter-chip shrink-0 ${active === key ? 'filter-chip-active' : ''}`}><Icon className="h-4 w-4" />{label}</button>)}<button className="filter-chip shrink-0" onClick={() => document.querySelector<HTMLSelectElement>('select[aria-label="Select township"]')?.focus()}><SlidersHorizontal className="h-4 w-4" />More filters</button></div>;
};

const SectionHeader = ({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) => <div className="flex min-w-0 items-start justify-between gap-2 sm:items-end sm:gap-5"><div className="min-w-0"><h2 className="text-2xl font-bold tracking-tight text-[#241711] sm:text-4xl">{title}</h2><p className="mt-2 text-sm text-[#6F675F] sm:text-base">{text}</p></div>{action && <button onClick={onAction} className="flex min-h-10 shrink-0 items-center gap-0.5 rounded-full px-2 text-xs font-bold text-[#28613E] sm:gap-1 sm:px-3 sm:text-sm">{action}<ChevronRight className="h-4 w-4" /></button>}</div>;

const CafeCard = ({ shop, favorite, canFavorite, onFavorite, onOpen }: { shop: CoffeeShop; favorite: boolean; canFavorite: boolean; onFavorite: () => void; onOpen: () => void }) => {
  const distance = shop.distance;
  return <article className="cafe-card min-w-0 w-full" onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }} tabIndex={0} role="button">
    <div className="relative aspect-[4/3] overflow-hidden"><img src={getImage(shop)} alt={`${shop.name} café`} loading="lazy" width="520" height="390" className="h-full w-full object-cover" /><span className="absolute left-2 top-2 max-w-[calc(100%-3.25rem)] truncate rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-[#28613E] sm:left-3 sm:top-3 sm:px-3 sm:text-xs">{shop.hours || 'Hours unavailable'}</span><button disabled={!canFavorite} onClick={(e) => { e.stopPropagation(); onFavorite(); }} title={favorite ? 'Remove from wishlist' : 'Add to wishlist'} aria-label={favorite ? `Remove ${shop.name} from wishlist` : `Add ${shop.name} to wishlist`} className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[#4A2D1F] shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:h-10 sm:w-10 lg:h-11 lg:w-11"><Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${favorite ? 'fill-[#B5663D] text-[#B5663D]' : ''}`} /></button></div>
    <div className="min-w-0 p-3 sm:p-4 lg:p-5"><div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2"><h3 className="line-clamp-2 min-w-0 text-sm font-bold leading-5 sm:text-base lg:text-xl">{shop.name}</h3><span className="flex shrink-0 items-center gap-1 text-xs font-bold sm:text-sm"><Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623] sm:h-4 sm:w-4" />{shop.rating || 'New'}</span></div><div className="mt-2 flex min-w-0 items-center gap-1 text-xs text-[#6F675F] sm:gap-2 sm:text-sm"><MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /><span className="min-w-0 flex-1 truncate">{shop.provision || shop.address}</span>{distance != null && <span className="hidden shrink-0 sm:inline">{distance.toFixed(1)} km</span>}</div><div className="mt-3 flex min-w-0 gap-1.5 sm:mt-4 sm:flex-wrap sm:gap-2">{[shop.type, ...(shop.tags || [])].filter(Boolean).slice(0, 2).map((tag) => <span key={tag} className="min-w-0 truncate rounded-full bg-[#F2ECE2] px-2 py-1 text-[10px] font-semibold text-[#4A2D1F] sm:text-xs">{String(tag).replace(/_/g, ' ')}</span>)}</div></div>
  </article>;
};
