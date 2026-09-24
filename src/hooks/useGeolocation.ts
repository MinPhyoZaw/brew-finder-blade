import { useCallback, useEffect, useState } from 'react';
import type { UserLocation, LocationError } from '../types/restaurant';

interface GeolocationState {
  location: UserLocation | null;
  loading: boolean;
  error: LocationError | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
  });

  const getCurrentPosition = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 0,
          message: 'Your browser does not support location services. Try searching by township instead.'
        }
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = 'We could not find your location. Please try again.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied. Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Your location is currently unavailable. Please check your device settings and try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Finding your location took too long. Please try again.';
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: {
            code: error.code,
            message: errorMessage
          }
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...state,
    refetch: getCurrentPosition,
  };
};
