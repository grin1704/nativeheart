export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    subscriptionType: string;
    subscriptionExpiresAt: Date | null;
    emailVerified: boolean;
    oauthProvider: string | null;
    oauthId: string | null;
  };
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  subscriptionType: string;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    subscriptionType: string;
    subscriptionExpiresAt: Date | null;
    emailVerified: boolean;
    oauthProvider: string | null;
    oauthId: string | null;
  };
}

export type SubscriptionType = 'trial' | 'free' | 'premium';

export interface FeatureAccess {
  unlimitedBiography: boolean;
  photoGallery: boolean;
  videoGallery: boolean;
  memories: boolean;
  tributes: boolean;
  collaborators: boolean;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}