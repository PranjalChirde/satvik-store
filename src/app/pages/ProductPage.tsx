import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, Truck, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../components/ProductCard';
import { ReviewSection } from '../components/ReviewSection';
import { ProductPageSkeleton } from '../components/SkeletonLoaders';

interface ProductPageProps {
  onAddToCart: (productId: number) => void;
}

export function ProductPage({ onAddToCart }: ProductPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center' });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isFullScreenImageOpen, setIsFullScreenImageOpen] = useState(false);

  useEffect(() => {
    // Scroll to top when opening a detail page
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then((data) => {
          setProduct(data);
          setActiveImage(data.image);
          setLoading(false);
          // Fetch related
          return fetch(`/api/products?category=${data.category}`);
        })
        .then(res => res ? res.json() : [])
        .then(related => {
           setRelatedProducts(related.filter((p: Product) => p.id !== parseInt(id!)).slice(0, 4));
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl mb-4 font-medium">Product Not Found</h2>
        <p className="text-gray-600 mb-8">We couldn't locate the product you were looking for.</p>
        <button
          onClick={() => navigate('/')}
          className="text-orange-600 hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shop
        </button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-orange-600 mb-6 inline-flex items-center gap-2 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto">
        {/* Left: Product Images */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto lg:mx-0 flex flex-col gap-4">
          <div 
            className="relative w-full aspect-square max-h-[420px] bg-gray-50 rounded-2xl overflow-hidden group cursor-zoom-in shadow-sm border border-gray-100"
            onClick={() => setIsFullScreenImageOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomStyle({ transformOrigin: 'center center' })}
          >
            <img
              src={activeImage || product.image}
              alt={product.title}
              style={zoomStyle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[2]"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1.5 rounded uppercase tracking-wider font-semibold shadow-md z-10">
                {product.badge}
              </div>
            )}
            
            {/* View Fullscreen Hint */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Maximize2 className="w-4 h-4" /> Tap to enlarge
              </div>
            </div>
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1 px-1">
              <button 
                onClick={() => setActiveImage(product.image)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${activeImage === product.image ? 'border-orange-600' : 'border-transparent hover:border-gray-300'}`}
              >
                <img src={product.image} alt="Thumbnail main" className="w-full h-full object-cover" />
              </button>
              {product.images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${activeImage === img.url ? 'border-orange-600' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:flex-1 flex flex-col pt-2 px-2 md:px-0">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
            {product.category.replace('-', ' ')}
          </p>
          <h1 className="text-2xl md:text-3xl leading-tight mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {product.title}
          </h1>

          <div className="flex items-center gap-4 mb-5">
            <span className="text-2xl font-medium text-gray-900">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-red-600 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-100 text-red-800 text-sm px-2 py-0.5 rounded font-semibold ml-auto">
                Save {discount}%
              </span>
            )}
          </div>

          {product.stockCount !== undefined && product.stockCount > 0 && product.stockCount <= 10 && (
            <div className="mb-4 inline-block w-fit bg-amber-100 text-amber-800 border border-amber-200 text-sm px-3 py-1.5 rounded-full font-medium flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Hurry! Only {product.stockCount} items left in stock.
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {product.description ||
              'A premium, spiritually authentic product meticulously sourced and crafted for your daily rituals. This item brings calm and sacred tradition into any environment it adorns.'}
          </p>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className={`w-full py-3 rounded-lg flex justify-center items-center gap-2 font-medium transition shadow-md hover:shadow-lg mb-6 ${
              added ? 'bg-green-600 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" /> Added to Cart
              </>
            ) : (
              'Add to Cart'
            )}
          </button>

          {/* Core Highlights */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">100% Authentic</h4>
                <p className="text-xs text-gray-500 mt-0.5">Sourced ethically with pure elements</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Free Delivery</h4>
                <p className="text-xs text-gray-500 mt-0.5">On all prepaid orders across India</p>
              </div>
            </div>
          </div>

          {/* Accordion / Details */}
          <div className="border-t border-gray-200 divide-y divide-gray-200">
            <details className="group py-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-gray-900 list-none">
                <span>Product Specifications</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-gray-600 text-sm mt-3 leading-relaxed">
                <ul className="list-disc list-inside space-y-1">
                  <li>Material: High quality elements</li>
                  <li>Usage: Perfect for spiritual and religious rituals</li>
                  <li>Package Contains: 1 quantity</li>
                  <li>Origin: India</li>
                </ul>
              </div>
            </details>

            <details className="group py-4 cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-gray-900 list-none">
                <span>Shipping & Returns</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-gray-600 text-sm mt-3 leading-relaxed">
                Orders are usually dispatched within 24-48 hours. Depending on your location,
                delivery takes 3 to 7 business days. We offer a 7-day return policy for items 
                that arrive damaged or defective.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-medium mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <ProductCard key={rp.id} product={rp} onAddToCart={() => onAddToCart(rp.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewSection productId={product.id} />

      {/* Sticky Bottom Add to Cart Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] p-3 md:p-4 z-50 transform transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4">
            <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded bg-gray-50 border border-gray-100" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
              <p className="text-orange-600 font-semibold text-sm">₹{product.price.toFixed(2)}</p>
            </div>
          </div>
          <div className="w-full md:w-auto flex items-center gap-4">
            <div className="md:hidden flex-1">
              <p className="text-gray-500 text-xs">Total Price</p>
              <p className="text-gray-900 font-bold text-lg">₹{product.price.toFixed(2)}</p>
            </div>
            <button
              onClick={handleAdd}
              className={`w-full md:w-auto px-8 py-3 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition shadow-sm ${
                added ? 'bg-green-600' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {added ? <><Check className="w-4 h-4" /> Added to Cart</> : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Related Products (Cross-sell Section) ── */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-gray-100 pt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-medium text-gray-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              You May Also Like
            </h2>
            <div className="w-24 h-1 bg-orange-600 mx-auto rounded-full"></div>
            <p className="text-gray-500 mt-4">Discover similar spiritual items tailored for you.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(related => (
              <ProductCard key={related.id} product={related} onAddToCart={() => onAddToCart(related.id)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Full Screen Image Modal ── */}
      <AnimatePresence>
        {isFullScreenImageOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
            onClick={() => setIsFullScreenImageOpen(false)}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreenImageOpen(false);
              }}
              className="absolute top-6 right-6 text-white hover:text-orange-500 transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full shadow-lg z-50"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={activeImage || product.image}
              alt={product.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent click propagating to backdrop
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
