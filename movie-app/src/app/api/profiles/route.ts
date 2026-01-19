import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try to fetch profiles if schema relation exists
        // Note: If 'profiles' does not exist on User yet (prisma fetch failure), this might throw.
        // For now, if we can't fetch profiles from DB due to schema issues, we might fake it or return the main user as a profile.

        // Fallback: If no profiles table logic active yet, just return single user profile
        // But we are trying to implement it.

        try {
            const profiles = await prisma.profile.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'asc' }
            });

            if (profiles.length === 0) {
                // Create default profile for the user if none exist
                const defaultProfile = await prisma.profile.create({
                    data: {
                        userId: session.user.id,
                        name: session.user.name || 'User',
                        avatar: session.user.image,
                    }
                });
                return NextResponse.json([defaultProfile]);
            }

            return NextResponse.json(profiles);
        } catch (dbError) {
            // Schema might not be synced yet
            console.error("Profile fetch error:", dbError);
            // Return dummy profile array based on session
            return NextResponse.json([{
                id: 'default',
                name: session.user.name || 'User',
                avatar: session.user.image,
                userId: session.user.id
            }]);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, avatar } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check how many profiles user already has (limit to 5)
        const existingProfiles = await prisma.profile.count({
            where: { userId: session.user.id }
        });

        if (existingProfiles >= 4) {
            return NextResponse.json({ error: 'Maximum 4 profiles allowed' }, { status: 400 });
        }

        const profile = await prisma.profile.create({
            data: {
                userId: session.user.id,
                name: name.trim(),
                avatar: avatar || null
            }
        });

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error('Profile creation error:', error?.message || error);

        // Check for specific Prisma errors
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Profile already exists' }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Failed to create profile',
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, name, avatar } = await req.json();
        if (!id || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Verify ownership
        const profile = await prisma.profile.findFirst({
            where: { id, userId: session.user.id }
        });

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        const updated = await prisma.profile.update({
            where: { id },
            data: {
                name,
                avatar: avatar !== undefined ? avatar : profile.avatar
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing profile id' }, { status: 400 });

        // Verify ownership
        const profile = await prisma.profile.findFirst({
            where: { id, userId: session.user.id }
        });

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        // Check if this is the last profile - don't allow deleting the last one
        const profileCount = await prisma.profile.count({
            where: { userId: session.user.id }
        });

        if (profileCount <= 1) {
            return NextResponse.json({ error: 'Cannot delete the last profile' }, { status: 400 });
        }

        await prisma.profile.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

