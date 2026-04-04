export interface CreateTributeData {
    memorialPageId: string;
    authorName: string;
    authorEmail?: string;
    text: string;
    photoId?: string;
}
export interface UpdateTributeData {
    authorName?: string;
    authorEmail?: string;
    text?: string;
    photoId?: string;
    isApproved?: boolean;
}
export interface TributeFilters {
    page?: number;
    limit?: number;
    approved?: boolean | 'all';
}
export interface TributeWithDetails {
    id: string;
    memorialPageId: string;
    authorName: string;
    authorEmail: string | null;
    text: string;
    photoId: string | null;
    isApproved: boolean;
    likesCount: number;
    createdAt: Date;
    photo?: {
        id: string;
        url: string;
        thumbnailUrl?: string | null;
        originalName: string;
    } | null;
}
declare class TributeService {
    createTribute(data: CreateTributeData): Promise<TributeWithDetails>;
    getTributesByMemorialPage(memorialPageId: string, filters?: TributeFilters, userId?: string): Promise<{
        tributes: TributeWithDetails[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTributeById(id: string): Promise<TributeWithDetails>;
    updateTribute(id: string, data: UpdateTributeData): Promise<TributeWithDetails>;
    deleteTribute(id: string): Promise<void>;
    moderateTribute(id: string, isApproved: boolean, reason?: string): Promise<TributeWithDetails>;
    getTributesForModeration(filters?: TributeFilters): Promise<{
        tributes: TributeWithDetails[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    likeTribute(tributeId: string, userId?: string, fingerprint?: string): Promise<{
        likesCount: number;
        isLiked: boolean;
    }>;
    unlikeTribute(tributeId: string, userId?: string, fingerprint?: string): Promise<{
        likesCount: number;
        isLiked: boolean;
    }>;
    checkIfLiked(tributeId: string, userId?: string, fingerprint?: string): Promise<boolean>;
}
declare const _default: TributeService;
export default _default;
//# sourceMappingURL=tributeService.d.ts.map