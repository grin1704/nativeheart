export interface CreateTimelineEventData {
    year: number;
    description: string;
    orderIndex?: number;
}
export interface UpdateTimelineEventData {
    year?: number;
    description?: string;
    orderIndex?: number;
}
export declare const timelineService: {
    getTimelineEvents(memorialPageId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        memorialPageId: string;
        description: string;
        orderIndex: number;
        year: number;
        day: number | null;
        month: number | null;
        location: string | null;
    }[]>;
    createTimelineEvent(memorialPageId: string, data: CreateTimelineEventData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        memorialPageId: string;
        description: string;
        orderIndex: number;
        year: number;
        day: number | null;
        month: number | null;
        location: string | null;
    }>;
    updateTimelineEvent(eventId: string, data: UpdateTimelineEventData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        memorialPageId: string;
        description: string;
        orderIndex: number;
        year: number;
        day: number | null;
        month: number | null;
        location: string | null;
    }>;
    deleteTimelineEvent(eventId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        memorialPageId: string;
        description: string;
        orderIndex: number;
        year: number;
        day: number | null;
        month: number | null;
        location: string | null;
    }>;
    reorderTimelineEvents(memorialPageId: string, eventIds: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        memorialPageId: string;
        description: string;
        orderIndex: number;
        year: number;
        day: number | null;
        month: number | null;
        location: string | null;
    }[]>;
    getTimelineEvent(eventId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        memorialPageId: string;
        description: string;
        orderIndex: number;
        year: number;
        day: number | null;
        month: number | null;
        location: string | null;
    }>;
    checkEditAccess(memorialPageId: string, userId: string): Promise<void>;
    isCollaborator(memorialPageId: string, userId: string): Promise<boolean>;
};
//# sourceMappingURL=timelineService.d.ts.map