export interface CollaboratorPermissions {
    basicInfo: boolean;
    biography: boolean;
    gallery: boolean;
    memories: boolean;
    timeline: boolean;
    tributes: boolean;
    burialLocation: boolean;
}
export declare const DEFAULT_PERMISSIONS: CollaboratorPermissions;
export declare const PERMISSION_LABELS: Record<keyof CollaboratorPermissions, string>;
//# sourceMappingURL=collaborator.d.ts.map