import { db } from '@/db';
import { notifications } from '@/db/schema';

async function main() {
    // Delete existing records first
    await db.delete(notifications);
    
    const sampleNotifications = [
        {
            userId: 3,
            reportId: 1,
            message: 'New lead reported on missing person case',
            type: 'info',
            read: false,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 4,
            reportId: 2,
            message: 'Missing person has been found safe',
            type: 'success',
            read: true,
            createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 5,
            reportId: 3,
            message: 'Your report has been updated with new information',
            type: 'info',
            read: false,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            reportId: 5,
            message: 'Community member reported a sighting',
            type: 'alert',
            read: false,
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 6,
            reportId: 8,
            message: "Case status changed to 'Found'",
            type: 'success',
            read: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 7,
            reportId: 4,
            message: 'Please verify recent update to your report',
            type: 'warning',
            read: false,
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 4,
            reportId: 7,
            message: 'New photo added to missing person report',
            type: 'info',
            read: true,
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 5,
            reportId: 6,
            message: 'Your report is being reviewed by authorities',
            type: 'info',
            read: false,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 3,
            reportId: 9,
            message: 'Emergency alert: Possible sighting in your area',
            type: 'alert',
            read: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            userId: 6,
            reportId: 10,
            message: 'Case closed - person returned home',
            type: 'success',
            read: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(notifications).values(sampleNotifications);
    
    console.log(`✅ Notifications seeder completed successfully - ${sampleNotifications.length} notifications created`);
}

main().catch((error) => {
    console.error('❌ Notifications seeder failed:', error);
    process.exit(1);
});