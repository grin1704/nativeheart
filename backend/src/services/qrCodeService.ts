import QRCode from 'qrcode';
import { NotFoundError, ValidationError } from '../utils/errors';
import prisma from '../config/database';

export interface QRCodeOptions {
  format?: 'png' | 'svg' | 'pdf';
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface QRCodeData {
  url: string;
  dataUrl: string;
  format: string;
  size: number;
}

export class QRCodeService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Generates QR code for a memorial page
   */
  async generateQRCode(
    memorialPageId: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData> {
    // Get memorial page to verify it exists and get slug
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: { slug: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Generate URL for the memorial page
    const pageUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;

    // Set default options
    const qrOptions = {
      format: options.format || 'png',
      size: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    };

    // Generate QR code based on format
    let dataUrl: string;
    
    if (qrOptions.format === 'svg') {
      dataUrl = await QRCode.toString(pageUrl, {
        type: 'svg',
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
      });
    } else {
      // Default to PNG
      dataUrl = await QRCode.toDataURL(pageUrl, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
      });
    }

    return {
      url: pageUrl,
      dataUrl,
      format: qrOptions.format,
      size: qrOptions.size,
    };
  }

  /**
   * Generates and saves QR code URL for a memorial page
   */
  async generateAndSaveQRCode(memorialPageId: string): Promise<string> {
    // Get memorial page
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: { slug: true, qrCodeUrl: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Generate QR code URL
    const qrCodeUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;

    // Update memorial page with QR code URL if not already set
    if (!memorialPage.qrCodeUrl) {
      await prisma.memorialPage.update({
        where: { id: memorialPageId },
        data: { qrCodeUrl },
      });
    }

    return qrCodeUrl;
  }

  /**
   * Gets QR code data for a memorial page
   */
  async getQRCodeData(
    memorialPageId: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData> {
    // Ensure QR code URL is generated and saved
    const qrCodeUrl = await this.generateAndSaveQRCode(memorialPageId);

    // Generate QR code image
    const qrOptions = {
      format: options.format || 'png',
      size: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    };

    let dataUrl: string;
    
    if (qrOptions.format === 'svg') {
      dataUrl = await QRCode.toString(qrCodeUrl, {
        type: 'svg',
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
      });
    } else {
      // Default to PNG
      dataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
      });
    }

    return {
      url: qrCodeUrl,
      dataUrl,
      format: qrOptions.format,
      size: qrOptions.size,
    };
  }

  /**
   * Regenerates QR code URL for a memorial page (useful when slug changes)
   */
  async regenerateQRCode(memorialPageId: string): Promise<string> {
    // Get memorial page
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: { slug: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    // Generate new QR code URL
    const qrCodeUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;

    // Update memorial page with new QR code URL
    await prisma.memorialPage.update({
      where: { id: memorialPageId },
      data: { qrCodeUrl },
    });

    return qrCodeUrl;
  }

  /**
   * Validates QR code options
   */
  private validateOptions(options: QRCodeOptions): void {
    if (options.format && !['png', 'svg', 'pdf'].includes(options.format)) {
      throw new ValidationError('Неподдерживаемый формат QR-кода. Доступны: png, svg, pdf');
    }

    if (options.size && (options.size < 100 || options.size > 1000)) {
      throw new ValidationError('Размер QR-кода должен быть от 100 до 1000 пикселей');
    }

    if (options.margin && (options.margin < 0 || options.margin > 10)) {
      throw new ValidationError('Отступ QR-кода должен быть от 0 до 10');
    }
  }

  /**
   * Gets QR code as buffer for download
   */
  async getQRCodeBuffer(
    memorialPageId: string,
    options: QRCodeOptions = {}
  ): Promise<Buffer> {
    this.validateOptions(options);

    // Get memorial page
    const memorialPage = await prisma.memorialPage.findUnique({
      where: { id: memorialPageId },
      select: { slug: true },
    });

    if (!memorialPage) {
      throw new NotFoundError('Памятная страница не найдена');
    }

    const pageUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;

    // Set default options
    const qrOptions = {
      width: options.size || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
    };

    // Generate QR code as buffer
    if (options.format === 'svg') {
      const svgString = await QRCode.toString(pageUrl, {
        type: 'svg',
        ...qrOptions,
      });
      return Buffer.from(svgString, 'utf8');
    } else {
      // Default to PNG
      return await QRCode.toBuffer(pageUrl, qrOptions);
    }
  }
}

export const qrCodeService = new QRCodeService();