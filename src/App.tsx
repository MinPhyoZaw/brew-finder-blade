import React, { useState } from 'react';
import { User, LogOut, Heart, ChevronDown, Home } from 'lucide-react';
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
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[#FAF3E0] font-serif">
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

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#FFF8ED] rounded-lg shadow-lg border border-[#E6D1B5] py-2 z-50">
                        <div className="px-4 py-3 border-b border-[#EBD7B3]">
                          <p className="text-sm font-medium text-[#2D2424] truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-[#6F4E37]/80 truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-[#6F4E37] hover:bg-[#FAE3C6] flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
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
            <CoffeeShopList userLocation={location} user={user} locationAllowed={!!location && !error} refetchLocation={refetch} />
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