import { BookOpen, Coffee, SlidersHorizontal, Sparkles, Sun, Wifi } from 'lucide-react';

export interface FilterChipsProps { active: string | null; onChange: (value: string | null) => void; }

const FILTERS = [
  { key: 'open', label: 'Open now', Icon: Coffee }, { key: 'quiet', label: 'Quiet', Icon: BookOpen },
  { key: 'outdoor', label: 'Outdoor', Icon: Sun }, { key: 'wifi', label: 'Wi-Fi', Icon: Wifi },
  { key: 'specialty', label: 'Specialty coffee', Icon: Sparkles },
];

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return <div className="no-scrollbar mt-4 flex w-full min-w-0 gap-2 overflow-x-auto pb-2" aria-label="Quick filters">
    {FILTERS.map(({ key, label, Icon }) => <button key={key} aria-pressed={active === key} onClick={() => onChange(active === key ? null : key)} className={`filter-chip shrink-0 ${active === key ? 'filter-chip-active' : ''}`}><Icon className="h-4 w-4" />{label}</button>)}
    <button className="filter-chip mr-1 shrink-0" onClick={() => document.querySelector<HTMLSelectElement>('select[aria-label="Select township"]')?.focus()}><SlidersHorizontal className="h-4 w-4" />More filters</button>
  </div>;
}
