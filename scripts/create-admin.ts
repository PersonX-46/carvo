import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@chengservice.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@chengservice.com',
      password: hashedPassword,
      phone: '+6012-345-6789',
    },
  });

  console.log("Admin created/updated!");
}

createDefaultAdmin()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
