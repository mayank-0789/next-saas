import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import prismaClient from "@/lib/db";

const handler = NextAuth({
    providers:[
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
        async signIn(params){
            if(!params.user.email){
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
            } catch(error) {
                console.error(error);
                return false;
            }
        }
    }
});

export { handler as GET, handler as POST };
