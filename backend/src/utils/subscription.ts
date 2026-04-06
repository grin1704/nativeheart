import { FeatureAccess, SubscriptionType } from '../types/auth';

export const getFeatureAccess = (subscriptionType: SubscriptionType, subscriptionExpiresAt: Date | null, isPagePremium?: boolean): FeatureAccess => {
  // Premium page always has full access regardless of owner's subscription
  if (isPagePremium) {
    return {
      unlimitedBiography: true,
      photoGallery: true,
      videoGallery: true,
      memories: true,
      tributes: true,
      collaborators: true,
    };
  }

  // Check if subscription is expired
  const isExpired = subscriptionExpiresAt && new Date() > subscriptionExpiresAt;
  
  // If trial or premium is expired, treat as free
  const effectiveType = isExpired ? 'free' : subscriptionType;

  switch (effectiveType) {
    case 'trial':
    case 'premium':
      return {
        unlimitedBiography: true,
        photoGallery: true,
        videoGallery: true,
        memories: true,
        tributes: true,
        collaborators: true,
      };
    case 'free':
    default:
      return {
        unlimitedBiography: false,
        photoGallery: false,
        videoGallery: false,
        memories: false,
        tributes: false,
        collaborators: false,
      };
  }
};

export const createTrialSubscription = (): { subscriptionType: SubscriptionType; expiresAt: Date } => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14); // 14 days trial
  
  return {
    subscriptionType: 'trial',
    expiresAt,
  };
};

export const isSubscriptionActive = (subscriptionType: SubscriptionType, subscriptionExpiresAt: Date | null): boolean => {
  if (subscriptionType === 'free') {
    return true; // Free is always active
  }
  
  if (!subscriptionExpiresAt) {
    return false;
  }
  
  return new Date() <= subscriptionExpiresAt;
};