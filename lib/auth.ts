import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/lib/db"
import { sendWelcomeEmail } from "./emails/send-welcome";
import { proPlan } from "@/config/subscriptions"

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
      }
    },
  },
  events: {
    async createUser(message) {
      // Set pro subscription for new user
      await db.user.update({
        where: { id: message.user.id },
        data: {
          stripePriceId: proPlan.stripePriceId,
          stripeSubscriptionId: "sub_" + message.user.id,
          stripeCustomerId: "cus_" + message.user.id,
          stripeCurrentPeriodEnd: new Date(2999, 12, 31),
        },
      });

      const params = {
        name: message.user.name,
        email: message.user.email,
      };
      await sendWelcomeEmail(params);
    }
  },
};

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
