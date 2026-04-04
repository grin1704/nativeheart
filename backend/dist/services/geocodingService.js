"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodingService = exports.GeocodingService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class GeocodingService {
    constructor() {
        this.baseUrl = 'https://geocode-maps.yandex.ru/1.x/';
        this.apiKey = process.env.YANDEX_GEOCODER_API_KEY || '';
        if (!this.apiKey) {
            logger_1.logger.warn('YANDEX_GEOCODER_API_KEY not set. Geocoding functionality will be limited.');
        }
    }
    async geocodeAddress(address) {
        if (!this.apiKey) {
            logger_1.logger.warn('Yandex Geocoder API key not configured');
            return null;
        }
        try {
            const response = await axios_1.default.get(this.baseUrl, {
                params: {
                    apikey: this.apiKey,
                    geocode: address,
                    format: 'json',
                    results: 1,
                    lang: 'ru_RU',
                },
                timeout: 10000,
            });
            const geoObjects = response.data.response.GeoObjectCollection.featureMember;
            if (geoObjects.length === 0) {
                logger_1.logger.info(`No geocoding results found for address: ${address}`);
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
        }
        catch (error) {
            logger_1.logger.error('Error geocoding address:', {
                address,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return null;
        }
    }
    async reverseGeocode(latitude, longitude) {
        if (!this.apiKey) {
            logger_1.logger.warn('Yandex Geocoder API key not configured');
            return null;
        }
        try {
            const response = await axios_1.default.get(this.baseUrl, {
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
                logger_1.logger.info(`No reverse geocoding results found for coordinates: ${latitude}, ${longitude}`);
                return null;
            }
            return geoObjects[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
        }
        catch (error) {
            logger_1.logger.error('Error reverse geocoding coordinates:', {
                latitude,
                longitude,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return null;
        }
    }
    validateCoordinates(latitude, longitude) {
        return (latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180);
    }
}
exports.GeocodingService = GeocodingService;
exports.geocodingService = new GeocodingService();
//# sourceMappingURL=geocodingService.js.map