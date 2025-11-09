import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import type { CoffeeShop } from '../types/restaurant';

interface FavoritesCarouselProps {
  favorites: CoffeeShop[];
  onRestaurantClick: (coffeeShop: CoffeeShop) => void;
}

const FavoritesCarouselComponent: React.FC<FavoritesCarouselProps> = ({ 
  favorites, 
  onRestaurantClick 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (favorites.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % favorites.length);
    }, 3000); // Auto-slide every 3 seconds

    return () => clearInterval(interval);
  }, [favorites.length]);

  if (favorites.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % favorites.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + favorites.length) % favorites.length);
  };

  return (
    <div className="bg-cream-50 rounded-xl shadow-sm border border-coffee-200 p-6 mb-6">
      <div className="flex items-center mb-4">
        <Heart className="w-5 h-5 text-coffee-600 mr-2" />
        <h2 className="text-base sm:text-lg font-semibold text-coffee-900 font-serif">Your Favorite Brews</h2>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-lg">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {favorites.map((coffeeShop) => (
              <div
                key={coffeeShop.id}
                className="w-full flex-shrink-0 cursor-pointer"
                onClick={() => onRestaurantClick(coffeeShop)}
              >
                <div className="bg-gradient-to-r from-coffee-600 to-coffee-700 rounded-lg p-6 text-cream-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 font-serif">{coffeeShop.name}</h3>
                    <p className="text-coffee-200 mb-2">{coffeeShop.type} • {coffeeShop.priceRange}</p>
                    <p className="text-sm text-coffee-200">{coffeeShop.address}</p>
                    <div className="flex items-center mt-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(coffeeShop.rating)
                                ? 'text-cream-300 fill-current'
                                : 'text-coffee-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm">{coffeeShop.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {favorites.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-cream-100 bg-opacity-80 hover:bg-opacity-100 text-coffee-800 p-2 rounded-full shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cream-100 bg-opacity-80 hover:bg-opacity-100 text-coffee-800 p-2 rounded-full shadow-lg transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex justify-center mt-4 space-x-2">
              {favorites.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'bg-coffee-600' : 'bg-coffee-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const FavoritesCarousel = React.memo(FavoritesCarouselComponent);
FavoritesCarousel.displayName = 'FavoritesCarousel';