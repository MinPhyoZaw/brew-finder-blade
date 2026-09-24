import type { LucideIcon } from 'lucide-react';
export interface MoodCardProps { label: string; image: string; Icon: LucideIcon; onSelect: () => void; }
export function MoodCard({ label, image, Icon, onSelect }: MoodCardProps) { return <button onClick={onSelect} className="mood-card group" aria-label={`Browse cafés for ${label}`}><img src={image} alt="" loading="lazy" width="280" height="360" /><span className="mood-overlay" /><span className="relative z-10 flex h-full flex-col items-start justify-end p-5 text-white"><Icon className="mb-3 h-6 w-6" /><strong>{label}</strong></span></button>; }
