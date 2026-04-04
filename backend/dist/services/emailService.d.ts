export interface CollaboratorInvitationEmailData {
    invitedUserEmail: string;
    invitedUserName: string;
    inviterName: string;
    memorialPageName: string;
    memorialPageSlug: string;
    collaboratorId: string;
}
export interface CollaboratorAcceptedEmailData {
    ownerEmail: string;
    ownerName: string;
    collaboratorName: string;
    memorialPageName: string;
}
export interface CollaboratorDeclinedEmailData {
    ownerEmail: string;
    ownerName: string;
    collaboratorName: string;
    memorialPageName: string;
}
export interface PageChangeNotificationData {
    recipientEmail: string;
    recipientName: string;
    changerName: string;
    memorialPageName: string;
    changeType: string;
    changeDescription: string;
    memorialPageSlug: string;
}
export interface EmailVerificationData {
    email: string;
    name: string;
    verificationToken: string;
}
export interface PasswordResetData {
    email: string;
    name: string;
    resetToken: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendCollaboratorInvitation(data: CollaboratorInvitationEmailData): Promise<void>;
    sendCollaboratorAcceptedNotification(data: CollaboratorAcceptedEmailData): Promise<void>;
    sendCollaboratorDeclinedNotification(data: CollaboratorDeclinedEmailData): Promise<void>;
    sendPageChangeNotification(data: PageChangeNotificationData): Promise<void>;
    sendEmailVerification(data: EmailVerificationData): Promise<void>;
    sendPasswordReset(data: PasswordResetData): Promise<void>;
    testConnection(): Promise<boolean>;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map