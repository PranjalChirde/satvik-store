import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Flame, Star, Sparkles } from 'lucide-react';
import type { Product } from './ProductCard';

interface DivineLuxeProps {
  products: Product[];
  onAddToCart?: (productId: number) => void;
}

const SERVER_BASE = 'http://localhost:5000';

function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return 'https://placehold.co/800x600?text=Product';
  return url;
}

function LuxeCard({
  product,
  tagline,
  accent,
  onAddToCart,
}: {
  product: Product;
  tagline: string;
  accent: 'gold' | 'crystal';
  onAddToCart?: (id: number) => void;
}) {
  const navigate = useNavigate();

  // Safe optional-chaining guard for originalPrice
  const savings =
    product.originalPrice != null && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const accentColors =
    accent === 'gold'
      ? {
          gradient: 'from-amber-900/80 to-amber-950/95',
          badge: 'bg-amber-500',
          btn: 'bg-amber-600 hover:bg-amber-700',
          ring: 'ring-amber-400/30',
        }
      : {
          gradient: 'from-violet-900/80 to-violet-950/95',
          badge: 'bg-violet-400',
          btn: 'bg-violet-600 hover:bg-violet-700',
          ring: 'ring-violet-400/30',
        };

  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group ring-2 ${accentColors.ring} transition-transform duration-300 hover:scale-[1.01]`}
      style={{ height: '380px' }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Full-bleed product image */}
      <img
        src={getFullImageUrl(product.image)}
        alt={product.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${accentColors.gradient} opacity-80`} />

      {/* Savings badge */}
      {savings > 0 && (
        <div
          className={`absolute top-4 left-4 ${accentColors.badge} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}
        >
          {savings}% OFF
        </div>
      )}

      {/* Product badge */}
      {product.badge && (
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
          ✦ {product.badge}
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        {/* Tagline */}
        <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-1 font-medium">
          {tagline}
        </p>

        {/* Title */}
        <h3
          className="text-white text-xl md:text-2xl font-bold mb-1.5 leading-tight"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-white/70 text-xs leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xl font-bold">₹{product.price.toFixed(0)}</span>
            {product.originalPrice != null && product.originalPrice > product.price && (
              <span className="text-white/50 text-sm line-through">
                ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>

          {/* CTA Buttons — stop propagation so clicking buttons doesn't also fire the card navigate */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onAddToCart?.(product.id)}
              className={`flex items-center gap-1.5 ${accentColors.btn} text-white text-xs font-semibold px-3 py-2 rounded-full transition shadow-lg hover:shadow-xl`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
            <Link
              to={`/product/${product.id}`}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-full backdrop-blur-sm transition border border-white/20"
            >
              View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LuxeCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden animate-pulse shadow-md" style={{ height: '380px' }}>
      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100" />
    </div>
  );
}

export function DivineLuxe({ products, onAddToCart }: DivineLuxeProps) {
  // Pick two featured featured products smartly — no extra fetch needed
  const featuredProducts = (() => {
    if (products.length === 0) return [];

    // Priority 1: Brass Hanging Peacock
    const hanging = products.find((p) =>
      p.title.toLowerCase().includes('hanging peacock')
    );
    // Priority 2: any product with diya/brass in name
    const brass = products.find(
      (p) => p.title.toLowerCase().includes('diya') || p.title.toLowerCase().includes('brass')
    );
    // Priority 3: crystal or yantra for second slot
    const crystal = products.find(
      (p) =>
        p.title.toLowerCase().includes('crystal') ||
        p.title.toLowerCase().includes('yantra')
    );

    const first = hanging ?? brass ?? products[0];
    const second = crystal ?? products.find((p) => p.id !== first?.id) ?? products[1];

    return [first, second].filter((p): p is Product => p !== undefined);
  })();

  const taglines = ['Sacred Brass Artistry', 'Crystalline Divinity'];
  const accents: ('gold' | 'crystal')[] = ['gold', 'crystal'];

  return (
    <section className="py-16 md:py-24" style={{ background: '#fff7ed' }}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 text-xs uppercase tracking-[0.3em] font-semibold">
              Curated Collection
            </span>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <h2
            className="text-4xl md:text-5xl text-gray-900 font-bold mb-3"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Divine Luxe <span className="text-orange-600">Illumination</span>
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Hand-selected pieces that bring sacred light and divine energy into your home.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-orange-300" />
            <Sparkles className="w-4 h-4 text-orange-400" />
            <div className="h-px w-16 bg-orange-300" />
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {products.length === 0 ? (
            <>
              <LuxeCardSkeleton />
              <LuxeCardSkeleton />
            </>
          ) : (
            featuredProducts.map((product, i) => (
              <LuxeCard
                key={product.id}
                product={product}
                tagline={taglines[i] ?? 'Sacred Collection'}
                accent={accents[i] ?? 'gold'}
                onAddToCart={onAddToCart}
              />
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link
            to="/search?q=diya"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-semibold border border-orange-300 hover:border-orange-500 px-6 py-3 rounded-full transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          >
            <Star className="w-4 h-4" />
            Explore Full Illumination Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}