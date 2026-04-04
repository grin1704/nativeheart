import { Request, Response, NextFunction } from 'express';
import { qrCodeService, QRCodeOptions } from '../services/qrCodeService';
import { memorialPageService } from '../services/memorialPageService';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth';

/**
 * Gets QR code data for a memorial page
 */
export const getQRCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { pageId } = req.params;
    const { format, size, margin, darkColor, lightColor } = req.query;

    // Validate that user has access to the page
    if (req.user) {
      // Check if user is owner or collaborator
      try {
        await memorialPageService.getMemorialPageById(pageId, req.user.id);
      } catch (error) {
        return res.status(403).json({
          success: false,
          message: 'У вас нет доступа к этой странице',
        });
      }
    }

    // Parse options
    const options: QRCodeOptions = {};
    
    if (format && typeof format === 'string') {
      if (!['png', 'svg'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Неподдерживаемый формат. Доступны: png, svg',
        });
      }
      options.format = format as 'png' | 'svg';
    }

    if (size && typeof size === 'string') {
      const sizeNum = parseInt(size, 10);
      if (isNaN(sizeNum) || sizeNum < 100 || sizeNum > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Размер должен быть числом от 100 до 1000',
        });
      }
      options.size = sizeNum;
    }

    if (margin && typeof margin === 'string') {
      const marginNum = parseInt(margin, 10);
      if (isNaN(marginNum) || marginNum < 0 || marginNum > 10) {
        return res.status(400).json({
          success: false,
          message: 'Отступ должен быть числом от 0 до 10',
        });
      }
      options.margin = marginNum;
    }

    if (darkColor || lightColor) {
      options.color = {};
      if (darkColor && typeof darkColor === 'string') {
        options.color.dark = darkColor;
      }
      if (lightColor && typeof lightColor === 'string') {
        options.color.light = lightColor;
      }
    }

    const qrCodeData = await qrCodeService.getQRCodeData(pageId, options);

    return res.json({
      success: true,
      data: qrCodeData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Downloads QR code as file
 */
export const downloadQRCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { pageId } = req.params;
    const { format, size, margin, darkColor, lightColor } = req.query;

    // Validate that user has access to the page
    if (req.user) {
      try {
        await memorialPageService.getMemorialPageById(pageId, req.user.id);
      } catch (error) {
        return res.status(403).json({
          success: false,
          message: 'У вас нет доступа к этой странице',
        });
      }
    }

    // Parse options
    const options: QRCodeOptions = {};
    
    if (format && typeof format === 'string') {
      if (!['png', 'svg'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Неподдерживаемый формат. Доступны: png, svg',
        });
      }
      options.format = format as 'png' | 'svg';
    }

    if (size && typeof size === 'string') {
      const sizeNum = parseInt(size, 10);
      if (isNaN(sizeNum) || sizeNum < 100 || sizeNum > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Размер должен быть числом от 100 до 1000',
        });
      }
      options.size = sizeNum;
    }

    if (margin && typeof margin === 'string') {
      const marginNum = parseInt(margin, 10);
      if (isNaN(marginNum) || marginNum < 0 || marginNum > 10) {
        return res.status(400).json({
          success: false,
          message: 'Отступ должен быть числом от 0 до 10',
        });
      }
      options.margin = marginNum;
    }

    if (darkColor || lightColor) {
      options.color = {};
      if (darkColor && typeof darkColor === 'string') {
        options.color.dark = darkColor;
      }
      if (lightColor && typeof lightColor === 'string') {
        options.color.light = lightColor;
      }
    }

    // Get memorial page for filename
    const memorialPage = await memorialPageService.getMemorialPageById(pageId, req.user?.id);
    
    // Generate QR code buffer
    const qrCodeBuffer = await qrCodeService.getQRCodeBuffer(pageId, options);
    
    // Set response headers for download
    const fileFormat = options.format || 'png';
    const fileName = `qr-code-${memorialPage.slug}.${fileFormat}`;
    
    res.setHeader('Content-Type', fileFormat === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);
    
    res.send(qrCodeBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerates QR code for a memorial page (when slug changes)
 */
export const regenerateQRCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { pageId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется аутентификация',
      });
    }

    // Validate that user has edit access to the page
    try {
      await memorialPageService.getMemorialPageById(pageId, req.user.id);
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'У вас нет доступа к этой странице',
      });
    }

    const qrCodeUrl = await qrCodeService.regenerateQRCode(pageId);

    return res.json({
      success: true,
      data: {
        qrCodeUrl,
        message: 'QR-код успешно обновлен',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets QR code for public memorial page (by slug)
 */
export const getPublicQRCode = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { slug } = req.params;
    const { format, size, margin, darkColor, lightColor } = req.query;

    // Get memorial page by slug
    const memorialPage = await memorialPageService.getMemorialPageBySlug(slug);

    // Parse options
    const options: QRCodeOptions = {};
    
    if (format && typeof format === 'string') {
      if (!['png', 'svg'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Неподдерживаемый формат. Доступны: png, svg',
        });
      }
      options.format = format as 'png' | 'svg';
    }

    if (size && typeof size === 'string') {
      const sizeNum = parseInt(size, 10);
      if (isNaN(sizeNum) || sizeNum < 100 || sizeNum > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Размер должен быть числом от 100 до 1000',
        });
      }
      options.size = sizeNum;
    }

    if (margin && typeof margin === 'string') {
      const marginNum = parseInt(margin, 10);
      if (isNaN(marginNum) || marginNum < 0 || marginNum > 10) {
        return res.status(400).json({
          success: false,
          message: 'Отступ должен быть числом от 0 до 10',
        });
      }
      options.margin = marginNum;
    }

    if (darkColor || lightColor) {
      options.color = {};
      if (darkColor && typeof darkColor === 'string') {
        options.color.dark = darkColor;
      }
      if (lightColor && typeof lightColor === 'string') {
        options.color.light = lightColor;
      }
    }

    const qrCodeData = await qrCodeService.getQRCodeData(memorialPage.id, options);

    return res.json({
      success: true,
      data: qrCodeData,
    });
  } catch (error) {
    next(error);
  }
};