import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// Extend the default session types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
            role?: string;
        };
    }
    interface User {
        role?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        role?: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role, // Include role in user object
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role; // Store role in JWT
            }

            // Support client-side update() to refresh session data
            if (trigger === "update" && session?.user) {
                if (session.user.name) token.name = session.user.name;
                if (session.user.image) token.picture = session.user.image;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.image = token.picture;
                session.user.role = token.role; // Include role in session
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
});
