import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Because bcrypt can sometimes be finicky on windows, let's just make an API call to localhost to register! Or require bcrypt directly.

const prisma = new PrismaClient();

async function addAdmin() {
  const email = 'prajwal4545@gmail.com';
  const passwordText = 'prajwal4545';
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    console.log(`User ${email} already exists! Skipping creation.`);
    return;
  }
  
  const bcrypt = require('bcryptjs');
  
  const passwordHash = await bcrypt.hash(passwordText, 10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Prajwal',
      email: email,
      passwordHash: passwordHash
    }
  });

  console.log(`Successfully created admin user: ${adminUser.email}`);
}

addAdmin()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
