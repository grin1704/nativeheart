"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalVideoService = exports.ExternalVideoService = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("../utils/errors");
class ExternalVideoService {
    async parseVKVideo(url) {
        const vkVideoRegex = /(?:vk\.com|vkvideo\.ru)\/video(-?\d+_\d+)/;
        const match = url.match(vkVideoRegex);
        if (!match) {
            throw new errors_1.ValidationError('Неверный формат ссылки на видео ВКонтакте');
        }
        const videoId = match[1];
        const externalUrl = `https://vk.com/video${videoId}`;
        const embedCode = `<iframe src="https://vk.com/video_ext.php?oid=${videoId.split('_')[0]}&id=${videoId.split('_')[1]}&hd=2" width="853" height="480" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>`;
        let title;
        let thumbnailUrl;
        try {
            title = `Видео ВКонтакте ${videoId}`;
        }
        catch (error) {
            console.error('Error fetching VK video metadata:', error);
        }
        return {
            videoType: 'vk',
            externalUrl,
            embedCode,
            thumbnailUrl,
            title,
        };
    }
    async parseRutubeVideo(url) {
        const rutubeVideoRegex = /rutube\.ru\/video\/([a-zA-Z0-9]+)/;
        const match = url.match(rutubeVideoRegex);
        if (!match) {
            throw new errors_1.ValidationError('Неверный формат ссылки на видео Rutube');
        }
        const videoId = match[1];
        const externalUrl = `https://rutube.ru/video/${videoId}/`;
        const embedCode = `<iframe width="720" height="405" src="https://rutube.ru/play/embed/${videoId}" frameBorder="0" allow="clipboard-write; autoplay" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;
        let title;
        let description;
        let thumbnailUrl;
        try {
            const response = await axios_1.default.get(`https://rutube.ru/api/video/${videoId}/`, {
                timeout: 5000,
            });
            if (response.data) {
                title = response.data.title;
                description = response.data.description;
                thumbnailUrl = response.data.thumbnail_url;
            }
        }
        catch (error) {
            console.error('Error fetching Rutube video metadata:', error);
            title = `Видео Rutube ${videoId}`;
        }
        return {
            videoType: 'rutube',
            externalUrl,
            embedCode,
            thumbnailUrl,
            title,
            description,
        };
    }
    async parseVideoUrl(url) {
        const normalizedUrl = url.trim();
        if (normalizedUrl.includes('vk.com') || normalizedUrl.includes('vkvideo.ru')) {
            return this.parseVKVideo(normalizedUrl);
        }
        else if (normalizedUrl.includes('rutube.ru')) {
            return this.parseRutubeVideo(normalizedUrl);
        }
        else {
            throw new errors_1.ValidationError('Поддерживаются только видео с ВКонтакте (vk.com, vkvideo.ru) и Rutube');
        }
    }
}
exports.ExternalVideoService = ExternalVideoService;
exports.externalVideoService = new ExternalVideoService();
//# sourceMappingURL=externalVideoService.js.map