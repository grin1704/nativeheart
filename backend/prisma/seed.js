"use strict";
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prismaClient = new PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await prismaClient.adminUser.upsert({
        where: { email: 'admin@memorial-pages.ru' },
        update: {},
        create: {
            email: 'admin@memorial-pages.ru',
            passwordHash: adminPassword,
            name: 'Супер Администратор',
            role: 'super_admin',
            permissions: {
                create: [
                    {
                        resource: 'users',
                        actions: ['read', 'write', 'delete', 'moderate']
                    },
                    {
                        resource: 'memorial_pages',
                        actions: ['read', 'write', 'delete', 'moderate']
                    },
                    {
                        resource: 'payments',
                        actions: ['read', 'write', 'delete']
                    },
                    {
                        resource: 'settings',
                        actions: ['read', 'write']
                    },
                    {
                        resource: 'analytics',
                        actions: ['read']
                    }
                ]
            }
        }
    });
    const moderator = await prismaClient.adminUser.upsert({
        where: { email: 'moderator@memorial-pages.ru' },
        update: {},
        create: {
            email: 'moderator@memorial-pages.ru',
            passwordHash: adminPassword,
            name: 'Модератор',
            role: 'moderator',
            permissions: {
                create: [
                    {
                        resource: 'memorial_pages',
                        actions: ['read', 'moderate']
                    },
                    {
                        resource: 'users',
                        actions: ['read']
                    }
                ]
            }
        }
    });
    const userPassword = await bcrypt.hash('password123', 10);
    const trialUser = await prismaClient.user.upsert({
        where: { email: 'trial@example.com' },
        update: {},
        create: {
            email: 'trial@example.com',
            passwordHash: userPassword,
            name: 'Пробный Пользователь',
            subscriptionType: 'trial',
            subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
    });
    const freeUser = await prismaClient.user.upsert({
        where: { email: 'free@example.com' },
        update: {},
        create: {
            email: 'free@example.com',
            passwordHash: userPassword,
            name: 'Бесплатный Пользователь',
            subscriptionType: 'free',
            subscriptionExpiresAt: null
        }
    });
    const premiumUser = await prismaClient.user.upsert({
        where: { email: 'premium@example.com' },
        update: {},
        create: {
            email: 'premium@example.com',
            passwordHash: userPassword,
            name: 'Премиум Пользователь',
            subscriptionType: 'premium',
            subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
    });
    const samplePhoto = await prismaClient.mediaFile.create({
        data: {
            originalName: 'sample-portrait.jpg',
            url: 'https://via.placeholder.com/400x600/cccccc/666666?text=Portrait',
            thumbnailUrl: 'https://via.placeholder.com/200x300/cccccc/666666?text=Portrait',
            size: 150000,
            mimeType: 'image/jpeg',
            uploadedBy: trialUser.id
        }
    });
    const memoryPhoto1 = await prismaClient.mediaFile.create({
        data: {
            originalName: 'childhood-photo.jpg',
            url: 'https://via.placeholder.com/600x400/e6f3ff/4a90e2?text=Childhood',
            thumbnailUrl: 'https://via.placeholder.com/300x200/e6f3ff/4a90e2?text=Childhood',
            size: 200000,
            mimeType: 'image/jpeg',
            uploadedBy: trialUser.id
        }
    });
    const memoryPhoto2 = await prismaClient.mediaFile.create({
        data: {
            originalName: 'wedding-photo.jpg',
            url: 'https://via.placeholder.com/600x400/fff2e6/e67e22?text=Wedding',
            thumbnailUrl: 'https://via.placeholder.com/300x200/fff2e6/e67e22?text=Wedding',
            size: 250000,
            mimeType: 'image/jpeg',
            uploadedBy: trialUser.id
        }
    });
    const memorialPage1 = await prismaClient.memorialPage.create({
        data: {
            slug: 'ivan-petrov-1945-2023',
            ownerId: trialUser.id,
            fullName: 'Иван Петрович Петров',
            birthDate: new Date('1945-03-15'),
            deathDate: new Date('2023-08-20'),
            mainPhotoId: samplePhoto.id,
            biographyText: `Иван Петрович Петров родился 15 марта 1945 года в небольшом городке на Урале. 
      
Всю свою жизнь он посвятил семье и работе. Работал инженером на местном заводе более 40 лет. Был известен своей добротой, честностью и готовностью помочь каждому, кто в этом нуждался.

Иван Петрович был прекрасным отцом и дедушкой. Он любил рыбалку, чтение книг по истории и работу в саду. Его мудрые советы и теплая улыбка останутся в наших сердцах навсегда.

Он ушел от нас 20 августа 2023 года, оставив после себя любящую семью и множество добрых воспоминаний.`,
            isPrivate: false,
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://memorial-pages.ru/ivan-petrov-1945-2023'
        }
    });
    const memorialPage2 = await prismaClient.memorialPage.create({
        data: {
            slug: 'maria-sidorova-1952-2024',
            ownerId: premiumUser.id,
            fullName: 'Мария Ивановна Сидорова',
            birthDate: new Date('1952-07-08'),
            deathDate: new Date('2024-01-12'),
            biographyText: 'Мария Ивановна была замечательной учительницей начальных классов...',
            isPrivate: true,
            passwordHash: await bcrypt.hash('memory123', 10),
            qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://memorial-pages.ru/maria-sidorova-1952-2024'
        }
    });
    const memory1 = await prismaClient.memory.create({
        data: {
            memorialPageId: memorialPage1.id,
            date: new Date('1965-06-20'),
            title: 'Детство в деревне',
            description: 'Иван Петрович часто рассказывал о своем беззаботном детстве в деревне у бабушки. Летние каникулы, проведенные на природе, сформировали его любовь к простым радостям жизни.',
            photos: {
                connect: [{ id: memoryPhoto1.id }]
            }
        }
    });
    const memory2 = await prismaClient.memory.create({
        data: {
            memorialPageId: memorialPage1.id,
            date: new Date('1970-09-15'),
            title: 'Свадьба',
            description: 'Самый счастливый день в жизни Ивана Петровича - свадьба с любимой женой Анной. Их брак продлился более 50 лет и был примером настоящей любви и взаимопонимания.',
            photos: {
                connect: [{ id: memoryPhoto2.id }]
            }
        }
    });
    const tribute1 = await prismaClient.tribute.create({
        data: {
            memorialPageId: memorialPage1.id,
            authorName: 'Анна Петрова',
            authorEmail: 'anna.petrova@example.com',
            text: 'Мой дорогой муж, ты был опорой нашей семьи. Твоя доброта и мудрость будут жить в наших сердцах вечно. Спасибо тебе за все прекрасные годы, которые мы провели вместе.',
            isApproved: true
        }
    });
    const tribute2 = await prismaClient.tribute.create({
        data: {
            memorialPageId: memorialPage1.id,
            authorName: 'Михаил Петров',
            text: 'Папа, ты научил меня быть честным и трудолюбивым. Твой пример всегда будет для меня путеводной звездой. Покойся с миром.',
            isApproved: true
        }
    });
    const burialLocation = await prismaClient.burialLocation.create({
        data: {
            memorialPageId: memorialPage1.id,
            address: 'Центральное кладбище, г. Екатеринбург, участок 15, ряд 8, место 12',
            description: 'Тихое место под старыми березами',
            latitude: 56.8431,
            longitude: 60.6454,
            instructions: 'От главного входа пройти прямо 200 метров, затем повернуть направо. Могила находится под большой березой с белой оградкой.'
        }
    });
    const collaborator = await prismaClient.collaborator.create({
        data: {
            memorialPageId: memorialPage1.id,
            userId: freeUser.id,
            permissions: 'edit',
            acceptedAt: new Date()
        }
    });
    const systemSettings = [
        {
            key: 'trial_period_days',
            value: { value: 14 },
            description: 'Количество дней пробного периода'
        },
        {
            key: 'max_file_size',
            value: { value: 10485760 },
            description: 'Максимальный размер загружаемого файла в байтах'
        },
        {
            key: 'max_files_per_page',
            value: { value: 50 },
            description: 'Максимальное количество файлов на одной странице'
        },
        {
            key: 'biography_char_limit',
            value: { value: 1000 },
            description: 'Лимит символов в биографии для бесплатных аккаунтов'
        },
        {
            key: 'allowed_file_types',
            value: {
                images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                videos: ['video/mp4', 'video/webm', 'video/ogg']
            },
            description: 'Разрешенные типы файлов для загрузки'
        },
        {
            key: 'moderation_required',
            value: { value: false },
            description: 'Требуется ли модерация для новых отзывов'
        },
        {
            key: 'maintenance_mode',
            value: { value: false },
            description: 'Режим технического обслуживания'
        }
    ];
    for (const setting of systemSettings) {
        await prismaClient.systemSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting
        });
    }
    await prismaClient.contentModeration.create({
        data: {
            contentType: 'tribute',
            contentId: tribute2.id,
            status: 'approved',
            moderatorId: moderator.id,
            moderatedAt: new Date()
        }
    });
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Created:');
    console.log(`- 2 admin users (${superAdmin.email}, ${moderator.email})`);
    console.log(`- 3 test users (${trialUser.email}, ${freeUser.email}, ${premiumUser.email})`);
    console.log(`- 2 memorial pages (${memorialPage1.slug}, ${memorialPage2.slug})`);
    console.log('- 3 media files');
    console.log(`- 2 memories (${memory1.title}, ${memory2.title})`);
    console.log(`- 2 tributes (${tribute1.authorName}, ${tribute2.authorName})`);
    console.log(`- 1 burial location (${burialLocation.address})`);
    console.log(`- 1 collaborator (${collaborator.userId})`);
    console.log('- 7 system settings');
    console.log('- 1 content moderation entry');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@memorial-pages.ru / admin123');
    console.log('Moderator: moderator@memorial-pages.ru / admin123');
    console.log('Users: trial@example.com, free@example.com, premium@example.com / password123');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prismaClient.$disconnect();
});
//# sourceMappingURL=seed.js.map