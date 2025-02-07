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

    // Always set plan to proPlan
    const plan = proPlan

    // Merge the user data with pro plan, ensuring subscription appears active
    return {
        ...plan,
        ...user,
        // Set a far future date for subscription end
        stripeCurrentPeriodEnd: Date.now() + (10 * 365 * 24 * 60 * 60 * 1000),
        // Ensure stripe fields are set even if user doesn't have them
        stripeSubscriptionId: user.stripeSubscriptionId || "sub_pro",
        stripePriceId: user.stripePriceId || proPlan.stripePriceId,
        stripeCustomerId: user.stripeCustomerId || "cus_pro",
        // Force pro status
        isPro: true,
        isSubscribed: true
    }
}

// // @ts-nocheck
// // TODO: Fix this when we turn strict mode on.
// import { UserSubscriptionPlan } from "@/types"
// import { basicPlan, freePlan, hobbyPlan, legacyBasicPlan, proPlan } from "@/config/subscriptions"
// import { db } from "@/lib/db"
// import { stripe } from "@/lib/stripe"

// export async function getUserSubscriptionPlan(
//     userId: string
// ): Promise<UserSubscriptionPlan> {
//     const user = await db.user.findFirst({
//         where: {
//             id: userId,
//         },
//         select: {
//             stripeSubscriptionId: true,
//             stripeCurrentPeriodEnd: true,
//             stripeCustomerId: true,
//             stripePriceId: true,
//         },
//     })

//     if (!user) {
//         throw new Error("User not found")
//     }

//     const hasPlan = user.stripePriceId &&
//         user.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now()

//     let plan = freePlan
//     if (hasPlan) {
//         const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

//         if (subscription.plan.nickname === "Pro plan") {
//             plan = proPlan
//         } else if (subscription.plan.nickname === "Hobby plan") {
//             plan = hobbyPlan
//         } else if (subscription.plan.nickname === "Basic plan") {
//             // if subscription is created before 2024-05-01, it's a legacy plan
//             console.log(subscription.created)
//             if (subscription.created < 1717200000) {
//                 plan = legacyBasicPlan
//             } else {
//                 plan = basicPlan
//             }

//         }
//     }

//     return {
//         ...plan,
//         ...user,
//         stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime(),
//     }
// }