import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      title: 'Ram Darbar Premium Brass Idol - 28 Inch',
      price: 18999,
      originalPrice: 24999,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1542868726-5b48aa92fbcc?w=800&h=800&fit=crop',
      badge: 'Masterpiece',
      description: 'A breathtakingly detailed brass sculpture of the complete Ram Darbar (Lord Rama, Sita Mata, Lakshmana, and Lord Hanuman). Finished in an antique gold polish.'
    },
    {
      title: 'Mangalmurti Ganesh Ji Idol - 18 Inch',
      price: 8499,
      originalPrice: 11999,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1584157234994-b1ea5fc1b444?w=800&h=800&fit=crop',
      badge: 'Best Seller',
      description: 'An auspicious pure brass idol of Lord Ganesha in a sitting posture holding his favorite modak. Perfect for the entrance of your home or office.'
    },
    {
      title: 'Panchmukhi Hanuman Ji statue - 21 Inch',
      price: 11299,
      originalPrice: 15499,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1702505433756-88130191bb4b?w=800&h=800&fit=crop',
      badge: 'Powerful',
      description: 'A highly energetic and protective Panchmukhi (five-faced) Hanuman brass idol. Meticulously carved to capture the fierce divine energy.'
    },
    {
      title: 'Divine Saraswati Mata Idol - 20 Inch',
      price: 9999,
      originalPrice: 13999,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1508133111629-be3f6e535a52?w=800&h=800&fit=crop',
      badge: null,
      description: 'Goddess of wisdom and arts, Saraswati Mata playing the Veena. Crafted in pure heavy brass with fine detailing on her jewelry and expression.'
    },
    {
      title: 'Ashtabhuja Durga Mata Statue - 24 Inch',
      price: 16499,
      originalPrice: 21999,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1740819912830-d696b4de3fa8?w=800&h=800&fit=crop',
      badge: 'Premium',
      description: 'Fierce and protective eight-armed Goddess Durga riding her lion. This heavy brass statue represents victory of good over evil.'
    },
    {
      title: 'Meditating Lord Shiva Brass Idol - 22 Inch',
      price: 12499,
      originalPrice: 16999,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1767693807049-5b624e6116cc?w=800&h=800&fit=crop',
      badge: null,
      description: 'A deeply peaceful idol of Lord Shiva in silent meditation on Mount Kailash. The calm expression brings a powerful sense of tranquility to any room.'
    },
    {
      title: 'Muralidhar Krishna with Cow - 16 Inch',
      price: 7499,
      originalPrice: 10499,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1665378764540-8aca31360df9?w=800&h=800&fit=crop',
      badge: 'Elegant',
      description: 'Beautifully crafted brass figure of Lord Krishna playing his divine flute while an affectionate cow stands by his side.'
    },
    {
      title: 'Lord Kuber Brass Wealth Idol - 12 Inch',
      price: 4999,
      originalPrice: 6999,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1753522312806-a78c9fee860e?w=800&h=800&fit=crop',
      badge: 'Prosperity',
      description: 'Lord Kuber, the divine treasurer of wealth. Placing this solid brass idol in the north corner of your home attracts abundant financial prosperity.'
    },
    {
      title: 'Tirupati Balaji Brass Idol - 30 Inch',
      price: 26999,
      originalPrice: 35000,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1740847145862-85f296386a2b?w=800&h=800&fit=crop',
      badge: 'Exclusive',
      description: 'A breathtakingly detailed 30-inch Tirupati Balaji pure brass idol. Exceptionally crafted with an antique rich golden-brass finish.'
    },
    {
      title: 'Radha Krishna Brass Idol - 36 Inch',
      price: 32000,
      originalPrice: 40000,
      category: 'brass-idols',
      image: 'https://images.unsplash.com/photo-1760283809688-d105d141ad64?w=800&h=800&fit=crop',
      badge: 'Royal',
      description: 'A massive and stunning 36-inch Radha Krishna brass idol standing gracefully under an arching Kadamba tree. Perfect for large home shrines.'
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
