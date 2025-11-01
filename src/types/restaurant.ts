export interface CoffeeShop {
  id: string;
  name: string;
  type: string; // e.g., 'Specialty Coffee', 'Chain', 'Local Roaster'
  rating: number;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  images?: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  distance?: number; // Will be calculated based on user location
  description?: string;
  hours?: string;
  provision?: string;
  tags?: string[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}