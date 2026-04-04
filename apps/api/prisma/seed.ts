import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // For existing users (authenticated via Telegram), mark email as verified
  // since they were already verified through Telegram
  const result = await prisma.user.updateMany({
    where: {
      telegramId: { not: null },
      emailVerified: false,
    },
    data: {
      emailVerified: true,
    },
  });

  console.log(`✅ Marked ${result.count} existing Telegram users as emailVerified`);

  // Create default topics if none exist
  const topicCount = await prisma.topic.count();
  if (topicCount === 0) {
    console.log('ℹ️  No topics found. Add topics via admin panel.');
  }

  // Create default achievements if none exist
  const achievementCount = await prisma.achievement.count();
  if (achievementCount === 0) {
    console.log('ℹ️  No achievements found. Add achievements via admin panel.');
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
