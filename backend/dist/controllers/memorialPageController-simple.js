"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memorialPageController = exports.MemorialPageController = void 0;
const database_1 = __importDefault(require("../config/database"));
const slug_1 = require("../utils/slug");
class MemorialPageController {
    async createMemorialPage(req, res) {
        try {
            const { fullName, birthDate, deathDate, shortDescription } = req.body;
            const userId = req.user.id;
            const baseSlug = (0, slug_1.generateSlug)(fullName);
            let slug = baseSlug;
            let counter = 1;
            while (await database_1.default.memorialPage.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            const memorialPage = await database_1.default.memorialPage.create({
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
        }
        catch (error) {
            console.error('Create memorial page error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to create memorial page',
            });
        }
    }
    async getMemorialPage(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const memorialPage = await database_1.default.memorialPage.findUnique({
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
            if (memorialPage.ownerId !== userId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            res.json(memorialPage);
        }
        catch (error) {
            console.error('Get memorial page error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to get memorial page',
            });
        }
    }
    async getUserMemorialPages(req, res) {
        try {
            const userId = req.user.id;
            const memorialPages = await database_1.default.memorialPage.findMany({
                where: { ownerId: userId },
                orderBy: { createdAt: 'desc' },
            });
            res.json({
                success: true,
                data: memorialPages,
            });
        }
        catch (error) {
            console.error('Get user memorial pages error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to get memorial pages',
            });
        }
    }
}
exports.MemorialPageController = MemorialPageController;
exports.memorialPageController = new MemorialPageController();
//# sourceMappingURL=memorialPageController-simple.js.map