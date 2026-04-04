import { PaginationParams, PaginatedResponse } from '../types';
import { CollaboratorPermissions } from '../types/collaborator';
export interface InviteCollaboratorData {
    email: string;
    permissions?: CollaboratorPermissions;
}
export interface CollaboratorWithUser {
    id: string;
    memorialPageId: string;
    userId: string;
    permissions: CollaboratorPermissions;
    invitedAt: Date;
    acceptedAt: Date | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
}
export interface CollaboratorInvitation {
    id: string;
    memorialPageId: string;
    memorialPageName: string;
    inviterName: string;
    permissions: CollaboratorPermissions;
    invitedAt: Date;
}
export declare class CollaboratorService {
    inviteCollaborator(pageId: string, inviterId: string, data: InviteCollaboratorData): Promise<CollaboratorWithUser>;
    acceptInvitation(collaboratorId: string, userId: string): Promise<CollaboratorWithUser>;
    declineInvitation(collaboratorId: string, userId: string): Promise<void>;
    removeCollaborator(pageId: string, collaboratorId: string, requesterId: string): Promise<void>;
    getPageCollaborators(pageId: string, requesterId: string, params: PaginationParams): Promise<PaginatedResponse<CollaboratorWithUser>>;
    getUserPendingInvitations(userId: string, params: PaginationParams): Promise<PaginatedResponse<CollaboratorInvitation>>;
    getUserCollaboratorPages(userId: string, params: PaginationParams): Promise<PaginatedResponse<any>>;
    updateCollaboratorPermissions(pageId: string, collaboratorId: string, permissions: CollaboratorPermissions, requesterId: string): Promise<CollaboratorWithUser>;
    checkPageAccess(pageId: string, userId: string): Promise<boolean>;
    checkEditAccess(pageId: string, userId: string): Promise<boolean>;
    checkSectionPermission(pageId: string, userId: string, section: keyof CollaboratorPermissions): Promise<boolean>;
    getInvitationDetails(collaboratorId: string, userId: string): Promise<CollaboratorInvitation>;
    notifyPageChange(pageId: string, changeMadeBy: string, changeType: string, changeDescription: string): Promise<void>;
}
export declare const collaboratorService: CollaboratorService;
//# sourceMappingURL=collaboratorService.d.ts.map