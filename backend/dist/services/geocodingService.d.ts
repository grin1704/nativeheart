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
                        pos: string;
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
export declare class GeocodingService {
    private readonly apiKey;
    private readonly baseUrl;
    constructor();
    geocodeAddress(address: string): Promise<GeocodeResult | null>;
    reverseGeocode(latitude: number, longitude: number): Promise<string | null>;
    validateCoordinates(latitude: number, longitude: number): boolean;
}
export declare const geocodingService: GeocodingService;
//# sourceMappingURL=geocodingService.d.ts.map