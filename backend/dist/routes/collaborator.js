"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collaboratorController_1 = require("../controllers/collaboratorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/memorial-pages/:pageId/collaborators', collaboratorController_1.collaboratorController.inviteCollaborator);
router.get('/memorial-pages/:pageId/collaborators', collaboratorController_1.collaboratorController.getPageCollaborators);
router.delete('/memorial-pages/:pageId/collaborators/:collaboratorId', collaboratorController_1.collaboratorController.removeCollaborator);
router.put('/memorial-pages/:pageId/collaborators/:collaboratorId/permissions', collaboratorController_1.collaboratorController.updateCollaboratorPermissions);
router.get('/my/invitations', collaboratorController_1.collaboratorController.getUserPendingInvitations);
router.get('/my/collaborator-pages', collaboratorController_1.collaboratorController.getUserCollaboratorPages);
router.get('/invitations/:collaboratorId', collaboratorController_1.collaboratorController.getInvitationDetails);
router.post('/invitations/:collaboratorId/accept', collaboratorController_1.collaboratorController.acceptInvitation);
router.post('/invitations/:collaboratorId/decline', collaboratorController_1.collaboratorController.declineInvitation);
exports.default = router;
//# sourceMappingURL=collaborator.js.map