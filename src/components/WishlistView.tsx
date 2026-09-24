import React, { lazy, Suspense, useState } from 'react';
import { Home, Coffee, Star, MapPin, Clock, Trash2, Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
const CoffeeShopDetail = lazy(() => import('./RestaurantDetail').then(m => ({ default: m.CoffeeShopDetail })));
import { LoadingSpinner } from './LoadingSpinner';
import type { User } from '../types/auth';
import type { CoffeeShop } from '../types/restaurant';

interface WishlistViewProps {
  user: User;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ user }) => {
  const { favorites, loading, toggleFavorite } = useFavorites(user);
  const [selectedCoffeeShop, setSelectedCoffeeShop] = useState<CoffeeShop | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (favorites.length === 0) {
    return (
      <div className="py-8 text-center sm:py-16">
          <div className="rounded-xl border border-coffee-200 bg-cream-50 p-6 shadow-sm sm:p-12">
          <Home className="mx-auto mb-4 h-12 w-12 text-coffee-300 sm:mb-6 sm:h-16 sm:w-16" />
          <h2 className="text-xl sm:text-2xl font-bold text-coffee-900 mb-4 font-serif">Your Brew List is Empty</h2>
          <p className="mb-6 text-sm text-coffee-600 sm:text-lg">
            Start adding coffee shops to your brew list to see them here!
          </p>
          <div className="flex min-w-0 items-start justify-center gap-2 text-xs text-coffee-500 sm:text-sm">
            <Coffee className="w-4 h-4" />
            <span>Browse coffee shops and click the heart icon to add favorites</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-coffee-200 bg-cream-50 p-4 shadow-sm sm:p-6">
        <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center">
            <Heart className="w-6 h-6 text-coffee-600 mr-3 fill-current" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-coffee-900 font-serif">My Brew List</h1>
              <p className="text-coffee-600">
                {favorites.length} favorite coffee shop{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-coffee-200 px-2.5 py-1.5 sm:px-4 sm:py-2">
            <span className="text-coffee-800 font-medium text-sm">
              {favorites.length} saved
            </span>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-1">
        {favorites.map(coffeeShop => (
          <div 
            key={coffeeShop.id}
            className="group min-w-0 overflow-hidden rounded-2xl border border-coffee-200 bg-cream-50 shadow-lg transition-all duration-500 hover:shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative aspect-[16/9] w-full flex-shrink-0 overflow-hidden sm:h-auto sm:w-48 sm:aspect-auto">
                {/* 3D Coffee Cup Overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="relative">
                    {/* Coffee Cup 3D Effect */}
                    <div className="w-12 h-12 bg-gradient-to-br from-coffee-600 via-coffee-700 to-coffee-800 rounded-lg shadow-lg transform rotate-12 group-hover:rotate-6 transition-transform duration-300">
                      <div className="absolute inset-1 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-md">
                        <div className="absolute inset-1 bg-gradient-to-br from-coffee-400 to-coffee-500 rounded-sm">
                          <div className="absolute top-1 left-1 w-2 h-2 bg-white/30 rounded-full"></div>
                        </div>
                      </div>
                      {/* Handle */}
                      <div className="absolute -right-1 top-2 w-3 h-6 border-2 border-coffee-700 rounded-r-full bg-transparent"></div>
                      {/* Steam */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-0.5 h-3 bg-white/40 rounded-full animate-pulse"></div>
                        <div className="w-0.5 h-2 bg-white/30 rounded-full ml-1 -mt-2 animate-pulse delay-150"></div>
                        <div className="w-0.5 h-2.5 bg-white/20 rounded-full -ml-1.5 -mt-1.5 animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <img
                  src={coffeeShop.images?.[0] || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'}
                  alt={coffeeShop.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover sm:rounded-l-2xl group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* distance removed per UX request */}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col justify-between bg-gradient-to-br from-cream-50 to-coffee-50/50 p-4 sm:p-6">
                <div onClick={() => setSelectedCoffeeShop(coffeeShop)}>
                  <div className="mb-2 flex min-w-0 items-start justify-between gap-2 sm:mb-3">
                    <h3 className="min-w-0 break-words text-lg font-bold text-coffee-900 line-clamp-2 group-hover:text-coffee-600 transition-colors duration-300 font-serif sm:text-xl">
                      {coffeeShop.name}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-cream-200 px-2 py-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-cream-500 text-cream-500" />
                      <span className="text-xs sm:text-sm font-medium text-coffee-700">
                        {coffeeShop.rating}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-coffee-600 text-sm mb-2 sm:mb-3 font-medium">
                    {coffeeShop.type} • {coffeeShop.priceRange}
                  </p>
                  
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-coffee-500 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-coffee-400" />
                      <span className="min-w-0 break-words line-clamp-2">{coffeeShop.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-coffee-400" />
                      <span className="min-w-0 break-words">{coffeeShop.hours || 'Hours not available'}</span>
                    </div>
                  </div>

                  {coffeeShop.description && (
                    <p className="text-coffee-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {coffeeShop.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-coffee-200">
                  <button
                    onClick={() => setSelectedCoffeeShop(coffeeShop)}
                    className="bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-cream-100 px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(coffeeShop.id);
                    }}
                    className="flex items-center justify-center space-x-2 text-coffee-600 hover:text-coffee-700 hover:bg-coffee-100 px-3 py-2 rounded-lg transition-all duration-300 border border-coffee-300 hover:border-coffee-400 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coffee Shop Detail Modal (lazy) */}
      {selectedCoffeeShop && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center z-50">Loading...</div>}>
          <CoffeeShopDetail
            coffeeShop={selectedCoffeeShop}
            onClose={() => setSelectedCoffeeShop(null)}
          />
        </Suspense>
      )}
    </div>
  );
};
