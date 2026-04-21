import { ProductGrid } from './ProductGrid';
import { Product } from './ProductCard';
import { Link } from 'react-router-dom';

interface MurtiSangrahProps {
  products: Product[];
  onAddToCart: (productId: number) => void;
}

export function MurtiSangrah({ products, onAddToCart }: MurtiSangrahProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            className="text-4xl mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Murti Sangrah
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Premium Collection of Handcrafted Brass Idols - Bring Divine Presence to Your Sacred Space
          </p>
        </div>

        <ProductGrid products={products.slice(0, 4)} onAddToCart={onAddToCart} columns={4} />

        <div className="text-center mt-8">
          <Link to="/category/brass-idols" className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition font-medium">
            View Complete Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
