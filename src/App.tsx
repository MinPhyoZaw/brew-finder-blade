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
    
    <div className="min-h-screen bg-vintage-50 text-vintage-950">
      {/* Header */}
      <header className="bg-vintage-800 shadow-lg border-b-4 border-vintage-700" style={{boxShadow: '0 4px 6px -1px rgba(42, 35, 28, 0.3)'}}>
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Left side: Back (mobile) + Logo and title */}
            <div className="flex items-center min-w-0 flex-1">
              {/* Removed back button from wishlist view to simplify mobile workflow */}
              <img
                src="/brew-logo.png"
                alt="Brew Finder"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm mr-4 object-cover border-2 border-sepia-400"
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-vintage-50 font-serif" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>
                  Brew Finder
                </h1>
                <p className="text-vintage-200 text-sm sm:text-base hidden sm:block font-serif" style={{fontStyle: 'italic'}}>
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
                    aria-label={showWishlist ? 'Home' : 'Wishlist'}
                    className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200 border-2 ${
                      showWishlist
                        ? 'bg-sepia-400 text-vintage-950 shadow-inner border-sepia-600'
                        : 'bg-vintage-100 text-vintage-800 hover:bg-vintage-200 border-vintage-400'
                    }`}
                  >
                    {showWishlist ? (
                      <Home className="w-4 h-4" />
                    ) : (
                      <Heart className={`w-4 h-4 ${showWishlist ? 'fill-vintage-800' : ''}`} />
                    )}
                    <span className="hidden sm:inline">
                      {showWishlist ? 'Home' : 'Wishlist'}
                    </span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 bg-sepia-400 hover:bg-sepia-500 px-4 py-2 rounded text-vintage-950 font-medium transition-all duration-200 border-2 border-sepia-600"
                    >
                      <div className="w-8 h-8 bg-vintage-700 rounded-sm flex items-center justify-center border border-vintage-600">
                        <span className="text-vintage-50 font-semibold">
                         {(user?.name || user?.email || '?').charAt(0).toUpperCase()}

                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-vintage-950" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-vintage-50 rounded shadow-lg border-2 border-vintage-400 py-2 z-50">
                        <div className="px-4 py-3 border-b-2 border-vintage-300">
                          <p className="text-sm font-medium text-vintage-950 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-vintage-700 truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-vintage-800 hover:bg-vintage-200 flex items-center"
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
                  className="flex items-center space-x-2 bg-sepia-400 hover:bg-sepia-500 text-vintage-950 px-4 py-2 rounded font-medium transition-colors duration-200 border-2 border-sepia-600"
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
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