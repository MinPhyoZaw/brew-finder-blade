import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Camera, ChevronRight, Coffee, Crosshair, Heart, MapPin,
  PartyPopper, Search, SlidersHorizontal, Sparkles, Star, Sun, Users, Wifi, X,
} from 'lucide-react';
import { CoffeeShopService } from '../services/restaurantService';
import { useFavorites } from '../hooks/useFavorites';
import type { CoffeeShop, UserLocation } from '../types/restaurant';
import type { User } from '../types/auth';
import { LoadingSpinner } from './LoadingSpinner';

const CoffeeShopDetail = lazy(() => import('./RestaurantDetail').then((m) => ({ default: m.CoffeeShopDetail })));
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg';
const HERO_FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/2467287/pexels-photo-2467287.jpeg?auto=compress&cs=tinysrgb&w=1000',
  'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1000',
] as const;
const HERO_IMAGE_ALTS = [
  'Warm modern cafe interior in Yangon',
  'Outdoor garden cafe in Yangon',
  'Welcoming Yangon cafe storefront',
  'Fresh latte prepared by a barista',
] as const;

const isValidImageSource = (source: unknown): source is string => {
  if (typeof source !== 'string' || !source.trim()) return false;
  const value = source.trim();
  return value.startsWith('/') || value.startsWith('data:image/') || /^https?:\/\//i.test(value);
};

const prepareHeroImages = (images: unknown[]): string[] => {
  const sources = Array.from(new Set(images.filter(isValidImageSource).map((image) => image.trim())));

  for (const fallback of HERO_FALLBACK_IMAGES) {
    if (sources.length >= 4) break;
    if (!sources.includes(fallback)) sources.push(fallback);
  }

  return sources.slice(0, 4);
};

function HeroCafeCollage({ images }: { images: unknown[] }) {
  const sources = useMemo(() => prepareHeroImages(images), [images]);
  const panels = [
    'left-0 top-0 h-[61%] w-[58%] rounded-[44px_24px_68px_24px]',
    'right-0 top-0 h-[41%] w-[39%] rounded-[28px_48px_28px_64px]',
    'bottom-0 left-0 h-[35%] w-[66%] rounded-[24px_60px_28px_48px]',
    'bottom-0 right-0 h-[56%] w-[31%] rounded-[64px_24px_48px_28px]',
  ];

  return <div className="relative h-[310px] w-full sm:h-[370px] lg:h-[430px]" aria-label="Yangon cafe highlights">
    {sources.map((source, index) => <div
      key={`${source}-${index}`}
      className={`absolute overflow-hidden bg-[#E9DFD1] shadow-[0_18px_45px_rgba(58,35,24,0.12)] ${panels[index]}`}
    >
      <img
        src={source}
        alt={HERO_IMAGE_ALTS[index]}
        fetchPriority={index === 0 ? 'high' : undefined}
        loading={index === 0 ? 'eager' : 'lazy'}
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = HERO_FALLBACK_IMAGES[index];
        }}
      />
    </div>)}

    <div className="absolute bottom-3 left-3 z-10 flex max-w-[62%] items-center gap-2 rounded-full bg-[#3A2318]/90 px-3 py-2 text-xs font-semibold leading-4 text-white shadow-lg backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-4 sm:text-sm">
      <MapPin className="h-4 w-4 shrink-0 text-[#D47A45]" aria-hidden="true" />
      <span>Yangon's cafe culture is waiting for you</span>
    </div>
  </div>;
}

interface CoffeeShopListProps { user: User | null; location?: UserLocation | null; onRequestLocation?: () => void; }

const normalize = (value = '') => value.toLowerCase().replace(/\s*&\s*/g, '_').replace(/[\s-]+/g, '_');
const getImage = (shop?: CoffeeShop) => shop?.images?.[0] || FALLBACK_IMAGE;

export const CoffeeShopList: React.FC<CoffeeShopListProps> = ({ user, location, onRequestLocation }) => {
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [search, setSearch] = useState('');
  const [township, setTownship] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<CoffeeShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const recommendations = showAll ? filtered : filtered.slice(0, 3);
  const heroImages = useMemo(() => shops.flatMap((shop) => shop.images || []), [shops]);

  const openShop = useCallback((shop: CoffeeShop) => setSelected(shop), []);
  const chooseMood = (key: string) => {
    setActiveFilter(key);
    requestAnimationFrame(() => document.getElementById('recommended')?.scrollIntoView({ behavior: 'smooth' }));
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
      <div className="flex flex-col justify-center">
        <p className="mb-4 text-xs font-bold tracking-[.2em] text-[#B5663D]">GOOD COFFEE. A BRIGHTER YANGON.</p>
        <h1 className="max-w-2xl text-4xl font-bold leading-[1.06] tracking-[-.035em] text-[#241711] sm:text-5xl lg:text-6xl">Find your perfect coffee spot</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#6F675F] sm:text-lg">Discover the best cafés in Yangon — from cozy hideaways to vibrant community spaces.</p>
        <div className="mt-8 rounded-2xl border border-[#EAE3D8] bg-white p-2 shadow-soft sm:flex">
          <label className="flex min-h-12 flex-1 items-center gap-3 px-3">
            <Search className="h-5 w-5 text-[#6F675F]" aria-hidden="true" />
            <span className="sr-only">Search cafés</span>
            <input data-testid="coffee-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cafés, neighborhoods or vibes" className="w-full bg-transparent text-sm outline-none placeholder:text-[#8C847C]" />
            {search && <button aria-label="Clear search" onClick={() => setSearch('')} className="icon-button"><X className="h-4 w-4" /></button>}
          </label>
          <div className="my-1 hidden w-px bg-[#EAE3D8] sm:block" />
          <select aria-label="Select township" value={township} onChange={(e) => setTownship(e.target.value)} className="min-h-12 w-full rounded-xl bg-transparent px-3 text-sm font-semibold outline-none sm:w-44">
            <option value="all">All townships</option>{townships.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={onRequestLocation} className="button-primary w-full sm:w-auto"><Crosshair className="h-4 w-4" /> Near me</button>
        </div>
        <FilterChips active={activeFilter} onChange={setActiveFilter} />
      </div>
      <div className="mt-9 min-w-0 lg:mt-0">
        <HeroCafeCollage images={heroImages} />
      </div>
    </section>

    <section id="recommended" className="page-shell section-space">
      <SectionHeader title="Recommended for you" text="Handpicked cafés based on what you might love." action={filtered.length > 3 ? (showAll ? 'Show less' : 'See all') : undefined} onAction={() => setShowAll(!showAll)} />
      {recommendations.length ? <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((shop) => <CafeCard key={shop.id} shop={shop} favorite={isFavorite(shop.id)} canFavorite={!!user} onFavorite={() => toggleFavorite(shop.id)} onOpen={() => openShop(shop)} location={location} />)}
      </div> : <div className="mt-8 rounded-3xl border border-dashed border-[#D8CEC0] p-12 text-center"><Coffee className="mx-auto mb-3 h-8 w-8 text-[#B5663D]" /><h3 className="font-bold">No cafés match those filters</h3><p className="mt-2 text-sm text-[#6F675F]">Try another township, mood, or search term.</p><button className="mt-5 text-sm font-bold text-[#28613E]" onClick={() => { setSearch(''); setTownship('all'); setActiveFilter(null); }}>Clear all filters</button></div>}
    </section>

    <section id="collections" className="bg-[#F2ECE2]"><div className="page-shell section-space">
      <SectionHeader title="Browse by mood" text="Find the right café for your moment." />
      <div className="mood-grid mt-8">{moods.map(({ key, label, icon: Icon }, index) => {
        const match = shops.find((shop) => (shop.tags || []).map(normalize).includes(key)) || shops[index % Math.max(shops.length, 1)];
        return <button key={key} onClick={() => chooseMood(key)} className="mood-card group" aria-label={`Browse cafés for ${label}`}><img src={getImage(match)} alt="" loading="lazy" width="280" height="360" /><span className="mood-overlay" /><span className="relative z-10 flex h-full flex-col items-start justify-end p-5 text-white"><Icon className="mb-3 h-6 w-6" /><strong>{label}</strong></span></button>;
      })}</div>
    </div></section>

    <ExploreNearby location={location} onRequestLocation={onRequestLocation} />
    {selected && <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-white/80"><LoadingSpinner /></div>}><CoffeeShopDetail coffeeShop={selected} onClose={() => setSelected(null)} /></Suspense>}
  </>;
};

const FilterChips = ({ active, onChange }: { active: string | null; onChange: (value: string | null) => void }) => {
  const filters = [
    { key: 'open', label: 'Open now', icon: Coffee }, { key: 'quiet', label: 'Quiet', icon: BookOpen }, { key: 'outdoor', label: 'Outdoor', icon: Sun },
    { key: 'wifi', label: 'Wi-Fi', icon: Wifi }, { key: 'specialty', label: 'Specialty coffee', icon: Sparkles },
  ];
  return <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Quick filters">{filters.map(({ key, label, icon: Icon }) => <button key={key} aria-pressed={active === key} onClick={() => onChange(active === key ? null : key)} className={`filter-chip ${active === key ? 'filter-chip-active' : ''}`}><Icon className="h-4 w-4" />{label}</button>)}<button className="filter-chip" onClick={() => document.querySelector<HTMLSelectElement>('select[aria-label="Select township"]')?.focus()}><SlidersHorizontal className="h-4 w-4" />More filters</button></div>;
};

const SectionHeader = ({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) => <div className="flex items-end justify-between gap-5"><div><h2 className="text-3xl font-bold tracking-tight text-[#241711] sm:text-4xl">{title}</h2><p className="mt-2 text-[#6F675F]">{text}</p></div>{action && <button onClick={onAction} className="hidden items-center gap-1 text-sm font-bold text-[#28613E] sm:flex">{action}<ChevronRight className="h-4 w-4" /></button>}</div>;

const CafeCard = ({ shop, favorite, canFavorite, onFavorite, onOpen, location }: { shop: CoffeeShop; favorite: boolean; canFavorite: boolean; onFavorite: () => void; onOpen: () => void; location?: UserLocation | null }) => {
  const distance = location ? CoffeeShopService.calculateDistance(location.latitude, location.longitude, shop.latitude, shop.longitude) : shop.distance;
  return <article className="cafe-card" onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }} tabIndex={0} role="button">
    <div className="relative aspect-[4/3] overflow-hidden"><img src={getImage(shop)} alt={`${shop.name} café`} loading="lazy" width="520" height="390" className="h-full w-full object-cover" /><span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#28613E]">{shop.hours ? 'Hours available' : 'Hours unavailable'}</span><button disabled={!canFavorite} onClick={(e) => { e.stopPropagation(); onFavorite(); }} aria-label={favorite ? `Remove ${shop.name} from wishlist` : `Add ${shop.name} to wishlist`} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#4A2D1F] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"><Heart className={`h-5 w-5 ${favorite ? 'fill-[#B5663D] text-[#B5663D]' : ''}`} /></button></div>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="line-clamp-1 text-xl font-bold">{shop.name}</h3><span className="flex items-center gap-1 text-sm font-bold"><Star className="h-4 w-4 fill-[#F5A623] text-[#F5A623]" />{shop.rating || 'New'}</span></div><div className="mt-2 flex items-center gap-2 text-sm text-[#6F675F]"><MapPin className="h-4 w-4 shrink-0" /><span className="line-clamp-1">{shop.provision || shop.address}</span>{distance != null && <><span>·</span><span>{distance.toFixed(1)} km</span></>}</div><div className="mt-4 flex flex-wrap gap-2">{[shop.type, ...(shop.tags || [])].filter(Boolean).slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-[#F2ECE2] px-3 py-1 text-xs font-semibold text-[#4A2D1F]">{String(tag).replace(/_/g, ' ')}</span>)}</div></div>
  </article>;
};

const ExploreNearby = ({ location, onRequestLocation }: { location?: UserLocation | null; onRequestLocation?: () => void }) => <section id="map" className="page-shell section-space"><div className="overflow-hidden rounded-[28px] bg-[#28613E] text-white lg:grid lg:grid-cols-2"><div className="p-8 sm:p-12 lg:p-16"><p className="text-xs font-bold tracking-[.18em] text-[#C9DFC8]">YOUR NEXT CUP, CLOSER</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">Explore nearby</h2><p className="mt-4 max-w-md text-[#E1EBE1]">See great cafés around you on the map.</p><ul className="mt-7 space-y-3 text-sm text-[#F7FBF7]"><li>✓ Real-time locations</li><li>✓ Opening hours</li><li>✓ Photos and reviews</li></ul><button onClick={onRequestLocation} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-[#28613E]"><MapPin className="h-4 w-4" />{location ? 'Refresh location' : 'Open Map'}</button></div><div className="map-preview" aria-label="Stylized map preview of Yangon"><div className="map-road road-one"/><div className="map-road road-two"/><MapPin className="map-pin left-[28%] top-[36%]"/><MapPin className="map-pin left-[64%] top-[58%]"/><div className="absolute bottom-6 left-6 rounded-xl bg-white p-3 text-sm font-bold text-[#241711] shadow-lg">Yangon cafés near you</div></div></div></section>;
