import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance, microYield, WorkerManager } from '@/lib/performance-utils';
import { Product, CartItem } from '@/lib/types';
import { getAllProducts, searchProducts as searchProductsFromLib } from '@/lib/products';
import { getLocalProductImage } from '@/lib/product-images';
import { CartAddedModal } from '@/components/CartAddedModal';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart } from '@phosphor-icons/react';

interface SearchPageProps {
  onProductClick: (productId: number) => void;
  onNavigate?: (page: string) => void;
}

export function SearchPage({ onProductClick, onNavigate }: SearchPageProps) {
  const [cart, setCart] = useCart();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<Map<number, string>>(new Map());
  const [flagsVersion, setFlagsVersion] = useState(0); // Force re-renders when flags change
  
  // Web Worker for search operations
  const workerRef = useRef<WorkerManager | null>(null);
  
  // Get current flags - will update when flagsVersion changes
  const flags = useMemo(() => getFlags(), [flagsVersion]);

  // Listen for flag changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hypercart-flags') {
        setFlagsVersion(prev => prev + 1); // Force flags re-evaluation
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize Web Worker
  useEffect(() => {
    if (flags.useWorker) {
      workerRef.current = new WorkerManager();
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [flags.useWorker]);

  useEffect(() => {
    const loadProductsWithImages = async () => {
      const products = getAllProducts();
      setSearchProducts(products);
      
      const imageMap = new Map<number, string>();
      for (const product of products) {
        const imageUrl = await getLocalProductImage(product.id, product.category, product.name);
        imageMap.set(product.id, imageUrl);
      }
      setProductImages(imageMap);
      setLoading(false);
    };
    
    loadProductsWithImages();
  }, []);

  // Enhanced search function with Web Worker support
  const performSearch = async (searchQuery: string) => {
    addPerformanceMark('search-start');
    setIsSearching(true);

    // Debug: Log current flags state
    console.log('🔍 Search initiated with flags:', {
      useWorker: flags.useWorker,
      microYield: flags.microYield,
      debounce: flags.debounce,
      query: searchQuery
    });

    try {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      if (searchTerms.length === 0) {
        setResults([]);
        return;
      }

      // BEFORE ❌: All processing on main thread (blocks UI)
      // AFTER ✅: Use Web Worker for heavy processing when flag is enabled
      if (flags.useWorker && workerRef.current) {
        addPerformanceMark('worker-search-start');
        console.log('🟢 Using Web Worker for search processing');
        
        try {
          // Send search data to worker for background processing
          const workerResults = await workerRef.current.execute('search', {
            query: searchQuery,
            products: searchProducts
          });
          
          addPerformanceMark('worker-search-end');
          measurePerformance('worker-search', 'worker-search-start', 'worker-search-end');
          
          console.log('✅ Web Worker search completed, results:', workerResults.length);
          
          // Worker returns results, no main thread blocking
          setResults(workerResults.slice(0, 20));
          
        } catch (error) {
          console.warn('❌ Worker search failed, falling back to main thread:', error);
          // Fallback to main thread processing
          await performMainThreadSearch(searchTerms);
        }
      } else {
        console.log('🟡 Using main thread for search processing');
        // Main thread processing (potentially blocking)
        await performMainThreadSearch(searchTerms);
      }

    } finally {
      setIsSearching(false);
      addPerformanceMark('search-end');
      measurePerformance('search-operation', 'search-start', 'search-end');
    }
  };

  // Main thread search function (can block UI)
  const performMainThreadSearch = async (searchTerms: string[]) => {
    console.log('🔄 Starting main thread search with microYield:', flags.microYield);
    
    // Simulate heavy computation that blocks main thread
    const heavyComputationStart = performance.now();
    for (let i = 0; i < 50000; i++) {
      Math.sin(i) * Math.cos(i);
    }
    const heavyComputationEnd = performance.now();
    console.log(`⏱️ Heavy computation took: ${(heavyComputationEnd - heavyComputationStart).toFixed(2)}ms`);

    let filteredResults: Product[] = [];

    if (flags.microYield) {
      console.log('🔄 Using micro-yield processing');
      // Process in chunks with yields to prevent blocking
      const chunkSize = 50;
      for (let i = 0; i < searchProducts.length; i += chunkSize) {
        const chunk = searchProducts.slice(i, i + chunkSize);
        const chunkResults = chunk.filter(product => 
          searchTerms.every(term => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
          )
        );
        filteredResults = [...filteredResults, ...chunkResults];
        
        // Yield control back to browser
        await microYield();
      }
    } else {
      console.log('⚠️ Processing all at once (blocking)');
      // Process all at once (blocking main thread)
      filteredResults = searchProducts.filter(product => 
        searchTerms.every(term => 
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
        )
      );
    }

    console.log(`📊 Main thread search completed, found ${filteredResults.length} results`);
    setResults(filteredResults.slice(0, 20));
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (flags.debounce) {
      console.log('⏰ Debounced search scheduled for:', value);
      // Debounced search
      const timer = setTimeout(() => {
        console.log('⏰ Executing debounced search for:', value);
        performSearch(value);
      }, 300);
      setDebounceTimer(timer);
    } else {
      console.log('⚡ Immediate search for:', value);
      // Immediate search (can cause input lag)
      performSearch(value);
    }
  };

  useEffect(() => {
    addPerformanceMark('search-page-load');
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    addPerformanceMark('add-to-cart-start');

    setAddedProduct(product);

    setCart((currentCart) => {
      const cartArray = currentCart || [];
      const existingItem = cartArray.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return cartArray.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...cartArray, { product, quantity: 1 }];
      }
    });

    addPerformanceMark('add-to-cart-end');
    measurePerformance('add-to-cart-interaction', 'add-to-cart-start', 'add-to-cart-end');
    
    setShowCartModal(true);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>
          <p className="text-muted-foreground mb-6">
            Search through our catalog with local product images. Use debug panel to toggle input responsiveness optimizations.
          </p>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={query}
              onChange={handleInputChange}
              className="text-lg p-4"
              data-cy="search-input"
              disabled={loading}
            />
            {(isSearching || loading) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          
          {/* Performance Status Indicator */}
          {query && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              {flags.useWorker ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Search processing in Web Worker (non-blocking)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Search processing on main thread 
                  {flags.microYield ? "(with micro-yields)" : "(blocking)"}
                </span>
              )}
            </div>
          )}
          
          {loading && (
            <div className="text-center text-muted-foreground mt-4">
              Loading products with local images...
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {query && !loading && (
            <div className="text-sm text-muted-foreground">
              Found {results.length} results for "{query}"
              {flags.debounce && ' (debounced)'}
              {flags.microYield && ' (with micro-yields)'}
            </div>
          )}

          {results.map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onProductClick(product.id)}
              data-cy={`search-result-${product.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={productImages.get(product.id) || '/src/assets/images/product-1.webp'}
                    alt={product.imageAlt || product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">⭐ {product.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          {product.category}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={!product.inStock}
                            onClick={(e) => handleAddToCart(product, e)}
                            className="p-2"
                          >
                            <ShoppingCart size={16} />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onProductClick(product.id);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {query && results.length === 0 && !isSearching && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              No products found for "{query}". Try a different search term.
            </div>
          )}
        </div>

        <CartAddedModal
          open={showCartModal}
          onOpenChange={setShowCartModal}
          product={addedProduct}
          onContinueShopping={() => setShowCartModal(false)}
          onViewCart={() => {
            setShowCartModal(false);
            onNavigate?.('checkout');
          }}
        />
      </div>
    </div>
  );
}