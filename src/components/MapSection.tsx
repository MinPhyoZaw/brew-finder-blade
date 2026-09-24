import { useMemo, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { CoffeeShop, UserLocation } from '../types/restaurant';

interface MapSectionProps {
  shops: CoffeeShop[];
  location?: UserLocation | null;
  onRequestLocation?: () => void;
  onOpen: (shop: CoffeeShop) => void;
}

export function MapSection({ shops, location, onRequestLocation, onOpen }: MapSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = shops.slice(0, 5);
  const selected = visible.find((shop) => shop.id === selectedId) || visible[0];
  const center = selected || (location ? { latitude: location.latitude, longitude: location.longitude } : null);
  const mapUrl = useMemo(() => {
    const lat = center?.latitude ?? 16.8409;
    const lon = center?.longitude ?? 96.1735;
    const delta = 0.045;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lon}`;
  }, [center?.latitude, center?.longitude]);

  const directions = (shop: CoffeeShop) => {
    const destination = `${shop.name} ${shop.address || ''}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank', 'noopener');
  };

  return <section id="map" className="page-shell section-space">
    <div className="min-w-0 overflow-hidden rounded-[24px] bg-[#28613E] text-white sm:rounded-[28px] lg:grid lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
      <div className="min-w-0 p-6 sm:p-10 lg:p-12">
        <p className="text-xs font-bold tracking-[.18em] text-[#C9DFC8]">YOUR NEXT CUP, CLOSER</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Explore nearby</h2>
        <p className="mt-3 max-w-md text-sm text-[#E1EBE1] sm:text-base">Choose a café to move the interactive map, then get directions when you are ready.</p>
        <div className="no-scrollbar mt-5 flex max-w-full gap-2 overflow-x-auto pb-1 lg:flex-wrap" aria-label="Cafés on the map">
          {visible.map((shop) => <button key={shop.id} onClick={() => setSelectedId(shop.id)} aria-pressed={selected?.id === shop.id} className="shrink-0 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 aria-pressed:bg-white aria-pressed:text-[#28613E]">{shop.name}</button>)}
        </div>
        <button onClick={onRequestLocation} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 font-bold text-[#28613E] sm:w-auto"><MapPin className="h-4 w-4 shrink-0" />{location ? 'Refresh location' : 'Use my location'}</button>
      </div>
      <div className="relative h-[360px] min-w-0 overflow-hidden bg-[#E6E0D2] sm:h-[420px] lg:h-full lg:min-h-[460px]">
        <iframe key={mapUrl} title="Interactive map of nearby Yangon cafés" src={mapUrl} className="h-full w-full border-0" loading="lazy" />
        {selected && <div className="absolute bottom-3 left-3 right-3 z-10 flex min-w-0 items-center gap-2 rounded-2xl bg-white p-2.5 text-[#241711] shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-[calc(100%-2rem)] sm:gap-3 sm:p-3">
          <img src={selected.images?.[0] || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14" />
          <button onClick={() => onOpen(selected)} className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm">{selected.name}</strong><span className="block truncate text-xs text-[#6F675F]">{selected.distance != null ? `${selected.distance.toFixed(1)} km · ` : ''}{selected.provision || selected.address}</span></button>
          <button onClick={() => directions(selected)} title="Get directions" aria-label={`Get directions to ${selected.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#28613E] text-white sm:flex sm:w-auto sm:gap-2 sm:px-4"><Navigation className="h-4 w-4" /><span className="hidden text-xs font-bold sm:inline">Directions</span></button>
        </div>}
      </div>
    </div>
  </section>;
}
