import { Request, Response } from 'express';
export declare class AdminSettingsController {
    getSystemSettings(_req: Request, res: Response): Promise<void>;
    updateSystemSettings(req: Request, res: Response): Promise<void>;
    getSetting(req: Request, res: Response): Promise<void>;
    updateSetting(req: Request, res: Response): Promise<void>;
    getSystemStatistics(_req: Request, res: Response): Promise<void>;
    exportSettings(_req: Request, res: Response): Promise<void>;
    importSettings(req: Request, res: Response): Promise<void>;
    resetToDefaults(req: Request, res: Response): Promise<void>;
    testConnections(_req: Request, res: Response): Promise<void>;
}
export declare const adminSettingsController: AdminSettingsController;
//# sourceMappingURL=adminSettingsController.d.ts.map