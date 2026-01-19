import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prismaV5: PrismaClient | undefined;
};

// With Prisma 5, we rely on standard environment variable loading or Next.js loading
// The datasource URL is picked up from process.env.DATABASE_URL automatically by the generated client
export const prisma = globalForPrisma.prismaV5 ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaV5 = prisma;

export default prisma;
