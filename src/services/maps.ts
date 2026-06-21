/**
 * Reusable Google Maps Loader Service
 * 
 * Prepares the connection interfaces and coordinates mapping for sustainability locations.
 * Future modules (EV Charging, Tree Plantation, Recycling Centers, Community Events) will import this service.
 */

export interface MapMarkerLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'ev_charging' | 'recycling' | 'tree_planting' | 'community_event';
  details: {
    address: string;
    description: string;
    contact?: string;
    openingHours?: string;
    extra?: string; // EV charger type, items recycled, etc.
  };
}

class GoogleMapsService {
  private apiKey: string;
  private isLoaded = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'mock-google-maps-key';
  }

  /**
   * Lazily loads the Google Maps SDK script in the browser header
   */
  async loadGoogleMapsSDK(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (typeof window === 'undefined') return Promise.resolve();

    const win = window as any;
    if (win.google && win.google.maps) {
      this.isLoaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = (err) => {
        reject(new Error('Failed to load Google Maps SDK: ' + err.toString()));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Mock marker locations representing EV Charging stations, Recycling centers, etc.
   */
  getSustainabilityLocations(): MapMarkerLocation[] {
    return [
      {
        id: 'loc_01',
        name: 'EcoCharge Supercharger Hub',
        lat: 37.7749,
        lng: -122.4194,
        type: 'ev_charging',
        details: {
          address: '455 Golden Gate Ave, San Francisco, CA',
          description: 'High-speed Level 3 CSS EV charging terminals running on 100% solar offsets.',
          openingHours: '24/7 Open',
          extra: 'Connector: Type 2 CCS, Output: 250 kW'
        }
      },
      {
        id: 'loc_02',
        name: 'Municipal Recycling & Composting Center',
        lat: 37.7833,
        lng: -122.4167,
        type: 'recycling',
        details: {
          address: '1201 Harrison St, San Francisco, CA',
          description: 'Accepts plastic grades 1-7, aluminium cans, compostable household food waste, and lead batteries.',
          openingHours: 'Mon-Sat 8:00 AM - 5:00 PM',
          extra: 'Items: Paper, Plastic, Metal, Organics, Electronics'
        }
      },
      {
        id: 'loc_03',
        name: 'Sutro Forest Reforestation Plot',
        lat: 37.7577,
        lng: -122.4533,
        type: 'tree_planting',
        details: {
          address: 'Johnston Dr, San Francisco, CA',
          description: 'Community afforestation reserve. Volunteers meet weekly to plant local redwood and pine saplings.',
          openingHours: 'Saturday mornings from 9:00 AM',
          extra: 'Volunteers Needed: Sapling digging, composting'
        }
      },
      {
        id: 'loc_04',
        name: 'CarbonMind Eco Summit & Swap Meet',
        lat: 37.8024,
        lng: -122.4058,
        type: 'community_event',
        details: {
          address: 'Pier 27, The Embarcadero, San Francisco, CA',
          description: 'Exchange secondhand household items, clothes, and solar cells. Entry is completely free.',
          openingHours: 'June 28, 2026, 10:00 AM - 4:00 PM',
          extra: 'Host: CarbonMind SF Team, Attendees: 200+'
        }
      }
    ];
  }
}

export const googleMapsService = new GoogleMapsService();
export default googleMapsService;
