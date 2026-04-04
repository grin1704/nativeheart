const { PrismaClient } = require('@prisma/client');

async function rollbackAuth() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Откат изменений авторизации...');
    
    // Удаляем новые поля из таблицы users
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS email_verified');
    console.log('✅ Удалено поле email_verified');
    
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS verification_token');
    console.log('✅ Удалено поле verification_token');
    
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS verification_expires');
    console.log('✅ Удалено поле verification_expires');
    
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS reset_token');
    console.log('✅ Удалено поле reset_token');
    
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS reset_token_expires');
    console.log('✅ Удалено поле reset_token_expires');
    
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS oauth_provider');
    console.log('✅ Удалено поле oauth_provider');
    
    await prisma.$executeRawUnsafe('ALTER TABLE users DROP COLUMN IF EXISTS oauth_id');
    console.log('✅ Удалено поле oauth_id');
    
    // Возвращаем NOT NULL для password_hash
    await prisma.$executeRawUnsafe('ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL');
    console.log('✅ Восстановлено ограничение NOT NULL для password_hash');
    
    console.log('\n✅ Откат завершен успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при откате:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

rollbackAuth();
