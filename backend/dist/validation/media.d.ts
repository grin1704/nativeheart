import Joi from 'joi';
export declare const mediaValidation: {
    fileUpload: {
        fileFilter: (req: any, file: Express.Multer.File, cb: any) => void;
        limits: {
            fileSize: number;
            files: number;
        };
    };
    fileId: Joi.ObjectSchema<any>;
    memorialPageId: Joi.ObjectSchema<any>;
    fileMetadata: Joi.ObjectSchema<any>;
};
export declare const validateFileSize: (file: Express.Multer.File) => boolean;
export declare const getFileCategory: (mimeType: string) => "image" | "video" | "unknown";
//# sourceMappingURL=media.d.ts.map