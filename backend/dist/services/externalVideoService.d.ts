export interface VideoInfo {
    videoType: 'vk' | 'rutube';
    externalUrl: string;
    embedCode: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
}
export declare class ExternalVideoService {
    parseVKVideo(url: string): Promise<VideoInfo>;
    parseRutubeVideo(url: string): Promise<VideoInfo>;
    parseVideoUrl(url: string): Promise<VideoInfo>;
}
export declare const externalVideoService: ExternalVideoService;
//# sourceMappingURL=externalVideoService.d.ts.map