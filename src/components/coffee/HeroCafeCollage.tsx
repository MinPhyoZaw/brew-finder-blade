import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { FALLBACK_CAFE_IMAGES, prepareCollageImages } from '../../utils/coffeeShopImages';

export interface HeroCafeCollageProps { images: unknown[]; }
const ALTS = ['Warm modern café interior', 'Outdoor garden café', 'Welcoming café storefront', 'A fresh latte'];
const PANELS = [
  'col-start-1 col-end-8 row-start-1 row-end-8 overflow-hidden rounded-[28px_14px_36px_14px] sm:rounded-[44px_24px_68px_24px]',
  'col-start-8 col-end-13 row-start-1 row-end-6 overflow-hidden rounded-[14px_28px_14px_36px] sm:rounded-[28px_48px_28px_64px]',
  'col-start-1 col-end-8 row-start-8 row-end-13 overflow-hidden rounded-[14px_36px_18px_28px] sm:rounded-[24px_60px_28px_48px]',
  'col-start-8 col-end-13 row-start-6 row-end-13 overflow-hidden rounded-[36px_14px_28px_18px] sm:rounded-[64px_24px_48px_28px]',
];
export function HeroCafeCollage({ images }: HeroCafeCollageProps) {
  const sources = useMemo(() => prepareCollageImages(images), [images]);
  return <figure className="relative h-[280px] w-full min-w-0 max-w-full overflow-hidden sm:h-[370px] lg:h-[430px]" aria-label="Yangon café highlights">
    <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-2 sm:gap-3">{sources.map((source, index) => <div key={`${source}-${index}`} className={PANELS[index]}><img src={source} alt={ALTS[index]} className="h-full w-full object-cover" loading={index ? 'lazy' : 'eager'} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_CAFE_IMAGES[index]; }} /></div>)}</div>
    <figcaption className="absolute bottom-2 left-2 z-10 flex max-w-[58%] items-center gap-1 rounded-2xl bg-[#3A2318]/90 px-2 py-1.5 text-[10px] font-semibold leading-3 text-white shadow-md sm:bottom-4 sm:left-4 sm:max-w-[60%] sm:rounded-full sm:px-4 sm:py-2 sm:text-sm"><MapPin className="h-4 w-4 shrink-0 text-[#D47A45]" /><span>Yangon’s café culture awaits</span></figcaption>
  </figure>;
}
