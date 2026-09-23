import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Coffee, Download, Heart, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../types/auth';

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }

export const SiteNavbar = ({ user, onSignIn, onSignOut, onHome, onWishlist }: { user: User | null; onSignIn: () => void; onSignOut: () => void; onHome: () => void; onWishlist: () => void }) => {
  const [profile, setProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfile(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, []);
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[#4A2D1F] text-white shadow-sm">
    <nav className="page-shell flex h-18 items-center justify-between" aria-label="Main navigation">
      <button onClick={onHome} className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><img src="/brew-logo.png" alt="" width="40" height="40" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/25" /><span className="text-lg font-bold tracking-tight">Brew Finder</span></button>
      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={onWishlist} aria-label="Open wishlist" className="nav-icon sm:w-auto sm:gap-2 sm:px-3"><Heart /><span className="hidden sm:inline">Wishlist</span></button>
        <button aria-label="Notifications" className="nav-icon hidden sm:grid"><Bell /></button>
        {user ? <div className="relative" ref={profileRef}><button onClick={() => setProfile(!profile)} aria-expanded={profile} className="flex min-h-11 items-center gap-2 rounded-full px-1.5 hover:bg-white/10"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#B5663D] text-sm font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span><ChevronDown className="hidden h-4 w-4 sm:block" /></button>{profile && <div className="absolute right-0 top-14 w-64 rounded-2xl border border-[#EAE3D8] bg-white p-2 text-[#241711] shadow-xl"><div className="border-b border-[#EAE3D8] px-3 py-3"><p className="truncate font-bold">{user.name}</p><p className="truncate text-xs text-[#6F675F]">{user.email}</p></div><button onClick={onWishlist} className="menu-item"><Heart />My wishlist</button><button onClick={onSignOut} className="menu-item text-red-700"><LogOut />Log out</button></div>}</div> : <button onClick={onSignIn} className="ml-1 min-h-11 rounded-full bg-[#FAF7F0] px-4 text-sm font-bold text-[#4A2D1F]"><span className="hidden sm:inline">Sign in</span><UserIcon className="h-5 w-5 sm:hidden" /></button>}
      </div>
    </nav>
  </header>;
};

export const PwaInstallBanner = () => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) return;
    const ready = (event: Event) => { event.preventDefault(); setPrompt(event as BeforeInstallPromptEvent); };
    const installed = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', ready); window.addEventListener('appinstalled', installed);
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', installed); };
  }, []);
  if (!prompt) return null;
  const install = async () => { await prompt.prompt(); await prompt.userChoice; setPrompt(null); };
  return <aside className="page-shell pb-12"><div className="flex flex-col gap-5 rounded-[24px] bg-[#4A2D1F] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10"><Coffee /></span><div><h2 className="text-xl font-bold">Take Brew Finder with you</h2><p className="mt-1 text-sm text-[#E9DDD5]">Install our app for a faster, smoother experience.</p></div></div><button onClick={install} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-[#4A2D1F]"><Download className="h-4 w-4" />Install App</button></div></aside>;
};

export const SiteFooter = ({ onHome }: { onHome: () => void }) => <footer className="border-t border-[#EAE3D8] bg-[#FFFEFB]"><div className="page-shell py-10"><div className="flex flex-col justify-between gap-8 md:flex-row"><button onClick={onHome} className="flex items-center gap-3 self-start text-left"><img src="/brew-logo.png" alt="Brew Finder" width="44" height="44" className="h-11 w-11 rounded-full" /><span><strong className="block text-lg">Brew Finder</strong><span className="text-sm text-[#6F675F]">Good Coffee. A Brighter Yangon.</span></span></button><nav className="flex flex-wrap gap-x-7 gap-y-4 text-sm font-semibold text-[#6F675F]" aria-label="Footer"><a href="#about">About</a><a href="mailto:hello@brewfinder.app">Contact</a><a href="mailto:hello@brewfinder.app?subject=Suggest a Café">Suggest a Café</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></nav></div><div className="mt-9 border-t border-[#EAE3D8] pt-6 text-sm text-[#6F675F]">Made for Yangon</div></div></footer>;
