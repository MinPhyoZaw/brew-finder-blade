import React, { useState } from 'react';
import { User, LogOut, Heart, ChevronDown, Home, X } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';
import { useAuth } from './hooks/useAuth';
import { CoffeeShopList } from './components/RestaurantList';
import { WishlistView } from './components/WishlistView';
import { LocationStatus } from './components/LocationStatus';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';
// import { AddCoffeeShopForm } from './components/AddCoffeeShopForm';

function App() {
  const { location, loading, error, refetch } = useGeolocation();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setShowWishlist(false);
    // setTimeout(() => {
    //   window.location.reload();
    // }, 100);
  };

  return (
    
    <div className="min-h-screen bg-[#FAF3E0] text-[#2D2424]">
      <header className="bg-[#6F4E37] shadow-md border-b border-[#5C4033]" role="banner">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Left side: Back (mobile) + Logo and title */}
            <div className="flex items-center min-w-0 flex-1">
              {/* Removed back button from wishlist view to simplify mobile workflow */}
              <img
                src="/brew-logo.png"
                alt="Brew Finder logo"
                width="48"
                height="48"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-4 object-cover border-2 border-[#D4A373]"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.onerror = null;
                  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='120' height='120'><rect x='2' y='6' width='14' height='10' rx='2' fill='%23F6E8D8' stroke='%236F4E37' stroke-width='1.2'/><path d='M6 3v4' stroke='%236F4E37' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/><path d='M19 9a3 3 0 0 0-3-3' stroke='%236F4E37' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
                  el.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                }}
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[#FAF3E0] logo-font">
                  Brew Finder
                </h1>
                <p className="text-[#EEDAC5] text-sm sm:text-base hidden sm:block italic">
                  {user
                    ? `Welcome back, ${user.name}`
                    : 'Find your perfect cup — one café at a time.'}
                </p>
              </div>
            </div>

            {/* Right side: User actions */}
            <div className="flex items-center space-x-3 sm:space-x-4 ml-4">
              {user ? (
                <div className="flex items-center space-x-3 relative">
                  <button
                    onClick={() => setShowWishlist(!showWishlist)}
                    aria-label={showWishlist ? 'Go to home' : 'View wishlist'}
                    aria-pressed={showWishlist}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      showWishlist
                        ? 'bg-[#D4A373] text-[#2D2424] shadow-inner'
                        : 'bg-[#FAF3E0] text-[#6F4E37] hover:bg-[#EBD7B3]'
                    }`}
                  >
                    {showWishlist ? (
                      <Home className="w-4 h-4" />
                    ) : (
                      <Heart className={`w-4 h-4 ${showWishlist ? 'fill-[#6F4E37]' : ''}`} />
                    )}
                    <span className="hidden sm:inline">
                      {showWishlist ? 'Home' : 'Wishlist'}
                    </span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 bg-[#D4A373] hover:bg-[#C69C72] px-4 py-2 rounded-full text-[#2D2424] font-medium transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-[#6F4E37] rounded-full flex items-center justify-center">
                        <span className="text-[#FAF3E0] font-semibold">
                         {(user?.name || user?.email || '?').charAt(0).toUpperCase()}

                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#2D2424]" />
                    </button>

                    {/* The user menu is shown as a slide-in pane from the right (rendered outside header) */}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-[#D4A373] hover:bg-[#C69C72] text-[#2D2424] px-4 py-2 rounded-full font-medium transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Get Started</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}

      {/* Slide-in user pane from the right */}
      {user && (
        <aside
          className={`fixed top-0 right-0 h-full z-50 shadow-2xl border-l border-[#E6D1B5] bg-[#FFF8ED] transform transition-transform duration-300 ease-in-out ${showUserMenu ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: '50vw', minWidth: 300 }}
          aria-label="User panel"
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-[#EBD7B3] flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#6F4E37] rounded-full flex items-center justify-center text-[#FAF3E0] font-semibold text-lg">
                  {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#2D2424] truncate">{user.name || user.email}</p>
                  <p className="text-xs text-[#6F4E37]/80 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                aria-label="Close user panel"
                className="p-2 rounded hover:bg-coffee-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-coffee-500" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              <button
                onClick={() => {
                  setShowWishlist(true);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#C69C72] text-[#2D2424] py-3 rounded-lg font-medium"
              >
                <Heart className="w-4 h-4" />
                My Wishlist
              </button>

              {/* Additional quick links could go here */}
              
            </div>

            <div className="p-4 border-t border-[#EBD7B3]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-[#6F4E37] border border-[#E6D1B5] rounded-lg hover:bg-[#FAE3C6]"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </aside>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8" role="main">
        {showWishlist && user ? (
          <WishlistView user={user} />
        ) : (
          <>
            <LocationStatus
              location={location}
              loading={loading}
              error={error}
              onRetry={refetch}
            />
            <CoffeeShopList user={user} />
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
    
  );
}

export default App;