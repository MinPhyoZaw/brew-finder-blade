import { useMemo } from 'react';
import { MapPin } from 'lucide-react';

const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg',
  'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg',
  'https://images.pexels.com/photos/2467287/pexels-photo-2467287.jpeg',
  'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
] as const;

const IMAGE_ALTS = [
  'Warm modern café interior in Yangon',
  'Outdoor garden café in Yangon',
  'Welcoming Yangon café storefront',
  'Fresh latte being prepared by a barista',
] as const;

const isValidImageSource = (source: unknown): source is string => {
  if (typeof source !== 'string' || !source.trim()) return false;
  const value = source.trim();
  return value.startsWith('/') || value.startsWith('data:image/') || /^https?:\/\//i.test(value);
};

const prepareHeroImages = (images: unknown[]): string[] => {
  const uniqueImages = Array.from(new Set(images.filter(isValidImageSource).map((image) => image.trim())));
  for (const fallback of FALLBACK_IMAGES) {
    if (uniqueImages.length === 4) break;
    if (!uniqueImages.includes(fallback)) uniqueImages.push(fallback);
  }
  return uniqueImages.slice(0, 4);
};

export function HeroCafeCollage({ images }: { images: unknown[] }) {
  const sources = useMemo(() => prepareHeroImages(images), [images]);
  const panels = [
    'absolute left-0 top-0 h-[57%] w-[58%] overflow-hidden rounded-[28px_14px_36px_14px] bg-[#E9DFD1] sm:rounded-[44px_24px_68px_24px]',
    'absolute right-0 top-0 h-[42%] w-[39%] overflow-hidden rounded-[14px_28px_14px_36px] bg-[#E9DFD1] sm:rounded-[28px_48px_28px_64px]',
    'absolute bottom-0 left-0 h-[38%] w-[55%] overflow-hidden rounded-[14px_36px_18px_28px] bg-[#E9DFD1] sm:rounded-[24px_60px_28px_48px]',
    'absolute bottom-0 right-0 h-[53%] w-[42%] overflow-hidden rounded-[36px_14px_28px_18px] bg-[#E9DFD1] sm:rounded-[64px_24px_48px_28px]',
  ];

  return (
    <div className="relative h-[280px] w-full max-w-full min-w-0 sm:h-[340px] lg:h-[430px]" aria-label="Yangon café highlights">
      {sources.map((source, index) => (
        <div key={`${source}-${index}`} className={panels[index]}>
          <img
            src={source}
            alt={IMAGE_ALTS[index]}
            width={index === 3 ? 360 : 720}
            height={index === 3 ? 640 : 480}
            fetchPriority={index === 0 ? 'high' : undefined}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGES[index];
            }}
          />
        </div>
      ))}
      <div className="absolute bottom-2 left-2 z-10 flex max-w-[52%] items-center gap-1.5 rounded-2xl bg-[#3A2318]/90 px-2.5 py-1.5 text-[10px] font-semibold leading-3 text-white shadow-md backdrop-blur-sm sm:bottom-4 sm:left-4 sm:max-w-[60%] sm:gap-2 sm:rounded-full sm:px-4 sm:py-2 sm:text-sm sm:leading-4">
        <MapPin className="h-4 w-4 shrink-0 text-[#D47A45]" aria-hidden="true" />
        <span>Yangon’s café culture is waiting for you</span>
      </div>
    </div>
  );
}
