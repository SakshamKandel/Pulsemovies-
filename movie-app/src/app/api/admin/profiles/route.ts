import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSuperAdmin, notFoundResponse, jsonResponse, errorResponse } from '@/lib/adminAuth';

// GET - List all profiles
export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const search = searchParams.get('search') || '';
        const userId = searchParams.get('userId') || undefined;

        const skip = (page - 1) * limit;

        const where = {
            ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
            ...(userId && { userId })
        };

        const [profiles, total] = await Promise.all([
            prisma.profile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { email: true, name: true } },
                    _count: { select: { watchHistory: true, watchlist: true } }
                }
            }),
            prisma.profile.count({ where })
        ]);

        return jsonResponse({
            profiles: profiles.map(p => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                createdAt: p.createdAt,
                userEmail: p.user.email,
                userName: p.user.name,
                watchHistoryCount: p._count.watchHistory,
                watchlistCount: p._count.watchlist
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Admin profiles GET error:', error);
        return notFoundResponse();
    }
}

// DELETE - Delete profile
export async function DELETE(request: NextRequest) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return jsonResponse({ error: 'Profile ID is required' }, 400);
        }

        // Check if this is the user's last profile
        const profile = await prisma.profile.findUnique({
            where: { id },
            include: { user: { include: { profiles: true } } }
        });

        if (!profile) {
            return jsonResponse({ error: 'Profile not found' }, 404);
        }

        if (profile.user.profiles.length <= 1) {
            return jsonResponse({ error: 'Cannot delete the last profile of a user' }, 400);
        }

        await prisma.profile.delete({ where: { id } });

        return jsonResponse({ success: true });
    } catch (error) {
        console.error('Admin profiles DELETE error:', error);
        return errorResponse('Failed to delete profile');
    }
}
