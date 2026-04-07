"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectByToken = exports.getPoolStats = exports.exportBatchSvg = exports.getPlates = exports.getBatches = exports.createBatch = void 0;
const archiver_1 = __importDefault(require("archiver"));
const qrCodePlateService_1 = require("../services/qrCodePlateService");
const createBatch = async (req, res, next) => {
    try {
        const { name, count } = req.body;
        if (!name || !count) {
            return res.status(400).json({ success: false, message: 'Укажите name и count' });
        }
        const batch = await qrCodePlateService_1.qrCodePlateService.createBatch(name, Number(count));
        return res.status(201).json({ success: true, data: batch });
    }
    catch (error) {
        next(error);
    }
};
exports.createBatch = createBatch;
const getBatches = async (_req, res, next) => {
    try {
        const batches = await qrCodePlateService_1.qrCodePlateService.getBatches();
        return res.json({ success: true, data: batches });
    }
    catch (error) {
        next(error);
    }
};
exports.getBatches = getBatches;
const getPlates = async (req, res, next) => {
    try {
        const { batchId, status, page, limit } = req.query;
        const result = await qrCodePlateService_1.qrCodePlateService.getPlates(batchId, status, page ? Number(page) : 1, limit ? Number(limit) : 50);
        return res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlates = getPlates;
const exportBatchSvg = async (req, res, next) => {
    try {
        const { batchId } = req.params;
        const data = await qrCodePlateService_1.qrCodePlateService.exportBatchSvg(batchId);
        const encodedName = encodeURIComponent(data.batch.name);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="qr-plates.zip"; filename*=UTF-8''${encodedName}.zip`);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => next(err));
        archive.pipe(res);
        for (const plate of data.plates) {
            archive.append(plate.svg, { name: `qr-${plate.token}.svg` });
        }
        await archive.finalize();
    }
    catch (error) {
        next(error);
    }
};
exports.exportBatchSvg = exportBatchSvg;
const getPoolStats = async (_req, res, next) => {
    try {
        const stats = await qrCodePlateService_1.qrCodePlateService.getPoolStats();
        return res.json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
};
exports.getPoolStats = getPoolStats;
const redirectByToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const plate = await qrCodePlateService_1.qrCodePlateService.getPlateByToken(token);
        if (plate.status === 'assigned' && plate.memorialPage) {
            return res.redirect(302, `/memorial/${plate.memorialPage.slug}`);
        }
        return res.redirect(302, `/qr/${token}/pending`);
    }
    catch (error) {
        next(error);
    }
};
exports.redirectByToken = redirectByToken;
//# sourceMappingURL=qrCodePlateController.js.map