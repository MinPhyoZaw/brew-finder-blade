import React from 'react';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import type { UserLocation, LocationError } from '../types/restaurant';

interface LocationStatusProps {
  location: UserLocation | null;
  loading: boolean;
  error: LocationError | null;
  onRetry: () => void;
}

export const LocationStatus: React.FC<LocationStatusProps> = ({ 
  location, 
  loading, 
  error, 
  onRetry 
}) => {
  if (loading) {
    return (
      <div className="bg-coffee-100 border border-coffee-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-600 mr-3"></div>
          <p className="text-coffee-800 font-medium">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-coffee-200 border border-coffee-300 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-coffee-700 mr-3" />
            <p className="text-coffee-800 font-medium">{error.message}</p>
          </div>
          <button
            onClick={onRetry}
            className="bg-coffee-600 hover:bg-coffee-700 text-cream-100 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (location) {
    // Do not show location found text per UX request — keep silently available
    return null;
  }

  return null;
};