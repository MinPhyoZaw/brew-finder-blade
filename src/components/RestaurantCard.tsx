import React from 'react';
import { Star, Heart, MapPin, Clock } from 'lucide-react';
import { CoffeeShop } from '../types/restaurant';

interface CoffeeShopCardProps {
  coffeeShop: CoffeeShop;
  onClick: () => void;
  onFavoriteClick?: () => void;
  isFavorite: boolean;
}

const CoffeeShopCardComponent: React.FC<CoffeeShopCardProps> = ({
  coffeeShop,
  onClick,
  onFavoriteClick,
  isFavorite
}) => {
  return (
    <div
      className="bg-cream-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-coffee-200 flex flex-row sm:flex-col"
      onClick={onClick}
    >
      {/* Image section: first image */}
      <div className="relative w-32 h-32 sm:w-full sm:h-48 flex-shrink-0">
        <img
          src={
            coffeeShop.images && coffeeShop.images.length > 0
              ? coffeeShop.images[0]
              : 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'
          }
          loading="lazy"
          width={192}
          height={192}
          alt={coffeeShop.name}
          className="w-full h-full object-cover rounded-l-xl sm:rounded-t-xl sm:rounded-l-none"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onFavoriteClick) onFavoriteClick();
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
            !onFavoriteClick
              ? 'bg-coffee-200 text-coffee-400 cursor-not-allowed'
              : isFavorite
              ? 'bg-coffee-600 text-cream-100 hover:bg-coffee-700'
              : 'bg-cream-100/80 text-coffee-600 hover:bg-cream-100 hover:text-coffee-700'
          }`}
          disabled={!onFavoriteClick}
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>

        {/* distance removed per UX request */}
      </div>

      {/* Text section */}
      <div className="flex flex-col justify-between p-3 sm:p-4 flex-1">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-coffee-800 line-clamp-1 flex-1 mr-2 font-serif">
              {coffeeShop.name}
            </h3>
            <div className="flex items-center gap-1 bg-cream-200 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 fill-cream-500 text-cream-500" />
              <span className="text-sm font-medium text-coffee-700">
                {coffeeShop.rating}
              </span>
            </div>
          </div>

          <p className="text-coffee-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 font-medium">
            {coffeeShop.type} • {coffeeShop.priceRange}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-coffee-500 gap-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{coffeeShop.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>15-25 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CoffeeShopCard = React.memo(CoffeeShopCardComponent);
CoffeeShopCard.displayName = 'CoffeeShopCard';
