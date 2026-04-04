export interface QRCodeOptions {
    format?: 'png' | 'svg' | 'pdf';
    size?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
}
export interface QRCodeData {
    url: string;
    dataUrl: string;
    format: string;
    size: number;
}
export declare class QRCodeService {
    private readonly baseUrl;
    constructor();
    generateQRCode(memorialPageId: string, options?: QRCodeOptions): Promise<QRCodeData>;
    generateAndSaveQRCode(memorialPageId: string): Promise<string>;
    getQRCodeData(memorialPageId: string, options?: QRCodeOptions): Promise<QRCodeData>;
    regenerateQRCode(memorialPageId: string): Promise<string>;
    private validateOptions;
    getQRCodeBuffer(memorialPageId: string, options?: QRCodeOptions): Promise<Buffer>;
}
export declare const qrCodeService: QRCodeService;
//# sourceMappingURL=qrCodeService.d.ts.map