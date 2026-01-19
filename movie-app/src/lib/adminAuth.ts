import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Checks if the current user is a SUPER_ADMIN.
 * ALWAYS checks database directly - never trusts session cache.
 * Returns the session and admin status, or null if not authenticated.
 */
export async function checkSuperAdmin() {
    const session = await auth();

    if (!session?.user?.id) {
        return { isAdmin: false, session: null, userId: null };
    }

    // ALWAYS check database directly - session can have stale role
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, id: true }
    });

    return {
        isAdmin: user?.role === 'SUPER_ADMIN',
        session,
        userId: session.user.id
    };
}

/**
 * Returns a 404 response to hide admin route existence from unauthorized users.
 * This is a security measure to prevent attackers from discovering admin endpoints.
 */
export function notFoundResponse() {
    return NextResponse.json(
        { error: 'Not found' },
        {
            status: 404,
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        }
    );
}

/**
 * Standard error response for admin routes (hides internal errors from users)
 */
export function errorResponse(message: string = 'An error occurred') {
    return NextResponse.json(
        { error: message },
        {
            status: 500,
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'no-store'
            }
        }
    );
}

/**
 * Success response with security headers
 */
export function jsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, {
        status,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'private, no-cache'
        }
    });
}
