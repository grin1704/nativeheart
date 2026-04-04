import { GeocodeResult } from './geocodingService';
export interface CreateBurialLocationData {
    address: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    instructions?: string;
}
export interface UpdateBurialLocationData {
    address?: string;
    description?: string;
    latitude?: number | null;
    longitude?: number | null;
    instructions?: string;
}
export interface BurialLocationWithGeocode extends CreateBurialLocationData {
    id: string;
    memorialPageId: string;
    geocodedAddress?: string;
}
export declare class BurialLocationService {
    createOrUpdateBurialLocation(memorialPageId: string, userId: string, data: CreateBurialLocationData): Promise<BurialLocationWithGeocode>;
    getBurialLocation(memorialPageId: string): Promise<BurialLocationWithGeocode | null>;
    updateBurialLocation(memorialPageId: string, userId: string, data: UpdateBurialLocationData): Promise<BurialLocationWithGeocode>;
    deleteBurialLocation(memorialPageId: string, userId: string): Promise<void>;
    geocodeAddress(address: string): Promise<GeocodeResult | null>;
    reverseGeocode(latitude: number, longitude: number): Promise<string | null>;
    private checkEditAccess;
    private isCollaborator;
}
export declare const burialLocationService: BurialLocationService;
//# sourceMappingURL=burialLocationService.d.ts.map