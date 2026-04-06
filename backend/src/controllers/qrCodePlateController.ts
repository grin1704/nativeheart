import { Request, Response, NextFunction } from 'express';
import archiver from 'archiver';
import { qrCodePlateService } from '../services/qrCodePlateService';

/**
 * POST /api/admin/qr-plates/batches
 * Создать партию табличек
 */
export const createBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, count } = req.body;
    if (!name || !count) {
      return res.status(400).json({ success: false, message: 'Укажите name и count' });
    }
    const batch = await qrCodePlateService.createBatch(name, Number(count));
    return res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/qr-plates/batches
 * Список партий
 */
export const getBatches = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const batches = await qrCodePlateService.getBatches();
    return res.json({ success: true, data: batches });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/qr-plates
 * Список табличек с фильтрами ?batchId=&status=&page=&limit=
 */
export const getPlates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchId, status, page, limit } = req.query;
    const result = await qrCodePlateService.getPlates(
      batchId as string | undefined,
      status as string | undefined,
      page ? Number(page) : 1,
      limit ? Number(limit) : 50
    );
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/qr-plates/batches/:batchId/export
 * Экспорт SVG партии — ZIP-архив с отдельными .svg файлами
 */
export const exportBatchSvg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batchId } = req.params;
    const data = await qrCodePlateService.exportBatchSvg(batchId);

    // Encode filename for Content-Disposition (RFC 5987) to support non-ASCII chars
    const encodedName = encodeURIComponent(data.batch.name);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-plates.zip"; filename*=UTF-8''${encodedName}.zip`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => next(err));
    archive.pipe(res);

    for (const plate of data.plates) {
      archive.append(plate.svg, { name: `qr-${plate.token}.svg` });
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/qr-plates/stats
 * Статистика пула
 */
export const getPoolStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await qrCodePlateService.getPoolStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/qr/:token  (публичный)
 * Редирект по токену таблички
 */
export const redirectByToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const plate = await qrCodePlateService.getPlateByToken(token);

    if (plate.status === 'assigned' && plate.memorialPage) {
      return res.redirect(302, `/memorial/${plate.memorialPage.slug}`);
    }

    // Табличка свободна — заглушка (редирект на frontend-страницу)
    return res.redirect(302, `/qr/${token}/pending`);
  } catch (error) {
    next(error);
  }
};
