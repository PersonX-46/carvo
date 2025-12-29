import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultWorker() {
  const hashedPassword = await bcrypt.hash('worker123', 12);

  await prisma.worker.upsert({
    where: { email: 'worker@chongmeng.com' },
    update: {},
    create: {
      name: 'Ali bin Ahmad',
      email: 'worker@chongmeng.com',
      password: hashedPassword,
      position: 'Senior Technician',
      phone: '+60 12-345 6789',
      status: 'active',
      specialization: 'Engine Repair,Transmission,Electrical Systems',
      salary: 3500.00,
      hireDate: new Date('2022-03-15'),
      totalServices: 247,
      currentWorkload: 3,
      rating: 4.8,
    },
  });

  console.log("Default worker created/updated!");
}

createDefaultWorker()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());