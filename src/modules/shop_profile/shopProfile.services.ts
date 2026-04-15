import { ShopProfile } from "./shopProfile.ts";

export class ShopProfileService {
    toDict(shopProfile: ShopProfile): object {
        return {
        id: shopProfile.id,
        name: shopProfile.name,
        tagline: shopProfile.tagline,
        address: shopProfile.address,
        phone: shopProfile.phone,
        email: shopProfile.email,
        logo_url: shopProfile.logoUrl,
        currency: shopProfile.currency,
        default_washer_rate_per_minute: shopProfile.defaultWasherRatePerMinute,
        default_dryer_rate_per_minute: shopProfile.defaultDryerRatePerMinute,
        opening_time: shopProfile.openingTime,
        closing_time: shopProfile.closingTime,
        updated_at: shopProfile.updatedAt ? shopProfile.updatedAt.toISOString() : null,
        };
    }
}