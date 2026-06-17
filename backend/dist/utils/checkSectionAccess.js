"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSectionAccess = checkSectionAccess;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("./errors");
async function checkSectionAccess(pageId, userId, section) {
    const page = await database_1.default.memorialPage.findUnique({
        where: { id: pageId },
        select: { ownerId: true },
    });
    if (!page) {
        throw new errors_1.NotFoundError('Памятная страница не найдена');
    }
    if (page.ownerId === userId)
        return;
    const collaborator = await database_1.default.collaborator.findFirst({
        where: {
            memorialPageId: pageId,
            userId,
            acceptedAt: { not: null },
        },
    });
    if (!collaborator) {
        throw new errors_1.ForbiddenError('У вас нет прав для редактирования этой страницы');
    }
    const permissions = collaborator.permissions;
    if (!permissions[section]) {
        throw new errors_1.ForbiddenError(`У вас нет прав для редактирования раздела "${section}"`);
    }
}
//# sourceMappingURL=checkSectionAccess.js.map