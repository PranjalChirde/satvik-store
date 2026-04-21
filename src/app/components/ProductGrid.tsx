import { useState } from 'react';
import { ProductCard, type Product } from './ProductCard';
import { BestSellerCard } from './BestSellerCard';
import { QuickViewModal } from './QuickViewModal';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: number) => void;
  columns?: 2 | 3 | 4 | 5;
  theme?: 'standard' | 'arch';
}

export function ProductGrid({ products, onAddToCart, columns = 4, theme = 'standard' }: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {products.map((product) => {
          if (theme === 'arch') {
            return (
              <BestSellerCard
                key={product.id}
                product={product}
                onAddToCart={() => onAddToCart(product.id)}
                onQuickView={() => setQuickViewProduct(product)}
              />
            );
          }
          return (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product.id)}
              onQuickView={() => setQuickViewProduct(product)}
            />
          );
        })}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
