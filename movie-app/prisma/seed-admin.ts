import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@pulsemovies.com';
    const adminPassword = 'ADmiN@!@#!@#123';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log('Super admin user already exists. Updating role...');
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'SUPER_ADMIN' }
        });
        console.log('Super admin role updated successfully!');
        return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create super admin user
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
        }
    });

    // Create a default profile for the admin
    await prisma.profile.create({
        data: {
            userId: admin.id,
            name: 'Admin',
            avatar: null,
        }
    });

    console.log('✅ Super admin user created successfully!');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
}

main()
    .catch((e) => {
        console.error('Error seeding admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
