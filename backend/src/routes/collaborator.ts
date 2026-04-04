import { Router } from 'express';
import { collaboratorController } from '../controllers/collaboratorController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All collaborator routes require authentication
router.use(requireAuth);

// Memorial page collaborator management
router.post('/memorial-pages/:pageId/collaborators', collaboratorController.inviteCollaborator);
router.get('/memorial-pages/:pageId/collaborators', collaboratorController.getPageCollaborators);
router.delete('/memorial-pages/:pageId/collaborators/:collaboratorId', collaboratorController.removeCollaborator);
router.put('/memorial-pages/:pageId/collaborators/:collaboratorId/permissions', collaboratorController.updateCollaboratorPermissions);

// User's collaborator-related endpoints
router.get('/my/invitations', collaboratorController.getUserPendingInvitations);
router.get('/my/collaborator-pages', collaboratorController.getUserCollaboratorPages);

// Invitation management
router.get('/invitations/:collaboratorId', collaboratorController.getInvitationDetails);
router.post('/invitations/:collaboratorId/accept', collaboratorController.acceptInvitation);
router.post('/invitations/:collaboratorId/decline', collaboratorController.declineInvitation);

export default router;