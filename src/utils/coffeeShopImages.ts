import type { CoffeeShop } from '../types/restaurant';

export const FALLBACK_CAFE_IMAGES = [
  'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg',
  'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg',
  'https://images.pexels.com/photos/2467287/pexels-photo-2467287.jpeg',
  'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
] as const;

export const isValidImageUrl = (source: unknown): source is string =>
  typeof source === 'string' && Boolean(source.trim()) &&
  (source.trim().startsWith('/') || source.trim().startsWith('data:image/') || /^https?:\/\//i.test(source.trim()));

export const getCoffeeShopImage = (shop?: CoffeeShop) =>
  shop?.images?.find(isValidImageUrl) ?? FALLBACK_CAFE_IMAGES[3];

export const prepareCollageImages = (images: unknown[]): string[] => {
  const prepared = Array.from(new Set(images.filter(isValidImageUrl).map((image) => image.trim())));
  FALLBACK_CAFE_IMAGES.forEach((fallback) => {
    if (prepared.length < 4 && !prepared.includes(fallback)) prepared.push(fallback);
  });
  return prepared.slice(0, 4);
};
