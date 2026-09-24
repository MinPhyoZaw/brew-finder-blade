import { useMemo } from 'react';
import { Navigation } from 'lucide-react';
import type { CoffeeShop, UserLocation } from '../../types/restaurant';
import { createDirectionsUrl, formatDistance } from '../../utils/coffeeShopDistance';
import { getCoffeeShopImage } from '../../utils/coffeeShopImages';
export interface NearbyMapProps { shops: CoffeeShop[]; location?: UserLocation | null; selected: CoffeeShop | null; onSelect: (shop: CoffeeShop) => void; onOpen: (shop: CoffeeShop) => void; }
export function NearbyMap({ shops, location, selected, onSelect, onOpen }: NearbyMapProps) {
  const center = selected ?? (location ? { latitude: location.latitude, longitude: location.longitude } : undefined);
  const mapUrl = useMemo(() => { const lat = center?.latitude ?? 16.8409; const lon = center?.longitude ?? 96.1735; const delta = .045; return `https://www.openstreetmap.org/export/embed.html?bbox=${lon-delta}%2C${lat-delta}%2C${lon+delta}%2C${lat+delta}&layer=mapnik&marker=${lat}%2C${lon}`; }, [center?.latitude, center?.longitude]);
  return <div className="relative h-[360px] min-w-0 overflow-hidden bg-[#E6E0D2] sm:h-[420px] lg:h-full lg:min-h-[500px]"><iframe key={mapUrl} title="Interactive map of nearby Yangon cafés" src={mapUrl} className="h-full w-full border-0" loading="lazy" />
    <div className="no-scrollbar absolute left-2 right-2 top-2 z-10 flex gap-1.5 overflow-x-auto rounded-xl bg-white/90 p-1.5 shadow sm:hidden">{shops.map((shop) => <button key={shop.id} onClick={() => onSelect(shop)} className="shrink-0 rounded-full bg-[#28613E] px-2.5 py-1.5 text-[10px] font-bold text-white">{shop.name}</button>)}</div>
    {selected && <div className="absolute bottom-3 left-3 right-3 z-10 flex min-w-0 items-center gap-2 rounded-2xl bg-white p-2.5 text-[#241711] shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-[calc(100%-2rem)]"><img src={getCoffeeShopImage(selected)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14" /><button onClick={() => onOpen(selected)} className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm">{selected.name}</strong><span className="block truncate text-xs text-[#6F675F]">{selected.distance != null && `${formatDistance(selected.distance)} · `}{selected.provision || selected.address}</span></button><a href={createDirectionsUrl(selected)} target="_blank" rel="noreferrer" title="Get directions" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#28613E] text-white sm:flex sm:w-auto sm:gap-2 sm:px-4"><Navigation className="h-4 w-4" /><span className="hidden text-xs font-bold sm:inline">Directions</span></a></div>}
  </div>;
}
