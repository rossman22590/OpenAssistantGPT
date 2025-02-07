// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { UserSubscriptionPlan } from "@/types"
import { proPlan } from "@/config/subscriptions"
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

    // Create a Pro plan object with specific settings
    const enhancedProPlan = {
        ...proPlan,
        name: "Pro plan",
        description: "Pro plan with unlimited access",
        stripePriceId: "price_pro", // You can set this to match your Stripe price ID
        price: 0, // Set to 0 or any value you want to show
        features: [
            "Unlimited API requests",
            "Priority support",
            "Custom domains",
            "Advanced analytics",
            "Team collaboration",
            "All premium features"
        ],
    }

    // Return enhanced Pro plan with user data
    return {
        ...enhancedProPlan,
        ...user,
        // Set subscription end date far in the future (10 years)
        stripeCurrentPeriodEnd: Date.now() + (10 * 365 * 24 * 60 * 60 * 1000),
        // Force the subscription to appear active
        isSubscribed: true,
        isCanceled: false,
        isActive: true,
        isPro: true
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