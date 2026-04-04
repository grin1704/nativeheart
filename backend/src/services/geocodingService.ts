import axios from 'axios';
import { logger } from '../utils/logger';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface YandexGeocoderResponse {
  response: {
    GeoObjectCollection: {
      featureMember: Array<{
        GeoObject: {
          Point: {
            pos: string; // "longitude latitude"
          };
          metaDataProperty: {
            GeocoderMetaData: {
              text: string;
              precision: string;
            };
          };
        };
      }>;
    };
  };
}

export class GeocodingService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://geocode-maps.yandex.ru/1.x/';

  constructor() {
    this.apiKey = process.env.YANDEX_GEOCODER_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('YANDEX_GEOCODER_API_KEY not set. Geocoding functionality will be limited.');
    }
  }

  /**
   * Geocodes an address using Yandex Geocoder API
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.apiKey) {
      logger.warn('Yandex Geocoder API key not configured');
      return null;
    }

    try {
      const response = await axios.get<YandexGeocoderResponse>(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          geocode: address,
          format: 'json',
          results: 1,
          lang: 'ru_RU',
        },
        timeout: 10000, // 10 seconds timeout
      });

      const geoObjects = response.data.response.GeoObjectCollection.featureMember;
      
      if (geoObjects.length === 0) {
        logger.info(`No geocoding results found for address: ${address}`);
        return null;
      }

      const geoObject = geoObjects[0].GeoObject;
      const [longitude, latitude] = geoObject.Point.pos.split(' ').map(Number);
      const formattedAddress = geoObject.metaDataProperty.GeocoderMetaData.text;

      return {
        latitude,
        longitude,
        formattedAddress,
      };
    } catch (error) {
      logger.error('Error geocoding address:', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Reverse geocodes coordinates to get address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!this.apiKey) {
      logger.warn('Yandex Geocoder API key not configured');
      return null;
    }

    try {
      const response = await axios.get<YandexGeocoderResponse>(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          geocode: `${longitude},${latitude}`,
          format: 'json',
          results: 1,
          lang: 'ru_RU',
        },
        timeout: 10000,
      });

      const geoObjects = response.data.response.GeoObjectCollection.featureMember;
      
      if (geoObjects.length === 0) {
        logger.info(`No reverse geocoding results found for coordinates: ${latitude}, ${longitude}`);
        return null;
      }

      return geoObjects[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
    } catch (error) {
      logger.error('Error reverse geocoding coordinates:', {
        latitude,
        longitude,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Validates if coordinates are within reasonable bounds
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }
}

export const geocodingService = new GeocodingService();