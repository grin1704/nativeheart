export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionType: 'trial' | 'free' | 'premium';
  subscriptionExpiresAt: Date | null;
  createdAt: Date;
}

export interface MemorialPage {
  id: string;
  slug: string;
  ownerId: string;
  fullName: string;
  birthDate: Date;
  deathDate: Date;
  mainPhotoId?: string;
  biographyText?: string;
  isPrivate: boolean;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFile {
  id: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface VideoGalleryItem {
  id: string;
  memorialPageId: string;
  mediaFileId?: string;
  videoType: 'upload' | 'vk' | 'rutube';
  externalUrl?: string;
  embedCode?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  orderIndex: number;
  createdAt: Date;
  mediaFile?: MediaFile;
}

export interface ExternalVideoInfo {
  videoType: 'vk' | 'rutube';
  externalUrl: string;
  embedCode: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export interface Memory {
  id: string;
  memorialPageId: string;
  date: Date;
  title: string;
  description?: string;
  photos: MediaFile[];
  createdAt: Date;
}

export interface Tribute {
  id: string;
  memorialPageId: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  photo?: MediaFile;
  isApproved: boolean;
  createdAt: Date;
}

export interface BurialLocation {
  id: string;
  memorialPageId: string;
  address: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
}

export interface TimelineEvent {
  id: string;
  memorialPageId: string;
  year: number;
  month?: number | null;
  day?: number | null;
  description: string;
  location?: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[] | string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}