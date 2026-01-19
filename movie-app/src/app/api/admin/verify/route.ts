import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Dedicated endpoint to verify super admin access
// ALWAYS checks database - never trusts session cache
// Returns 404 for non-admins to hide admin existence
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            // Return 404 to hide admin existence
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // ALWAYS check database directly - don't trust session cache
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || user.role !== 'SUPER_ADMIN') {
            // Return 404 to hide admin existence
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Only SUPER_ADMIN gets here
        return NextResponse.json({ isAdmin: true });

    } catch (error) {
        // Return 404 even on error to hide admin existence
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
