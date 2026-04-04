export interface CollaboratorPermissions {
  basicInfo: boolean;      // Основная информация (имя, даты)
  biography: boolean;      // Биография
  gallery: boolean;        // Фото и видео галерея
  memories: boolean;       // Воспоминания
  timeline: boolean;       // Хронология жизни
  tributes: boolean;       // Отзывы (модерация)
  burialLocation: boolean; // Место захоронения
}

export const DEFAULT_PERMISSIONS: CollaboratorPermissions = {
  basicInfo: true,
  biography: true,
  gallery: true,
  memories: true,
  timeline: true,
  tributes: true,
  burialLocation: true,
};

export const PERMISSION_LABELS: Record<keyof CollaboratorPermissions, string> = {
  basicInfo: 'Основная информация',
  biography: 'Биография',
  gallery: 'Галерея',
  memories: 'Воспоминания',
  timeline: 'Хронология',
  tributes: 'Отзывы',
  burialLocation: 'Место захоронения',
};
