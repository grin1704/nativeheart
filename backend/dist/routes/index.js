"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const memorialPages_1 = __importDefault(require("./memorialPages"));
const media_1 = __importDefault(require("./media"));
const gallery_1 = __importDefault(require("./gallery"));
const memory_1 = __importDefault(require("./memory"));
const tribute_1 = __importDefault(require("./tribute"));
const burialLocation_1 = __importDefault(require("./burialLocation"));
const qrCode_1 = __importDefault(require("./qrCode"));
const collaborator_1 = __importDefault(require("./collaborator"));
const admin_1 = __importDefault(require("./admin"));
const timeline_1 = __importDefault(require("./timeline"));
const qrCodePlateController_1 = require("../controllers/qrCodePlateController");
const qrCodePlateService_1 = require("../services/qrCodePlateService");
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/admin', admin_1.default);
router.use('/memorial-pages', memorialPages_1.default);
router.use('/memorial-pages', timeline_1.default);
router.use('/media', media_1.default);
router.use('/gallery', gallery_1.default);
router.use('/qr-code', qrCode_1.default);
router.get('/qr/:token', qrCodePlateController_1.redirectByToken);
router.get('/qr-plates/:token', async (req, res, next) => {
    try {
        const plate = await qrCodePlateService_1.qrCodePlateService.getPlateByToken(req.params.token);
        res.json({ success: true, data: plate });
    }
    catch (error) {
        next(error);
    }
});
router.use('/', memory_1.default);
router.use('/', tribute_1.default);
router.use('/', burialLocation_1.default);
router.use('/', collaborator_1.default);
router.get('/', (_req, res) => {
    res.json({
        message: 'Memorial Pages API v1.0',
        endpoints: {
            auth: '/api/auth',
            memorialPages: '/api/memorial-pages',
            media: '/api/media',
            gallery: '/api/gallery',
            memories: '/api/memories',
            tributes: '/api/tributes',
            burialLocation: '/api/memorial-pages/:pageId/burial-location',
            qrCode: '/api/qr-code',
            collaborators: '/api/memorial-pages/:pageId/collaborators',
            invitations: '/api/invitations',
            geocoding: '/api/geocode',
            timeline: '/api/memorial-pages/:pageId/timeline',
            admin: '/api/admin',
            health: '/health'
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map