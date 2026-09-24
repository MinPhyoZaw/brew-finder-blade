import type { CoffeeShop } from '../types/restaurant';

export const hasValidCoordinates = (shop: CoffeeShop) => Number.isFinite(shop.latitude)
  && Number.isFinite(shop.longitude) && shop.latitude >= -90 && shop.latitude <= 90
  && shop.longitude >= -180 && shop.longitude <= 180;

export const createDirectionsUrl = (shop: CoffeeShop) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${shop.latitude},${shop.longitude}`)}`;

export const formatDistance = (distance?: number) => distance == null ? '' : `${distance.toFixed(1)} km`;
