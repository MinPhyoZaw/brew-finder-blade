import { BookOpen, Camera, Coffee, Heart, PartyPopper, Users } from 'lucide-react';
import type { CoffeeShop } from '../../types/restaurant';
import { getCoffeeShopImage } from '../../utils/coffeeShopImages';
import { normalizeFilterValue } from '../../utils/coffeeShopFilters';
import { MoodCard } from './MoodCard';
import { SectionHeader } from './SectionHeader';
const MOODS = [{ key: 'first_date', label: 'First Date', Icon: Heart }, { key: 'study_spot', label: 'Study Spot', Icon: BookOpen }, { key: 'group_hangout', label: 'Group Hangout', Icon: PartyPopper }, { key: 'photograph', label: 'Photograph', Icon: Camera }, { key: 'family', label: 'Family', Icon: Users }, { key: 'relax_chill', label: 'Relax & Chill', Icon: Coffee }];
export interface MoodSectionProps { shops: CoffeeShop[]; onSelect: (filter: string) => void; }
export function MoodSection({ shops, onSelect }: MoodSectionProps) { return <section id="collections" className="bg-[#F2ECE2]"><div className="page-shell section-space"><SectionHeader title="Browse by mood" text="Find the right café for your moment." /><div className="mood-grid mt-8">{MOODS.map(({ key, label, Icon }, index) => { const match = shops.find((shop) => (shop.tags ?? []).map(normalizeFilterValue).includes(key)) ?? shops[index % Math.max(shops.length, 1)]; return <MoodCard key={key} label={label} Icon={Icon} image={getCoffeeShopImage(match)} onSelect={() => onSelect(key)} />; })}</div></div></section>; }
