"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrCodeService = exports.QRCodeService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
class QRCodeService {
    constructor() {
        this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }
    async generateQRCode(memorialPageId, options = {}) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { slug: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const pageUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;
        const qrOptions = {
            format: options.format || 'png',
            size: options.size || 300,
            margin: options.margin || 2,
            color: {
                dark: options.color?.dark || '#000000',
                light: options.color?.light || '#FFFFFF',
            },
        };
        let dataUrl;
        if (qrOptions.format === 'svg') {
            dataUrl = await qrcode_1.default.toString(pageUrl, {
                type: 'svg',
                width: qrOptions.size,
                margin: qrOptions.margin,
                color: qrOptions.color,
            });
        }
        else {
            dataUrl = await qrcode_1.default.toDataURL(pageUrl, {
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
    async generateAndSaveQRCode(memorialPageId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { slug: true, qrCodeUrl: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const qrCodeUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;
        if (!memorialPage.qrCodeUrl) {
            await database_1.default.memorialPage.update({
                where: { id: memorialPageId },
                data: { qrCodeUrl },
            });
        }
        return qrCodeUrl;
    }
    async getQRCodeData(memorialPageId, options = {}) {
        const qrCodeUrl = await this.generateAndSaveQRCode(memorialPageId);
        const qrOptions = {
            format: options.format || 'png',
            size: options.size || 300,
            margin: options.margin || 2,
            color: {
                dark: options.color?.dark || '#000000',
                light: options.color?.light || '#FFFFFF',
            },
        };
        let dataUrl;
        if (qrOptions.format === 'svg') {
            dataUrl = await qrcode_1.default.toString(qrCodeUrl, {
                type: 'svg',
                width: qrOptions.size,
                margin: qrOptions.margin,
                color: qrOptions.color,
            });
        }
        else {
            dataUrl = await qrcode_1.default.toDataURL(qrCodeUrl, {
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
    async regenerateQRCode(memorialPageId) {
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { slug: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const qrCodeUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;
        await database_1.default.memorialPage.update({
            where: { id: memorialPageId },
            data: { qrCodeUrl },
        });
        return qrCodeUrl;
    }
    validateOptions(options) {
        if (options.format && !['png', 'svg', 'pdf'].includes(options.format)) {
            throw new errors_1.ValidationError('Неподдерживаемый формат QR-кода. Доступны: png, svg, pdf');
        }
        if (options.size && (options.size < 100 || options.size > 1000)) {
            throw new errors_1.ValidationError('Размер QR-кода должен быть от 100 до 1000 пикселей');
        }
        if (options.margin && (options.margin < 0 || options.margin > 10)) {
            throw new errors_1.ValidationError('Отступ QR-кода должен быть от 0 до 10');
        }
    }
    async getQRCodeBuffer(memorialPageId, options = {}) {
        this.validateOptions(options);
        const memorialPage = await database_1.default.memorialPage.findUnique({
            where: { id: memorialPageId },
            select: { slug: true },
        });
        if (!memorialPage) {
            throw new errors_1.NotFoundError('Памятная страница не найдена');
        }
        const pageUrl = `${this.baseUrl}/memorial/${memorialPage.slug}`;
        const qrOptions = {
            width: options.size || 300,
            margin: options.margin || 2,
            color: {
                dark: options.color?.dark || '#000000',
                light: options.color?.light || '#FFFFFF',
            },
        };
        if (options.format === 'svg') {
            const svgString = await qrcode_1.default.toString(pageUrl, {
                type: 'svg',
                ...qrOptions,
            });
            return Buffer.from(svgString, 'utf8');
        }
        else {
            return await qrcode_1.default.toBuffer(pageUrl, qrOptions);
        }
    }
}
exports.QRCodeService = QRCodeService;
exports.qrCodeService = new QRCodeService();
//# sourceMappingURL=qrCodeService.js.map