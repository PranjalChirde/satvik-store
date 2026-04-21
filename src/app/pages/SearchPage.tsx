import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/ProductGrid';
import { Search, Filter, X } from 'lucide-react';
import type { Product } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoaders';

interface SearchPageProps {
  onAddToCart: (productId: number) => void;
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc';

export function SearchPage({ onAddToCart }: SearchPageProps) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(query);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Fetch initial data
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

  // Compute unique categories dynamically from products
  const availableCategories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category));
    return Array.from(cats);
  }, [allProducts]);

  // Compute max possible price globally for the slider
  const globalMaxPrice = useMemo(() => {
    if (allProducts.length === 0) return 50000;
    return Math.max(...allProducts.map(p => p.price));
  }, [allProducts]);

  // If products just loaded, set initial maxPrice correctly
  useEffect(() => {
    if (globalMaxPrice > 0 && maxPrice === 50000) {
      setMaxPrice(globalMaxPrice);
    }
  }, [globalMaxPrice]);

  // Filter & Sort Logic
  const filteredResults = useMemo(() => {
    let filtered = [...allProducts];

    // 1. Text Query Search
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // 3. Price Filter
    filtered = filtered.filter(p => p.price <= maxPrice);

    // 4. Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [allProducts, query, selectedCategories, maxPrice, sortBy]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(globalMaxPrice);
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Search Header Area */}
      <div className="bg-white border-b border-gray-200 py-10 shadow-sm z-10 relative">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-medium text-center mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            {query ? `Search: "${query}"` : 'All Products'}
          </h1>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {/* Mobile Filter Toggle */}
            <button 
              type="button"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar / Filters */}
          <div className={`${showFiltersMobile ? 'block' : 'hidden'} lg:block lg:w-1/4 xl:w-1/5 shrink-0`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <button onClick={clearFilters} className="text-sm text-orange-600 hover:underline">
                  Clear All
                </button>
              </div>

              {/* Sort Options */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Sort By</h4>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wider">Categories</h4>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {availableCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize transition">
                        {cat.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Max Price</h4>
                  <span className="text-sm font-semibold text-orange-600">₹{maxPrice}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max={globalMaxPrice > 0 ? globalMaxPrice : 50000}
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>₹0</span>
                  <span>₹{globalMaxPrice}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:w-3/4 xl:w-4/5">
            {loading ? (
              <ProductGridSkeleton />
            ) : filteredResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 px-4 text-center shadow-sm">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <h2 className="text-xl font-medium text-gray-800 mb-2">No matching products found</h2>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search keywords to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-6 py-2 rounded-lg transition font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-500 text-sm">
                    Showing <span className="font-semibold text-gray-900">{filteredResults.length}</span> result{filteredResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ProductGrid products={filteredResults} onAddToCart={onAddToCart} />
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
