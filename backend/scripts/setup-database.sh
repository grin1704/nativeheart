#!/bin/bash

# Memorial Pages Database Setup Script
# This script sets up the database for the Memorial Pages service

set -e  # Exit on any error

echo "🚀 Memorial Pages Database Setup"
echo "================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please update the DATABASE_URL in .env file with your PostgreSQL credentials"
    echo "   Example: DATABASE_URL=\"postgresql://username:password@localhost:5432/memorial_pages_db?schema=public\""
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo "1️⃣  Generating Prisma Client..."
npm run db:generate

echo "2️⃣  Testing database connection..."
npm run db:test

echo "3️⃣  Running database migrations..."
npm run db:migrate

echo "4️⃣  Seeding database with test data..."
npm run db:seed

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "🔑 Test credentials created:"
echo "   Admin: admin@memorial-pages.ru / admin123"
echo "   Moderator: moderator@memorial-pages.ru / admin123"
echo "   Users: trial@example.com, free@example.com, premium@example.com / password123"
echo ""
echo "🎯 Next steps:"
echo "   - Start the development server: npm run dev"
echo "   - Open Prisma Studio: npm run db:studio"
echo "   - View API documentation: http://localhost:3001/api/docs"