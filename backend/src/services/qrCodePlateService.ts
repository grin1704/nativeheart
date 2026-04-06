import QRCode from 'qrcode';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export class QrCodePlateService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Создаёт партию QR-табличек
   */
  async createBatch(name: string, count: number) {
    if (count < 1 || count > 500) {
      throw new ValidationError('Количество табличек должно быть от 1 до 500');
    }

    const batch = await prisma.qrCodeBatch.create({
      data: {
        name,
        totalCount: count,
        plates: {
          create: Array.from({ length: count }, () => ({})),
        },
      },
      include: {
        plates: { select: { id: true, token: true, status: true } },
      },
    });

    return batch;
  }

  /**
   * Список партий с количеством свободных/назначенных табличек
   */
  async getBatches() {
    const batches = await prisma.qrCodeBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { plates: true } },
        plates: {
          select: { status: true },
        },
      },
    });

    return batches.map((b) => ({
      id: b.id,
      name: b.name,
      totalCount: b.totalCount,
      createdAt: b.createdAt,
      freeCount: b.plates.filter((p) => p.status === 'free').length,
      assignedCount: b.plates.filter((p) => p.status === 'assigned').length,
    }));
  }

  /**
   * Список табличек с фильтрацией
   */
  async getPlates(batchId?: string, status?: string, page = 1, limit = 50) {
    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (status) where.status = status;

    const [plates, total] = await Promise.all([
      prisma.qrCodePlate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          batch: { select: { name: true } },
          memorialPage: { select: { id: true, fullName: true, slug: true } },
        },
      }),
      prisma.qrCodePlate.count({ where }),
    ]);

    return { plates, total, page, limit };
  }

  /**
   * Назначает свободную табличку мемориальной странице
   * Вызывается автоматически при создании premium-страницы
   */
  async assignPlateToPage(memorialPageId: string): Promise<string | null> {
    // Берём первую свободную табличку
    const plate = await prisma.qrCodePlate.findFirst({
      where: { status: 'free' },
      orderBy: { createdAt: 'asc' },
    });

    if (!plate) return null; // Пул пуст — не блокируем создание страницы

    await prisma.qrCodePlate.update({
      where: { id: plate.id },
      data: {
        status: 'assigned',
        memorialPageId,
        assignedAt: new Date(),
      },
    });

    return plate.token;
  }

  /**
   * Генерирует SVG для одной таблички
   */
  async generatePlateSvg(token: string): Promise<string> {
    const url = `${this.baseUrl}/qr/${token}`;
    return QRCode.toString(url, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
  }

  /**
   * Экспорт SVG всех табличек партии в виде массива { token, svg }
   */
  async exportBatchSvg(batchId: string) {
    const batch = await prisma.qrCodeBatch.findUnique({
      where: { id: batchId },
      include: { plates: { orderBy: { createdAt: 'asc' } } },
    });

    if (!batch) throw new NotFoundError('Партия не найдена');

    const results = await Promise.all(
      batch.plates.map(async (plate) => ({
        token: plate.token,
        status: plate.status,
        svg: await this.generatePlateSvg(plate.token),
      }))
    );

    return { batch: { id: batch.id, name: batch.name }, plates: results };
  }

  /**
   * Получить информацию о табличке по токену (для редиректа)
   */
  async getPlateByToken(token: string) {
    const plate = await prisma.qrCodePlate.findUnique({
      where: { token },
      include: {
        memorialPage: { select: { slug: true, fullName: true } },
      },
    });

    if (!plate) throw new NotFoundError('QR-табличка не найдена');
    return plate;
  }

  /**
   * Статистика пула
   */
  async getPoolStats() {
    const [total, free, assigned] = await Promise.all([
      prisma.qrCodePlate.count(),
      prisma.qrCodePlate.count({ where: { status: 'free' } }),
      prisma.qrCodePlate.count({ where: { status: 'assigned' } }),
    ]);
    return { total, free, assigned };
  }
}

export const qrCodePlateService = new QrCodePlateService();
