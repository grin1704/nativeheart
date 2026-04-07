"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrCodePlateService = exports.QrCodePlateService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
class QrCodePlateService {
    constructor() {
        this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }
    async createBatch(name, count) {
        if (count < 1 || count > 500) {
            throw new errors_1.ValidationError('Количество табличек должно быть от 1 до 500');
        }
        const batch = await database_1.default.qrCodeBatch.create({
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
    async getBatches() {
        const batches = await database_1.default.qrCodeBatch.findMany({
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
    async getPlates(batchId, status, page = 1, limit = 50) {
        const where = {};
        if (batchId)
            where.batchId = batchId;
        if (status)
            where.status = status;
        const [plates, total] = await Promise.all([
            database_1.default.qrCodePlate.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'asc' },
                include: {
                    batch: { select: { name: true } },
                    memorialPage: { select: { id: true, fullName: true, slug: true } },
                },
            }),
            database_1.default.qrCodePlate.count({ where }),
        ]);
        return { plates, total, page, limit };
    }
    async assignPlateToPage(memorialPageId) {
        const plate = await database_1.default.qrCodePlate.findFirst({
            where: { status: 'free' },
            orderBy: { createdAt: 'asc' },
        });
        if (!plate)
            return null;
        await database_1.default.qrCodePlate.update({
            where: { id: plate.id },
            data: {
                status: 'assigned',
                memorialPageId,
                assignedAt: new Date(),
            },
        });
        return plate.token;
    }
    async generatePlateSvg(token) {
        const url = `${this.baseUrl}/qr/${token}`;
        return qrcode_1.default.toString(url, {
            type: 'svg',
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' },
        });
    }
    async exportBatchSvg(batchId) {
        const batch = await database_1.default.qrCodeBatch.findUnique({
            where: { id: batchId },
            include: { plates: { orderBy: { createdAt: 'asc' } } },
        });
        if (!batch)
            throw new errors_1.NotFoundError('Партия не найдена');
        const results = await Promise.all(batch.plates.map(async (plate) => ({
            token: plate.token,
            status: plate.status,
            svg: await this.generatePlateSvg(plate.token),
        })));
        return { batch: { id: batch.id, name: batch.name }, plates: results };
    }
    async getPlateByToken(token) {
        const plate = await database_1.default.qrCodePlate.findUnique({
            where: { token },
            include: {
                memorialPage: { select: { slug: true, fullName: true } },
            },
        });
        if (!plate)
            throw new errors_1.NotFoundError('QR-табличка не найдена');
        return plate;
    }
    async getPoolStats() {
        const [total, free, assigned] = await Promise.all([
            database_1.default.qrCodePlate.count(),
            database_1.default.qrCodePlate.count({ where: { status: 'free' } }),
            database_1.default.qrCodePlate.count({ where: { status: 'assigned' } }),
        ]);
        return { total, free, assigned };
    }
}
exports.QrCodePlateService = QrCodePlateService;
exports.qrCodePlateService = new QrCodePlateService();
//# sourceMappingURL=qrCodePlateService.js.map