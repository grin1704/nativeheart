import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import prisma from '../config/database';
import { generateSlug } from '../utils/slug';

export class MemorialPageController {
  /**
   * Create a new memorial page
   */
  async createMemorialPage(req: AuthenticatedRequest, res: Response) {
    try {
      const { fullName, birthDate, deathDate, shortDescription } = req.body;
      const userId = req.user!.id;

      // Generate unique slug
      const baseSlug = generateSlug(fullName);
      let slug = baseSlug;
      let counter = 1;

      while (await prisma.memorialPage.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create memorial page
      const memorialPage = await prisma.memorialPage.create({
        data: {
          slug,
          ownerId: userId,
          fullName,
          birthDate: new Date(birthDate),
          deathDate: new Date(deathDate),
          biographyText: shortDescription || null,
        },
      });

      res.status(201).json({
        success: true,
        ...memorialPage,
      });
    } catch (error) {
      console.error('Create memorial page error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create memorial page',
      });
    }
  }

  /**
   * Get memorial page by ID
   */
  async getMemorialPage(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const memorialPage = await prisma.memorialPage.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!memorialPage) {
        return res.status(404).json({ error: 'Memorial page not found' });
      }

      // Check if user has access to this page
      if (memorialPage.ownerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(memorialPage);
    } catch (error) {
      console.error('Get memorial page error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get memorial page',
      });
    }
  }

  /**
   * Get user's memorial pages
   */
  async getUserMemorialPages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const memorialPages = await prisma.memorialPage.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: memorialPages,
      });
    } catch (error) {
      console.error('Get user memorial pages error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get memorial pages',
      });
    }
  }
}

export const memorialPageController = new MemorialPageController();