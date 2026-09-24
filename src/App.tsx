import { useState } from 'react';
import { AuthModal } from './components/auth/AuthModal';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteNavbar } from './components/layout/SiteNavbar';
import { PwaInstallBanner } from './components/layout/PwaInstallBanner';
import { CoffeeShopList } from './components/RestaurantList';
import { WishlistView } from './components/WishlistView';
import { useAuth } from './hooks/useAuth';
import { useGeolocation } from './hooks/useGeolocation';

function App() {
  const { user, signOut } = useAuth();
  const { location, loading: locationLoading, error: locationError, refetch } = useGeolocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<'home' | 'wishlist'>('home');

  const navigateHome = () => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const navigateWishlist = () => user ? setView('wishlist') : setAuthOpen(true);

  return <div className="min-h-screen bg-[#FAF7F0] text-[#241711]">
    <SiteNavbar user={user} onSignIn={() => setAuthOpen(true)} onSignOut={async () => { await signOut(); navigateHome(); }} onHome={navigateHome} onWishlist={navigateWishlist} />
    <main>
      {view === 'wishlist' && user
        ? <div className="page-shell min-h-[70vh] py-6 sm:py-10"><button onClick={navigateHome} className="mb-4 min-h-11 text-sm font-bold text-[#28613E] sm:mb-6">← Back to discover</button><WishlistView user={user} /></div>
        : <CoffeeShopList user={user} location={location} locationLoading={locationLoading} locationError={locationError} onRequestLocation={refetch} />}
    </main>
    {view === 'home' && <><PwaInstallBanner /><SiteFooter onHome={navigateHome} /></>}
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
  </div>;
}

export default App;
