// Populates the database with development data. Run with `npm run db:seed`.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Example, once a model exists:
  // await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { ... } });
  console.log('Nothing to seed yet.');
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
