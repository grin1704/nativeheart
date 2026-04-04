const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('🔐 Обновление пароля администратора...');
    
    // Генерируем безопасный пароль
    const newPassword = 'MemorialAdmin2024!@#';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль для супер-админа
    const updatedAdmin = await prisma.adminUser.update({
      where: { email: 'admin@memorial-pages.ru' },
      data: { passwordHash: hashedPassword }
    });
    
    console.log('✅ Пароль администратора успешно обновлен!');
    console.log('\n🔑 Новые учетные данные:');
    console.log(`Email: ${updatedAdmin.email}`);
    console.log(`Пароль: ${newPassword}`);
    console.log('\n⚠️ Сохраните эти данные в безопасном месте!');
    
  } catch (error) {
    console.error('❌ Ошибка обновления пароля:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();