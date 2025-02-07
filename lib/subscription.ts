// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { UserSubscriptionPlan } from "@/types"
import { basicPlan, freePlan, hobbyPlan, legacyBasicPlan, proPlan } from "@/config/subscriptions"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function getUserSubscriptionPlan(
    userId: string
): Promise<UserSubscriptionPlan> {
    const user = await db.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            stripeSubscriptionId: true,
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
        },
    })

    if (!user) {
        throw new Error("User not found")
    }

    // Skip all plan checks and always return pro plan
    return {
        ...proPlan,
        ...user,
        // Ensure subscription never expires
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime() || Date.now() + (10 * 365 * 24 * 60 * 60 * 1000),
        // Force pro status
        stripePriceId: proPlan.stripePriceId,
        stripeSubscriptionId: user.stripeSubscriptionId || "sub_pro",
        stripeCustomerId: user.stripeCustomerId || "cus_pro",
        name: proPlan.name,
        isPro: true,
        isSubscribed: true,
        isCanceled: false
    }
}
