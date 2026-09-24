import type { CoffeeShop } from '../types/restaurant';

export const normalizeFilterValue = (value = '') =>
  value.toLowerCase().replace(/\s*&\s*/g, '_').replace(/[\s-]+/g, '_');

export interface CoffeeShopFilters {
  search: string;
  township: string;
  activeFilter: string | null;
}

export const matchesCoffeeShopFilters = (shop: CoffeeShop, filters: CoffeeShopFilters) => {
  const { search, township, activeFilter } = filters;
  const haystack = [shop.name, shop.provision, shop.address, shop.type, ...(shop.tags ?? [])].join(' ').toLowerCase();
  if (search && !haystack.includes(search.toLowerCase())) return false;
  if (township !== 'all' && normalizeFilterValue(shop.provision) !== normalizeFilterValue(township)) return false;
  if (!activeFilter) return true;
  const tags = (shop.tags ?? []).map(normalizeFilterValue);
  if (activeFilter === 'open') return Boolean(shop.hours) && !normalizeFilterValue(shop.hours).includes('closed');
  if (activeFilter === 'specialty') return normalizeFilterValue(shop.type).includes('specialty');
  if (activeFilter === 'wifi') return tags.some((tag) => tag.includes('wifi') || tag.includes('wi_fi'));
  if (activeFilter === 'quiet') return tags.some((tag) => tag.includes('quiet') || tag.includes('study'));
  if (activeFilter === 'outdoor') return tags.some((tag) => tag.includes('outdoor'));
  return tags.includes(activeFilter);
};
