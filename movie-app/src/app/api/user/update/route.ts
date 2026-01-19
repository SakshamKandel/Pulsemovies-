import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, password, newPassword, avatar } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (avatar !== undefined) updateData.avatar = avatar;

        // Only allow email update if strictly needed, usually requires verification
        // if (email && email !== user.email) updateData.email = email;

        if (newPassword) {
            // Validate current password if provided (optional security check)
            if (password) {
                const isValid = await bcrypt.compare(password, user.password || '');
                if (!isValid) {
                    return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
                }
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData,
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: updatedUser.name,
                email: updatedUser.email
            }
        });

    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
