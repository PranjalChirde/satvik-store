import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'prajwal4545@gmail.com';
  
  // Find user first
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found. Ensure you have registered an account with this email.`);
  } else {
    // Elevate explicitly
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log(`Successfully elevated ${email} to admin role.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
