export declare class QrCodePlateService {
    private readonly baseUrl;
    constructor();
    createBatch(name: string, count: number): Promise<{
        plates: {
            token: string;
            id: string;
            status: string;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        totalCount: number;
    }>;
    getBatches(): Promise<{
        id: string;
        name: string;
        totalCount: number;
        createdAt: Date;
        freeCount: number;
        assignedCount: number;
    }[]>;
    getPlates(batchId?: string, status?: string, page?: number, limit?: number): Promise<{
        plates: ({
            memorialPage: {
                id: string;
                slug: string;
                fullName: string;
            };
            batch: {
                name: string;
            };
        } & {
            token: string;
            id: string;
            createdAt: Date;
            status: string;
            assignedAt: Date | null;
            memorialPageId: string | null;
            batchId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    assignPlateToPage(memorialPageId: string): Promise<string | null>;
    generatePlateSvg(token: string): Promise<string>;
    exportBatchSvg(batchId: string): Promise<{
        batch: {
            id: string;
            name: string;
        };
        plates: {
            token: string;
            status: string;
            svg: string;
        }[];
    }>;
    getPlateByToken(token: string): Promise<{
        memorialPage: {
            slug: string;
            fullName: string;
        };
    } & {
        token: string;
        id: string;
        createdAt: Date;
        status: string;
        assignedAt: Date | null;
        memorialPageId: string | null;
        batchId: string;
    }>;
    getPoolStats(): Promise<{
        total: number;
        free: number;
        assigned: number;
    }>;
}
export declare const qrCodePlateService: QrCodePlateService;
//# sourceMappingURL=qrCodePlateService.d.ts.map