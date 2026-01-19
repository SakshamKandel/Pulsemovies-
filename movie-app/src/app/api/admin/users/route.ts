import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkSuperAdmin, notFoundResponse, jsonResponse, errorResponse } from '@/lib/adminAuth';

// GET - List all users with pagination and search
export async function GET(request: NextRequest) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || undefined;

        const skip = (page - 1) * limit;

        const where = {
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { name: { contains: search, mode: 'insensitive' as const } }
                ]
            }),
            ...(role && { role: role as any })
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: { select: { profiles: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        return jsonResponse({
            users: users.map(u => ({
                ...u,
                profileCount: u._count.profiles,
                _count: undefined
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Admin users GET error:', error);
        return notFoundResponse();
    }
}

// POST - Create new user
export async function POST(request: NextRequest) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const body = await request.json();
        const { email, password, name, role = 'USER' } = body;

        // Input validation
        if (!email || !password) {
            return jsonResponse({ error: 'Email and password are required' }, 400);
        }

        if (password.length < 8) {
            return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return jsonResponse({ error: 'Invalid email format' }, 400);
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return jsonResponse({ error: 'User with this email already exists' }, 400);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                name: name?.trim() || null,
                role
            },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });

        // Create default profile
        await prisma.profile.create({
            data: { userId: user.id, name: name || 'User', avatar: null }
        });

        return jsonResponse(user, 201);
    } catch (error) {
        console.error('Admin users POST error:', error);
        return errorResponse('Failed to create user');
    }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
    try {
        const { isAdmin, userId } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const body = await request.json();
        const { id, email, name, role, password } = body;

        if (!id) {
            return jsonResponse({ error: 'User ID is required' }, 400);
        }

        const updateData: any = {};
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return jsonResponse({ error: 'Invalid email format' }, 400);
            }
            updateData.email = email.toLowerCase().trim();
        }
        if (name !== undefined) updateData.name = name?.trim();
        if (role) updateData.role = role;
        if (password) {
            if (password.length < 8) {
                return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
            }
            updateData.password = await bcrypt.hash(password, 12);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
        });

        return jsonResponse(user);
    } catch (error) {
        console.error('Admin users PUT error:', error);
        return errorResponse('Failed to update user');
    }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
    try {
        const { isAdmin, userId } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return jsonResponse({ error: 'User ID is required' }, 400);
        }

        // Prevent self-deletion
        if (userId === id) {
            return jsonResponse({ error: 'Cannot delete your own account' }, 400);
        }

        await prisma.user.delete({ where: { id } });

        return jsonResponse({ success: true });
    } catch (error) {
        console.error('Admin users DELETE error:', error);
        return errorResponse('Failed to delete user');
    }
}
