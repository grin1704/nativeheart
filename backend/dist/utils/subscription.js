"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubscriptionActive = exports.createTrialSubscription = exports.getFeatureAccess = void 0;
const getFeatureAccess = (subscriptionType, subscriptionExpiresAt, isPagePremium) => {
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
    const isExpired = subscriptionExpiresAt && new Date() > subscriptionExpiresAt;
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
exports.getFeatureAccess = getFeatureAccess;
const createTrialSubscription = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    return {
        subscriptionType: 'trial',
        expiresAt,
    };
};
exports.createTrialSubscription = createTrialSubscription;
const isSubscriptionActive = (subscriptionType, subscriptionExpiresAt) => {
    if (subscriptionType === 'free') {
        return true;
    }
    if (!subscriptionExpiresAt) {
        return false;
    }
    return new Date() <= subscriptionExpiresAt;
};
exports.isSubscriptionActive = isSubscriptionActive;
//# sourceMappingURL=subscription.js.map