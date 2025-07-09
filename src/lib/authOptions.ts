import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import prismaClient from "@/lib/db";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        })
    ],
    callbacks: {
        async signIn(params) {
            if (!params.user.email) {
                return false;
            }

            try {
                await prismaClient.user.upsert({
                    where: {
                        email: params.user.email
                    },
                    create: {
                        email: params.user.email,
                        provider: (params.account?.provider === "google" ? "Google" : "Github"),
                        name: params.user.name || null
                    },
                    update: {
                        provider: (params.account?.provider === "google" ? "Google" : "Github"),
                        name: params.user.name || null
                    }
                });
                return true;
            } catch (error) {
                console.error("Error during sign in:", error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            // Add user ID to token when user signs in
            if (user && account) {
                const dbUser = await prismaClient.user.findUnique({
                    where: { email: user.email! }
                });
                if (dbUser) {
                    token.userId = dbUser.id;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add user ID to session
            if (token.userId) {
                session.user.id = token.userId as string;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}; 
