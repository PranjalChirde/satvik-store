import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      title: 'Premium 108 Beads Tulsi Mala',
      price: 899,
      originalPrice: 1299,
      category: 'mala-tulsi',
      image: '/uploads/tulsi_mala_1.png',
      badge: 'Best Seller',
      description: 'The traditional light brown holy basil wood beads are perfectly round and strung gracefully on a natural cotton string. Ideal for Vishnu and Krishna worship.'
    },
    {
      title: 'ISKCON Style Knotted Tulsi Mala',
      price: 1199,
      originalPrice: 1599,
      category: 'mala-tulsi',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800&h=800&fit=crop',
      badge: 'Hand-Knotted',
      description: 'Small, cylindrical tulsi wood beads tightly hand-knotted with pure white string between each bead. Features a prominent carved guru bead.'
    },
    {
      title: 'Silver Capped Tulsi Japa Mala',
      price: 2499,
      originalPrice: 3499,
      category: 'mala-tulsi',
      image: 'https://images.unsplash.com/photo-1599643478524-fb1eacc51998?w=800&h=800&fit=crop',
      badge: 'Premium',
      description: 'Light, textured tulsi wood beads beautifully capped with deeply detailed 92.5 sterling silver caps on both ends. Premium sacred jewelry look.'
    },
    {
      title: 'Plain Tulsi Kanthi Mala',
      price: 499,
      originalPrice: 799,
      category: 'mala-tulsi',
      image: 'https://images.unsplash.com/photo-1620054378129-b68cde6d2629?w=800&h=800&fit=crop',
      badge: null,
      description: 'A delicate and pure Tulsi wood kanthi mala worn commonly around the neck to protect the throat chakra and bring immense spiritual peace.'
    }
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product
    });
    console.log(`Created product: ${created.title}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
