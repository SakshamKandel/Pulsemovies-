import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: { id: user.id, email: user.email, name: user.name }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Signup error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        return NextResponse.json(
            { error: `Signup failed: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
