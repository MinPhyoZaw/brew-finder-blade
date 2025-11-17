import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Heart, Search, Filter, X, Star, TrendingUp, Camera, Coffee, BookOpen, Users, PartyPopper } from 'lucide-react';
const CoffeeShopDetail = lazy(() => import('./RestaurantDetail').then(m => ({ default: m.CoffeeShopDetail })));
import { CoffeeShopService } from '../services/restaurantService';
import { useFavorites } from '../hooks/useFavorites';
import type { CoffeeShop } from '../types/restaurant';
import type { User } from '../types/auth';
import { LoadingSpinner } from './LoadingSpinner';

interface CoffeeShopListProps {
  user: User | null;
}

export const CoffeeShopList: React.FC<CoffeeShopListProps> = ({ user }) => {
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredShops, setFilteredShops] = useState<CoffeeShop[]>([]);
  const [selectedCoffeeShop, setSelectedCoffeeShop] = useState<CoffeeShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProvisionDropdown, setShowProvisionDropdown] = useState(false);
  const [selectedProvision, setSelectedProvision] = useState('all');

  const { toggleFavorite, isFavorite } = useFavorites(user);

  const townships = [
    'Sanchaung','Kamayut','Insein','Kyimyindaing','Mayangone','Mingaladon','Bahan',
    'Tamwe','Dagon','Hlaing','Ahlone','Yankin','Thingangyun','South Okkalapa',
    'North Okkalapa','Hlaingthaya','Shwepyithar','Dagon Seikkan','North Dagon',
    'East Dagon','South Dagon','Lanmadaw','Latha','Pabedan','Kyauktada',
    'Botataung','Dawbon','Thaketa','Seikkan','Mingalar Taungnyunt'
  ];

  useEffect(() => { fetchCoffeeShops(); }, []);

  // location feature removed — no nearest township calculation

  const handleOpen = useCallback((shop: CoffeeShop) => {
    setSelectedCoffeeShop(shop);
  }, []);

  const handleToggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (user) toggleFavorite(id);
  }, [toggleFavorite, user]);

  const fetchCoffeeShops = async () => {
    try {
      setLoading(true);
      const shops = await CoffeeShopService.getAllCoffeeShops();
      // Location feature removed: always load shops as-is
      setCoffeeShops(shops);
      setFilteredShops(shops);
    } catch (err) {
      console.error(err);
      setError('Failed to load coffee shops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = coffeeShops;

    if (searchTerm) {
      filtered = filtered.filter(shop =>
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.provision?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProvision !== 'all') {
      filtered = filtered.filter(shop => shop.provision?.toLowerCase() === selectedProvision.toLowerCase());
    }

    setFilteredShops(filtered);
  }, [searchTerm, selectedProvision, coffeeShops]);

  const handleSelectTownship = (township: string) => {
    setSelectedProvision(township);
    setShowProvisionDropdown(false);
  };

  // Tag-based categories: show some featured tags and then any other tags present in the data
  const featuredTags: { key: string; label: string }[] = [
    { key: 'first_date', label: 'First Date' },
    { key: 'photograph', label: 'Photograph' },
    { key: 'group_hangout', label: 'Group Hangout' },
    { key: 'family', label: 'Family' },
  ];

  // Normalize tags from shops (lowercase) and compute other tags not in featured list
  const allTags = useMemo(() => Array.from(new Set(filteredShops.flatMap((s) => s.tags || []).map((t) => t.toLowerCase()))), [filteredShops]);

  const featuredKeys = featuredTags.map((t) => t.key.toLowerCase());
  const otherTags = allTags.filter((t) => !featuredKeys.includes(t));

  const tagSections: { key: string; label: string; shops: CoffeeShop[] }[] = [];

  // Add featured tags in order if they have shops
  featuredTags.forEach((ft) => {
    const shops = filteredShops.filter((shop) =>
      (shop.tags || []).map((t) => t.toLowerCase()).includes(ft.key.toLowerCase())
    );
    if (shops.length > 0) tagSections.push({ key: ft.key, label: ft.label, shops });
  });

  // Add up to 5 other dynamic tags
  otherTags.slice(0, 5).forEach((tagKey) => {
    const shops = filteredShops.filter((shop) =>
      (shop.tags || []).map((t) => t.toLowerCase()).includes(tagKey)
    );
    if (shops.length > 0) tagSections.push({ key: tagKey, label: tagKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), shops });
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;

  const recommendedShops = filteredShops.slice(0, 5);
  const popularShops = filteredShops.filter(shop => shop.rating >= 4.0);

  const renderCategory = (title: string, shops: CoffeeShop[]) => {
    if (shops.length === 0) return null;
    const renderIconForTitle = (t: string) => {
      const key = t
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');

      const map: Record<string, any> = {
        recommended: Star,
        popular: TrendingUp,
        first_date: Heart,
        photograph: Camera,
        relax_chill: Coffee,
        study_spot: BookOpen,
        family: Users,
        group_hangout: PartyPopper,
      };

      const Icon = map[key];
      return Icon ? <Icon className="w-5 h-5 text-gray-600 mr-2" /> : null;
    };
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          {renderIconForTitle(title)}
          <span>{title}</span>
        </h2>
        <div className="flex overflow-x-auto gap-4 no-scrollbar px-1">
          {shops.map(shop => (
            <div key={shop.id} className="flex-shrink-0 w-64 h-80">
              <div
                className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden h-full cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => handleOpen(shop)}
              >
                <div className="h-[70%] w-full relative">
                  <img
                    src={shop.images && shop.images.length > 0
                      ? shop.images[0]
                      : 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'}
                          loading="lazy"
                    width={256}
                    height={224}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                          onClick={(e) => handleToggleFavorite(e, shop.id)}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                      !user
                        ? 'bg-coffee-200 text-coffee-400 cursor-not-allowed'
                        : isFavorite(shop.id)
                        ? 'bg-coffee-600 text-cream-100 hover:bg-coffee-700'
                        : 'bg-cream-100/80 text-coffee-600 hover:bg-cream-100 hover:text-coffee-700'
                    }`}
                    disabled={!user}
                  >
                    <Heart size={16} className={isFavorite(shop.id) ? 'fill-current' : ''} />
                  </button>
                </div>
                <div className="h-[30%] p-3 flex flex-col justify-between">
                  <h3 className="text-base font-semibold line-clamp-1">{shop.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>⭐ {shop.rating}</span>
                    <span className="line-clamp-1">{shop.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-6 px-4">
      {/* Search Bar */}
      <div className="p-3 rounded-xl mb-6 flex items-center gap-3 border border-gray-300">
        <Search className="w-5 h-5 text-gray-600" />
        <input
          type="text"
          placeholder="Search by name or township..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-gray-800"
        />
        <button onClick={() => setSearchTerm('')}><X className="w-5 h-5 text-gray-600" /></button>
      </div>

      {/* Township Dropdown */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowProvisionDropdown(!showProvisionDropdown)}
          className="w-full p-3 rounded-xl flex justify-between items-center border border-gray-300 bg-transparent"
        >
          {selectedProvision === 'all' ? 'Select Township' : selectedProvision}
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
        {showProvisionDropdown && (
          <div className="absolute top-full left-0 w-full shadow-lg rounded-xl mt-2 max-h-64 overflow-y-auto z-50 bg-white">
            <ul>
              <li className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectTownship('all')}>All Townships</li>
              {townships.map(t => (
                <li key={t} className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSelectTownship(t)}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Render Categories */}
      {filteredShops.length === 0 ? (
        <div className="mb-4 text-sm text-gray-600">
          <div>{selectedProvision === 'all' ? 'No coffee shops found.' : `No coffeeshop found in ${selectedProvision}`}</div>
        </div>
      ) : null}
      {renderCategory('Recommended', recommendedShops)}
      {renderCategory('Popular', popularShops)}

      {/* Tag sections (featured + dynamic) */}
      {tagSections.map((section) => (
        <div key={section.key}>{renderCategory(section.label, section.shops)}</div>
      ))}

      {selectedCoffeeShop && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center z-50">Loading...</div>}>
          <CoffeeShopDetail coffeeShop={selectedCoffeeShop} onClose={() => setSelectedCoffeeShop(null)} />
        </Suspense>
      )}
    </div>
  );
};
