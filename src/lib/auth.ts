import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { NextResponse } from "next/server";

/**
 * Get the current authenticated user session
 * @returns Promise<Session | null>
 */
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session;
}

/**
 * Get the current user ID from session
 * @returns Promise<string | null>
 */
export async function getCurrentUserId() {
    const session = await getCurrentUser();
    return session?.user?.id || null;
}

/**
 * Middleware to check if user is authenticated
 * Returns user ID if authenticated, or NextResponse error if not
 */
export async function requireAuth() {
    const userId = await getCurrentUserId();
    
    if (!userId) {
        return {
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            userId: null
        };
    }
    
    return {
        error: null,
        userId
    };
} 