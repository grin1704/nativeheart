require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('🔐 Обновление пароля администратора...');

    // Пароль берётся из аргумента или переменной окружения, не хранится в коде
    const newPassword = process.argv[2] || process.env.ADMIN_SEED_PASSWORD;
    if (!newPassword) {
      console.error('❌ Укажите пароль: node scripts/update-admin-password.js <password>  (или задайте ADMIN_SEED_PASSWORD)');
      process.exit(1);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль для супер-админа
    const updatedAdmin = await prisma.adminUser.update({
      where: { email: 'admin@memorial-pages.ru' },
      data: { passwordHash: hashedPassword }
    });
    
    console.log('✅ Пароль администратора успешно обновлен!');
    console.log(`Email: ${updatedAdmin.email}`);
    console.log('\n⚠️ Пароль не выводится в лог. Сохраните его в безопасном месте.');
    
  } catch (error) {
    console.error('❌ Ошибка обновления пароля:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();