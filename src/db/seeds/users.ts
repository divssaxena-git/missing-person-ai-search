import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    // Delete existing users
    await db.delete(users);

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    // Create sample users
    const sampleUsers = [
        {
            email: 'admin@example.com',
            passwordHash: adminPasswordHash,
            fullName: 'Admin User',
            phone: '+1-555-0101',
            role: 'admin',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'admin2@example.com',
            passwordHash: adminPasswordHash,
            fullName: 'Admin User Two',
            phone: '+1-555-0102',
            role: 'admin',
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'user1@example.com',
            passwordHash: userPasswordHash,
            fullName: 'John Smith',
            phone: '+1-555-0201',
            role: 'user',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'user2@example.com',
            passwordHash: userPasswordHash,
            fullName: 'Sarah Johnson',
            phone: '+1-555-0202',
            role: 'user',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'user3@example.com',
            passwordHash: userPasswordHash,
            fullName: 'Michael Brown',
            phone: '+1-555-0203',
            role: 'user',
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'user4@example.com',
            passwordHash: userPasswordHash,
            fullName: 'Emily Davis',
            phone: '+1-555-0204',
            role: 'user',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            email: 'user5@example.com',
            passwordHash: userPasswordHash,
            fullName: 'David Wilson',
            phone: '+1-555-0205',
            role: 'user',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log(`✅ Users seeder completed successfully - ${sampleUsers.length} users created`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});