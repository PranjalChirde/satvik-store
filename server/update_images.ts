import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Update Sandalwood variants (21, 22, 23, 24)
  await prisma.product.updateMany({
    where: { id: { in: [21, 22, 23, 24] } },
    data: { image: '/uploads/sandalwood_mala.png' }
  });

  // Update Rudraksha variants (25, 26, 27, 28)
  await prisma.product.updateMany({
    where: { id: { in: [25, 26, 27, 28] } },
    data: { image: '/uploads/rudraksha_mala.png' }
  });

  // Update Wicks variants (38, 39, 40)
  await prisma.product.updateMany({
    where: { id: { in: [38, 39, 40] } },
    data: { image: '/uploads/cotton_wicks_bundle.png' }
  });

  console.log('Database images successfully updated.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
