import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/lib/db"
import { sendWelcomeEmail } from "./emails/send-welcome";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as any),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session!.user!.id = token.id
        session!.user!.name = token.name
        session!.user!.email = token.email
        session!.user!.image = token.picture
        // Add Pro status
        session!.user!.isPro = true
        session!.user!.stripeSubscriptionId = "sub_pro"
        session!.user!.stripePriceId = "price_pro"
        session!.user!.stripeCustomerId = "cus_pro"
        session!.user!.stripeCurrentPeriodEnd = new Date(2999, 12, 31)
      }

      return session
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user?.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        isPro: true
      }
    },
  },
  events: {
    async createUser(message) {
      const params = {
        name: message.user.name,
        email: message.user.email,
      };
      await sendWelcomeEmail(params);
    }
  },
};

// Add types for the enhanced session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
      isPro: boolean
      stripeSubscriptionId: string
      stripePriceId: string
      stripeCustomerId: string
      stripeCurrentPeriodEnd: Date
    }
  }
}

// import { type NextAuthOptions } from "next-auth";
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import GithubProvider from "next-auth/providers/github"
// import GoogleProvider from "next-auth/providers/google";

// import { db } from "@/lib/db"
// import { sendWelcomeEmail } from "./emails/send-welcome";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(db as any),
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/login",
//   },
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_ID as string,
//       clientSecret: process.env.GITHUB_SECRET as string,
//       allowDangerousEmailAccountLinking: true,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       allowDangerousEmailAccountLinking: true,
//     })
//   ],
//   callbacks: {
//     async session({ token, session }) {
//       if (token) {
//         session!.user!.id = token.id
//         session!.user!.name = token.name
//         session!.user!.email = token.email
//         session!.user!.image = token.picture
//       }

//       return session
//     },
//     async jwt({ token, user }) {
//       const dbUser = await db.user.findFirst({
//         where: {
//           email: token.email,
//         },
//       })

//       if (!dbUser) {
//         if (user) {
//           token.id = user?.id
//         }
//         return token
//       }

//       return {
//         id: dbUser.id,
//         name: dbUser.name,
//         email: dbUser.email,
//         picture: dbUser.image,
//       }
//     },
//   },
//   events: {
//     async createUser(message) {
//       const params = {
//         name: message.user.name,
//         email: message.user.email,
//       };
//       await sendWelcomeEmail(params);
//     }
//   },
// };

