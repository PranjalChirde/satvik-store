import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.product.findMany({
  select: { id: true, title: true, image: true, category: true },
  orderBy: { id: 'asc' }
}).then(r => console.log(JSON.stringify(r, null, 2))).finally(() => p.$disconnect());
