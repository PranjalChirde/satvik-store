import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';
import { useWishlist } from '../hooks/useWishlist';
import type { Product } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoaders';

interface WishlistPageProps {
  onAddToCart: (productId: number) => void;
}

export function WishlistPage({ onAddToCart }: WishlistPageProps) {
  const navigate = useNavigate();
  const { favorites } = useWishlist();
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 py-10 shadow-sm z-10 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-full mb-4">
            <Heart className="w-8 h-8" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-medium mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Wishlist
          </h1>
          <p className="text-gray-500">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-1">
        {loading ? (
          <ProductGridSkeleton />
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 px-4 text-center shadow-sm max-w-2xl mx-auto">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You haven't saved any items yet. Start exploring our collection and click the heart icon to save your favorites!
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition font-medium inline-flex items-center gap-2"
            >
              <Search className="w-5 h-5" /> Browse Products
            </button>
          </div>
        ) : (
          <ProductGrid products={favoriteProducts} onAddToCart={onAddToCart} />
        )}
      </div>
    </div>
  );
}
