import React, { useState } from 'react';
import { Home, Coffee, Star, MapPin, Clock, Trash2, Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { CoffeeShopDetail } from './RestaurantDetail';
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
      <div className="text-center py-16">
          <div className="bg-cream-50 rounded-xl shadow-sm p-12 border border-coffee-200">
          <Home className="w-16 h-16 text-coffee-300 mx-auto mb-6" />
          <h2 className="text-xl sm:text-2xl font-bold text-coffee-900 mb-4 font-serif">Your Brew List is Empty</h2>
          <p className="text-coffee-600 text-lg mb-6">
            Start adding coffee shops to your brew list to see them here!
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-coffee-500">
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
      <div className="bg-cream-50 rounded-xl shadow-sm border border-coffee-200 p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
            <Heart className="w-6 h-6 text-coffee-600 mr-3 fill-current" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-coffee-900 font-serif">My Brew List</h1>
              <p className="text-coffee-600">
                {favorites.length} favorite coffee shop{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="bg-coffee-200 px-4 py-2 rounded-full">
            <span className="text-coffee-800 font-medium text-sm">
              {favorites.length} saved
            </span>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
        {favorites.map(coffeeShop => (
          <div 
            key={coffeeShop.id}
            className="group bg-cream-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] border border-coffee-200 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative w-full sm:w-48 h-48 sm:h-48 flex-shrink-0 overflow-hidden">
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
                  className="w-full h-full object-cover sm:rounded-l-2xl group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {coffeeShop.distance !== undefined && (
                  <div className="absolute bottom-4 right-4 bg-coffee-600/90 backdrop-blur-sm text-cream-100 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    {coffeeShop.distance.toFixed(1)} km
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-cream-50 to-coffee-50/50">
                <div onClick={() => setSelectedCoffeeShop(coffeeShop)}>
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-coffee-900 line-clamp-1 group-hover:text-coffee-600 transition-colors duration-300 font-serif">
                      {coffeeShop.name}
                    </h3>
                    <div className="flex items-center gap-1 ml-2 sm:ml-3 bg-cream-200 px-2 py-1 rounded-full">
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
                      <span className="line-clamp-1">{coffeeShop.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-coffee-400" />
                      <span>{coffeeShop.hours || 'Hours not available'}</span>
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

      {/* Coffee Shop Detail Modal */}
      {selectedCoffeeShop && (
        <CoffeeShopDetail
          coffeeShop={selectedCoffeeShop}
          onClose={() => setSelectedCoffeeShop(null)}
        />
      )}
    </div>
  );
};