import prisma from '../config/database';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { geocodingService, GeocodeResult } from './geocodingService';
import { logger } from '../utils/logger';

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

export class BurialLocationService {
  /**
   * Creates or updates burial location for a memorial page
   */
  async createOrUpdateBurialLocation(
    memorialPageId: string,
    userId: string,
    data: CreateBurialLocationData
  ): Promise<BurialLocationWithGeocode> {
    // Check if memorial page exists and user has edit access
    await this.checkEditAccess(memorialPageId, userId);

    // Validate coordinates if provided
    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (!geocodingService.validateCoordinates(data.latitude, data.longitude)) {
        throw new ValidationError('Некорректные координаты');
      }
    }

    // Try to geocode address if coordinates not provided
    let geocodeResult: GeocodeResult | null = null;
    if ((!data.latitude || !data.longitude) && data.address) {
      geocodeResult = await geocodingService.geocodeAddress(data.address);
      if (geocodeResult) {
        logger.info(`Successfully geocoded address: ${data.address}`, {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        });
      }
    }

    // Prepare data for database
    const burialLocationData = {
      memorialPageId,
      address: data.address,
      description: data.description || null,
      latitude: data.latitude ?? geocodeResult?.latitude ?? null,
      longitude: data.longitude ?? geocodeResult?.longitude ?? null,
      instructions: data.instructions || null,
    };

    // Check if burial location already exists
    const existingLocation = await prisma.burialLocation.findUnique({
      where: { memorialPageId },
    });

    let burialLocation;
    if (existingLocation) {
      // Update existing location
      burialLocation = await prisma.burialLocation.update({
        where: { memorialPageId },
        data: burialLocationData,
      });
    } else {
      // Create new location
      burialLocation = await prisma.burialLocation.create({
        data: burialLocationData,
      });
    }

    return {
      ...burialLocation,
      latitude: burialLocation.latitude ? Number(burialLocation.latitude) : undefined,
      longitude: burialLocation.longitude ? Number(burialLocation.longitude) : undefined,
      geocodedAddress: geocodeResult?.formattedAddress,
    };
  }

  /**
   * Gets burial location for a memorial page
   */
  async getBurialLocation(memorialPageId: string): Promise<BurialLocationWithGeocode | null> {
    const burialLocation = await prisma.burialLocation.findUnique({
      where: { memorialPageId },
    });

    if (!burialLocation) {
      return null;
    }

    return {
      ...burialLocation,
      latitude: burialLocation.latitude ? Number(burialLocation.latitude) : undefined,
      longitude: burialLocation.longitude ? Number(burialLocation.longitude) : undefined,
    };
  }

  /**
   * Updates burial location for a memorial page
   */
  async updateBurialLocation(
    memorialPageId: string,
    userId: string,
    data: UpdateBurialLocationData
  ): Promise<BurialLocationWithGeocode> {
    // Check if memorial page exists and user has edit access
    await this.checkEditAccess(memorialPageId, userId);

    // Check if burial location exists
    const existingLocation = await prisma.burialLocation.findUnique({
      where: { memorialPageId },
    });

    if (!existingLocation) {
      throw new NotFoundError('Место захоронения не найдено');
    }

    // Validate coordinates if provided
    if (data.latitude !== undefined && data.longitude !== undefined) {
      if (data.latitude !== null && data.longitude !== null) {
        if (!geocodingService.validateCoordinates(data.latitude, data.longitude)) {
          throw new ValidationError('Некорректные координаты');
        }
      }
    }

    // Try to geocode new address if provided and coordinates not set
    let geocodeResult: GeocodeResult | null = null;
    if (data.address && (!data.latitude || !data.longitude)) {
      geocodeResult = await geocodingService.geocodeAddress(data.address);
      if (geocodeResult) {
        logger.info(`Successfully geocoded updated address: ${data.address}`, {
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.address !== undefined) updateData.address = data.address;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.instructions !== undefined) updateData.instructions = data.instructions || null;
    
    // Handle coordinates
    if (data.latitude !== undefined) {
      updateData.latitude = data.latitude;
    } else if (geocodeResult) {
      updateData.latitude = geocodeResult.latitude;
    }
    
    if (data.longitude !== undefined) {
      updateData.longitude = data.longitude;
    } else if (geocodeResult) {
      updateData.longitude = geocodeResult.longitude;
    }

    // Update burial location
    const updatedLocation = await prisma.burialLocation.update({
      where: { memorialPageId },
      data: updateData,
    });

    return {
      ...updatedLocation,
      latitude: updatedLocation.latitude ? Number(updatedLocation.latitude) : undefined,
      longitude: updatedLocation.longitude ? Number(updatedLocation.longitude) : undefined,
      geocodedAddress: geocodeResult?.formattedAddress,
    };
  }

  /**
   * Deletes burial location for a memorial page
   */
  async deleteBurialLocation(memorialPageId: string, userId: string): Promise<void> {
    // Check if memorial page exists and user has edit access
    await this.checkEditAccess(memorialPageId, userId);

    // Check if burial location exists
    const existingLocation = await prisma.burialLocation.findUnique({
      where: { memorialPageId },
    });

    if (!existingLocation) {
      throw new NotFoundError('Место захоронения не найдено');
    }

    // Delete burial location
    await prisma.burialLocation.delete({
      where: { memorialPageId },
    });
  }

  /**
   * Geocodes an address and returns coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    return await geocodingService.geocodeAddress(address);
  }

  /**
   * Reverse geocodes coordinates to get address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!geocodingService.validateCoordinates(latitude, longitude)) {
      throw new ValidationError('Некорректные координаты');
    }

    return await geocodingService.reverseGeocode(latitude, longitude);
  }

  /**
   * Checks if user has edit access to the memorial page
   */
  private async checkEditAccess(memorialPageId: string, userId: string): Promise<void> {
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: { ownerId: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Check if user is owner or collaborator
    const hasAccess = memorialPage.ownerId === userId || await this.isCollaborator(memorialPageId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('У вас нет прав для редактирования этой страницы');
    }
  }

  /**
   * Checks if user is a collaborator on the memorial page
   */
  private async isCollaborator(memorialPageId: string, userId: string): Promise<boolean> {
    const collaborator = await prisma.collaborator.findFirst({
      where: {
        memorialPageId,
        userId,
        acceptedAt: { not: null },
      },
    });

    return !!collaborator;
  }
}

export const burialLocationService = new BurialLocationService();