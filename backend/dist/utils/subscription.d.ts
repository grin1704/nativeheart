import { FeatureAccess, SubscriptionType } from '../types/auth';
export declare const getFeatureAccess: (subscriptionType: SubscriptionType, subscriptionExpiresAt: Date | null) => FeatureAccess;
export declare const createTrialSubscription: () => {
    subscriptionType: SubscriptionType;
    expiresAt: Date;
};
export declare const isSubscriptionActive: (subscriptionType: SubscriptionType, subscriptionExpiresAt: Date | null) => boolean;
//# sourceMappingURL=subscription.d.ts.map