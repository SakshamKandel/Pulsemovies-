import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSuperAdmin, notFoundResponse, jsonResponse, errorResponse } from '@/lib/adminAuth';

// GET - List all watch history
export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const search = searchParams.get('search') || '';
        const profileId = searchParams.get('profileId') || undefined;

        const skip = (page - 1) * limit;

        const where = {
            ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
            ...(profileId && { profileId })
        };

        const [items, total] = await Promise.all([
            prisma.watchHistory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    profile: {
                        include: { user: { select: { email: true } } }
                    }
                }
            }),
            prisma.watchHistory.count({ where })
        ]);

        return jsonResponse({
            items: items.map(item => ({
                id: item.id,
                tmdbId: item.tmdbId,
                title: item.title,
                mediaType: item.mediaType,
                progress: item.progress,
                duration: item.duration,
                posterPath: item.posterPath,
                updatedAt: item.updatedAt,
                profileName: item.profile.name,
                userEmail: item.profile.user.email
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Admin history GET error:', error);
        return notFoundResponse();
    }
}

// DELETE - Remove history item
export async function DELETE(request: NextRequest) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return jsonResponse({ error: 'Item ID is required' }, 400);
        }

        await prisma.watchHistory.delete({ where: { id } });

        return jsonResponse({ success: true });
    } catch (error) {
        console.error('Admin history DELETE error:', error);
        return errorResponse('Failed to delete item');
    }
}
