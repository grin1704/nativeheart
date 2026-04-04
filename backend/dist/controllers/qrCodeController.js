"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicQRCode = exports.regenerateQRCode = exports.downloadQRCode = exports.getQRCode = void 0;
const qrCodeService_1 = require("../services/qrCodeService");
const memorialPageService_1 = require("../services/memorialPageService");
const getQRCode = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const { format, size, margin, darkColor, lightColor } = req.query;
        if (req.user) {
            try {
                await memorialPageService_1.memorialPageService.getMemorialPageById(pageId, req.user.id);
            }
            catch (error) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет доступа к этой странице',
                });
            }
        }
        const options = {};
        if (format && typeof format === 'string') {
            if (!['png', 'svg'].includes(format)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неподдерживаемый формат. Доступны: png, svg',
                });
            }
            options.format = format;
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
        const qrCodeData = await qrCodeService_1.qrCodeService.getQRCodeData(pageId, options);
        return res.json({
            success: true,
            data: qrCodeData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQRCode = getQRCode;
const downloadQRCode = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const { format, size, margin, darkColor, lightColor } = req.query;
        if (req.user) {
            try {
                await memorialPageService_1.memorialPageService.getMemorialPageById(pageId, req.user.id);
            }
            catch (error) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет доступа к этой странице',
                });
            }
        }
        const options = {};
        if (format && typeof format === 'string') {
            if (!['png', 'svg'].includes(format)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неподдерживаемый формат. Доступны: png, svg',
                });
            }
            options.format = format;
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
        const memorialPage = await memorialPageService_1.memorialPageService.getMemorialPageById(pageId, req.user?.id);
        const qrCodeBuffer = await qrCodeService_1.qrCodeService.getQRCodeBuffer(pageId, options);
        const fileFormat = options.format || 'png';
        const fileName = `qr-code-${memorialPage.slug}.${fileFormat}`;
        res.setHeader('Content-Type', fileFormat === 'svg' ? 'image/svg+xml' : 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', qrCodeBuffer.length);
        res.send(qrCodeBuffer);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadQRCode = downloadQRCode;
const regenerateQRCode = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется аутентификация',
            });
        }
        try {
            await memorialPageService_1.memorialPageService.getMemorialPageById(pageId, req.user.id);
        }
        catch (error) {
            return res.status(403).json({
                success: false,
                message: 'У вас нет доступа к этой странице',
            });
        }
        const qrCodeUrl = await qrCodeService_1.qrCodeService.regenerateQRCode(pageId);
        return res.json({
            success: true,
            data: {
                qrCodeUrl,
                message: 'QR-код успешно обновлен',
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.regenerateQRCode = regenerateQRCode;
const getPublicQRCode = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { format, size, margin, darkColor, lightColor } = req.query;
        const memorialPage = await memorialPageService_1.memorialPageService.getMemorialPageBySlug(slug);
        const options = {};
        if (format && typeof format === 'string') {
            if (!['png', 'svg'].includes(format)) {
                return res.status(400).json({
                    success: false,
                    message: 'Неподдерживаемый формат. Доступны: png, svg',
                });
            }
            options.format = format;
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
        const qrCodeData = await qrCodeService_1.qrCodeService.getQRCodeData(memorialPage.id, options);
        return res.json({
            success: true,
            data: qrCodeData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicQRCode = getPublicQRCode;
//# sourceMappingURL=qrCodeController.js.map