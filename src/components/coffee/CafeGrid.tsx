import { Coffee } from 'lucide-react';
import type { CoffeeShop } from '../../types/restaurant';
import { CafeCard } from './CafeCard';
export interface CafeGridProps { shops: CoffeeShop[]; canFavorite: boolean; isFavorite: (id: string) => boolean; onFavorite: (id: string) => void; onOpen: (shop: CoffeeShop) => void; onClear: () => void; }
export function CafeGrid({ shops, canFavorite, isFavorite, onFavorite, onOpen, onClear }: CafeGridProps) {
  if (!shops.length) return <div className="mt-8 rounded-3xl border border-dashed border-[#D8CEC0] p-8 text-center sm:p-12"><Coffee className="mx-auto mb-3 h-8 w-8 text-[#B5663D]" /><h3 className="font-bold">No cafés match those filters</h3><p className="mt-2 text-sm text-[#6F675F]">Try another township, mood, or search term.</p><button className="mt-5 text-sm font-bold text-[#28613E]" onClick={onClear}>Clear all filters</button></div>;
  return <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3 lg:gap-6">{shops.map((shop) => <CafeCard key={shop.id} shop={shop} favorite={isFavorite(shop.id)} canFavorite={canFavorite} onFavorite={() => onFavorite(shop.id)} onOpen={() => onOpen(shop)} />)}</div>;
}
