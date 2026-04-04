import { Request, Response } from 'express';
export declare class CollaboratorController {
    inviteCollaborator(req: Request, res: Response): Promise<void>;
    acceptInvitation(req: Request, res: Response): Promise<void>;
    declineInvitation(req: Request, res: Response): Promise<void>;
    removeCollaborator(req: Request, res: Response): Promise<void>;
    getPageCollaborators(req: Request, res: Response): Promise<void>;
    getUserPendingInvitations(req: Request, res: Response): Promise<void>;
    getUserCollaboratorPages(req: Request, res: Response): Promise<void>;
    updateCollaboratorPermissions(req: Request, res: Response): Promise<void>;
    getInvitationDetails(req: Request, res: Response): Promise<void>;
}
export declare const collaboratorController: CollaboratorController;
//# sourceMappingURL=collaboratorController.d.ts.map