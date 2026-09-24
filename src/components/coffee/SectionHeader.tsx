import { ChevronRight } from 'lucide-react';
export interface SectionHeaderProps { title: string; text: string; action?: string; onAction?: () => void; }
export function SectionHeader({ title, text, action, onAction }: SectionHeaderProps) {
  return <div className="flex min-w-0 items-start justify-between gap-2 sm:items-end sm:gap-5"><div className="min-w-0"><h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h2><p className="mt-2 text-sm text-[#6F675F] sm:text-base">{text}</p></div>{action && <button onClick={onAction} className="flex min-h-10 shrink-0 items-center rounded-full px-2 text-xs font-bold text-[#28613E] sm:px-3 sm:text-sm">{action}<ChevronRight className="h-4 w-4" /></button>}</div>;
}
