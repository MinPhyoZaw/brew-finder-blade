import React, { useEffect, useState, lazy, Suspense } from 'react';
import { X, MapPin, Phone, Clock, Star, ArrowLeft, Navigation } from 'lucide-react';
import { CoffeeShopService } from '../services/restaurantService';
import { useAuth } from '../hooks/useAuth';
const ImageSlideshow = lazy(() => import('./ImageSlideshow').then(m => ({ default: m.ImageSlideshow })));
const CommentsSection = lazy(() => import('./CommentsSection').then(m => ({ default: m.CommentsSection })));
import type { CoffeeShop } from '../types/restaurant';

interface CoffeeShopDetailProps {
  coffeeShop: CoffeeShop;
  onClose: () => void;
}

export const CoffeeShopDetail: React.FC<CoffeeShopDetailProps> = ({ coffeeShop, onClose }) => {
  const [isOpenNow, setIsOpenNow] = useState<boolean | null>(null);
  const { user } = useAuth();
  const [localRating, setLocalRating] = useState<number>(coffeeShop.rating || 0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 text-yellow-400 fill-yellow-400/50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  // 🔹 Real-time "Open Now" checker
  useEffect(() => {
    // load current user's rating (if logged in)
    const loadUserRating = async () => {
      if (!user) return;
      try {
        setLoadingUserRating(true);
        const r = await CoffeeShopService.getUserRating(coffeeShop.id, user.id);
        setUserRating(r);
      } catch (err) {
        console.error('Failed to load user rating', err);
      } finally {
        setLoadingUserRating(false);
      }
    };

    loadUserRating();

    if (coffeeShop.hours) {
      const hours = coffeeShop.hours.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/gi);
      if (hours && hours.length >= 2) {
        const [openTime, closeTime] = hours.map(t => {
          const [time, meridian] = t.split(' ');
          let [hour, minute] = time.split(':').map(Number);
          if (meridian.toUpperCase() === 'PM' && hour < 12) hour += 12;
          if (meridian.toUpperCase() === 'AM' && hour === 12) hour = 0;
          const now = new Date();
          now.setHours(hour, minute, 0, 0);
          return now.getTime();
        });

        const now = new Date();
        const nowTime = now.getHours() * 60 + now.getMinutes();
        const open = new Date(openTime);
        const close = new Date(closeTime);
        const openMinutes = open.getHours() * 60 + open.getMinutes();
        const closeMinutes = close.getHours() * 60 + close.getMinutes();

        setIsOpenNow(nowTime >= openMinutes && nowTime <= closeMinutes);
      }
    }
  }, [coffeeShop.hours]);

  const resolveCoordinates = (shop: CoffeeShop) => {
    // Prefer explicit numeric fields
    const latField = (shop as any).latitude;
    const lonField = (shop as any).longitude;

    if (typeof latField === 'number' && typeof lonField === 'number') {
      return { lat: latField, lon: lonField };
    }

    // Firestore GeoPoint stored as `location: { latitude, longitude }`
    const location = (shop as any).location || (shop as any).geolocation || (shop as any).geoPoint;
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return { lat: location.latitude, lon: location.longitude };
    }

    // Other possible shapes: { lat, lng } or { latitude: { _lat } }
    const altLat = (shop as any).lat ?? (shop as any).lng ?? (shop as any).Latitude ?? (shop as any).Lat;
    const altLon = (shop as any).lon ?? (shop as any).lng ?? (shop as any).Longitude ?? (shop as any).Lon;
    if (typeof altLat === 'number' && typeof altLon === 'number') {
      return { lat: altLat, lon: altLon };
    }

    // Try nested GeoPoint-like shapes from Firestore SDK
    const nestedLat = (shop as any).latitude?._lat ?? (shop as any).location?._lat;
    const nestedLon = (shop as any).longitude?._long ?? (shop as any).location?._long;
    if (typeof nestedLat === 'number' && typeof nestedLon === 'number') {
      return { lat: nestedLat, lon: nestedLon };
    }

    return null;
  };

  const openDirections = (shop: CoffeeShop) => {
    if (typeof window === 'undefined') return;
    // Prefer a human-readable destination (shop name + address) so Google Maps shows the place by name
    const destinationText = `${shop.name}${shop.address ? ' ' + shop.address : ''}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationText)}&travelmode=driving`;
    window.open(url, '_blank', 'noopener');
  };

  // keep displayed localRating in sync with prop when it changes
  useEffect(() => {
    setLocalRating(coffeeShop.rating || 0);
  }, [coffeeShop.rating]);

  const submitRating = async (value: number) => {
    if (!user) return;
    try {
      setSubmittingRating(true);
      await CoffeeShopService.submitRating(coffeeShop.id, user.id, value);
      // fetch updated aggregate from cache/service
      const updated = CoffeeShopService.getCachedCoffeeShopById(coffeeShop.id);
      if (updated && typeof updated.rating === 'number') {
        setLocalRating(updated.rating);
      } else {
        // fallback: optimistic local update
        setLocalRating(prev => {
          // naive set: average between prev and new value
          return Math.round(((prev + value) / 2) * 10) / 10;
        });
      }
      setUserRating(value);
    } catch (err) {
      console.error('Failed to submit rating', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="max-h-[calc(100dvh-1rem)] w-[calc(100%-0.5rem)] max-w-4xl overflow-y-auto overflow-x-hidden rounded-xl bg-white backdrop-blur-md sm:max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-20 flex min-w-0 items-center justify-between border-b border-gray-200 bg-white/95 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex-1 min-w-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Mobile back button */}
              <button
                onClick={onClose}
                className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-gray-100 sm:hidden"
                aria-label="Back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>

              <h2 className="min-w-0 flex-1 break-words text-base font-bold text-gray-900 sm:text-xl">{coffeeShop.name}</h2>

              {isOpenNow !== null && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOpenNow
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isOpenNow ? 'Open' : 'Closed'}
                </span>
              )}
            </div>

            {/* Rating Stars and Tags */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 gap-2">
              {/* Average Stars Display */}
              <div className="flex items-center mr-4">
                {renderStars(localRating)}
                <span className="ml-2 text-sm text-gray-600 font-medium">
                  {localRating.toFixed(1)}
                </span>
              </div>

              {/* Interactive user rating (1-5) */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">Your rating:</div>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        onClick={(e) => { e.stopPropagation(); submitRating(s); }}
                        className={`p-1 rounded-full transition-colors ${userRating && s <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        aria-label={`Rate ${s} star`}
                        disabled={submittingRating || loadingUserRating}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                  {loadingUserRating && <div className="text-xs text-gray-400 ml-2">loading...</div>}
                </div>
              )}

              {/* Tags from Firestore */}
              {coffeeShop.tags && coffeeShop.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coffeeShop.tags.map((tag: string) => {
                    const TAG_OPTIONS: Record<string, { label: string; color: string }> = {
                      first_date: { label: "First Date", color: "bg-pink-100 text-pink-700" },
                      photograph: { label: "Photograph", color: "bg-blue-100 text-blue-700" },
                      relax_chill: { label: "Relax & Chill", color: "bg-green-100 text-green-700" },
                      study_spot: { label: "Study Spot", color: "bg-yellow-100 text-yellow-700" },
                      group_hangout: { label: "Group Hangout", color: "bg-purple-100 text-purple-700" },
                      family: { label: "Family", color: "bg-orange-100 text-orange-700" },
                    };

                    const tagData = TAG_OPTIONS[tag] ?? { label: tag, color: "bg-gray-100 text-gray-700" };

                    return (
                      <span
                        key={tag}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagData.color}`}
                      >
                        {tagData.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Desktop close button (hidden on small screens) */}
          <button
            onClick={onClose}
            className="hidden sm:inline-flex p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
          {/* Image Slideshow (lazy) - responsive heights for mobile/desktop */}
          <div className="w-full">
            <div className="h-52 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-96">
              <Suspense fallback={<div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">Loading images...</div>}>
                <ImageSlideshow images={coffeeShop.images || []} restaurantName={coffeeShop.name} />
              </Suspense>
            </div>
          </div>

          {/* ✨ About Section */}
          {coffeeShop.description && (
            <div className="relative min-w-0 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-lg backdrop-blur-md sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 drop-shadow-sm">
                About
              </h3>
              <p className="break-words text-sm leading-relaxed text-gray-700 drop-shadow-sm md:text-base">
                {coffeeShop.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
         {/* Contact Information */}
<div className="space-y-3">
  <div className="bg-gray-50 p-4 rounded-xl w-full shadow-sm">

    {/* Address */}
    <div className="flex items-start gap-3 mb-3">
      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-gray-800 text-sm leading-relaxed break-words line-clamp-2">
          {coffeeShop.address}
        </span>

        {resolveCoordinates(coffeeShop) && (
          <button
            onClick={(e) => { e.stopPropagation(); openDirections(coffeeShop); }}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
          >
            <Navigation className="w-4 h-4" />
            <span>Get Directions</span>
          </button>
        )}
      </div>
    </div>

    {/* Phone */}
    {coffeeShop.phone && (
      <a
        href={`tel:${coffeeShop.phone}`}
        className="flex items-center gap-3 bg-white p-3 rounded-lg border hover:bg-gray-100 transition"
      >
        <Phone className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700 text-sm">{coffeeShop.phone}</span>
      </a>
    )}

    {/* Hours */}
    {coffeeShop.hours && (
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
        <Clock className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-700">{coffeeShop.hours}</span>
      </div>
    )}
  </div>
</div>


            {/* Comments Section (lazy-loaded) */}
            <Suspense fallback={<div className="p-4 text-sm text-gray-600">Loading comments...</div>}>
              <CommentsSection coffeeShopId={coffeeShop.id} currentUser={user} />
            </Suspense>
        </div>
      </div>
    </div>
  );
};
