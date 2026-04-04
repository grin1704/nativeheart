export interface ModerationStats {
    pendingMemorialPages: number;
    pendingTributes: number;
    pendingMemories: number;
    totalModerated: number;
}
export interface ModerationItem {
    id: string;
    contentType: 'memorial_page' | 'tribute' | 'memory';
    contentId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    moderatedAt?: Date;
    moderatorId?: string;
    reason?: string;
    content?: any;
}
export interface MemorialPageModerationData {
    id: string;
    fullName: string;
    slug: string;
    biographyText?: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface TributeModerationData {
    id: string;
    authorName: string;
    authorEmail?: string;
    text: string;
    memorialPage: {
        id: string;
        fullName: string;
        slug: string;
    };
    createdAt: Date;
}
export interface MemoryModerationData {
    id: string;
    title: string;
    description?: string;
    date: Date;
    memorialPage: {
        id: string;
        fullName: string;
        slug: string;
    };
    createdAt: Date;
}
declare class AdminModerationService {
    getModerationStats(): Promise<ModerationStats>;
    getModerationQueue(contentType?: 'memorial_page' | 'tribute' | 'memory', status?: 'pending' | 'approved' | 'rejected', page?: number, limit?: number): Promise<{
        items: ModerationItem[];
        total: number;
        totalPages: number;
    }>;
    private getMemorialPageForModeration;
    private getTributeForModeration;
    private getMemoryForModeration;
    approveContent(moderationId: string, moderatorId: string, reason?: string): Promise<void>;
    rejectContent(moderationId: string, moderatorId: string, reason: string): Promise<void>;
    deleteInappropriateContent(contentType: 'memorial_page' | 'tribute' | 'memory', contentId: string, moderatorId: string, reason: string): Promise<void>;
    createModerationRecord(contentType: 'memorial_page' | 'tribute' | 'memory', contentId: string): Promise<void>;
    getModerationHistory(contentType: 'memorial_page' | 'tribute' | 'memory', contentId: string): Promise<ModerationItem[]>;
}
export declare const adminModerationService: AdminModerationService;
export {};
//# sourceMappingURL=adminModerationService.d.ts.map