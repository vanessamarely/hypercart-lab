import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFlags } from '@/lib/performance-flags';
import { addPerformanceMark, measurePerformance } from '@/lib/performance-utils';
import { Product, CartItem } from '@/lib/types';
import { getAllProducts } from '@/lib/products';
import { getLocalProductImage } from '@/lib/product-images';
import { CartAddedModal } from '@/components/CartAddedModal';
import { ShoppingCart } from '@phosphor-icons/react';
import { useCart } from '@/hooks/use-cart';

interface ProductsPageProps {
  onProductClick: (productId: number) => void;
  onNavigate?: (page: string) => void;
}

export function ProductsPage({ onProductClick, onNavigate }: ProductsPageProps) {
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<Map<number, string>>(new Map());
  
  // Memoize flags to prevent infinite re-renders
  const flags = useMemo(() => getFlags(), []);

  useEffect(() => {
    addPerformanceMark('products-page-start');
    
    const loadProductsWithImages = async () => {
      const allProducts = getAllProducts();
      setProducts(allProducts);
      
      // Limit to first 12 products to avoid rate limiting
      const productsToLoad = allProducts.slice(0, 12);
      const imageMap = new Map<number, string>();
      
      // Load images in parallel but with a small delay to avoid rate limiting
      const imagePromises = productsToLoad.map((product, index) => 
        new Promise<string>(resolve => {
          setTimeout(async () => {
            try {
              const imageUrl = await getLocalProductImage(product.id, product.category, product.name);
              imageMap.set(product.id, imageUrl);
              resolve(imageUrl);
            } catch (error) {
              console.error(`Failed to load image for product ${product.id}:`, error);
              const fallbackUrl = '/src/assets/images/product-1.webp';
              imageMap.set(product.id, fallbackUrl);
              resolve(fallbackUrl);
            }
          }, index * 200); // 200ms delay between requests
        })
      );
      
      await Promise.all(imagePromises);
      
      // Update images only once after all are loaded
      setProductImages(imageMap);
      setLoading(false);
      
      addPerformanceMark('products-page-end');
      measurePerformance('products-page-load', 'products-page-start', 'products-page-end');
    };
    
    loadProductsWithImages();
    
    const renderProducts = () => {
      addPerformanceMark('render-products-start');
      document.querySelector('.product-grid')?.getBoundingClientRect();
      addPerformanceMark('render-products-end');
      measurePerformance('render-products', 'render-products-start', 'render-products-end');
    };

    setTimeout(renderProducts, 100);
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    addPerformanceMark('add-to-cart-start');

    // Add the image URL to the product before setting it
    const productWithImage = {
      ...product,
      image: productImages.get(product.id) || ''
    };
    setAddedProduct(productWithImage);

    setCart((currentCart) => {
      const cartArray = currentCart || [];
      const existingItem = cartArray.find(item => item.product.id === product.id);
      
      let newCart;
      if (existingItem) {
        newCart = cartArray.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...cartArray, { product, quantity: 1 }];
      }
      
      return newCart;
    });

    addPerformanceMark('add-to-cart-end');
    measurePerformance('add-to-cart-interaction', 'add-to-cart-start', 'add-to-cart-end');
    
    setShowCartModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>
            <p className="text-muted-foreground">
              Loading products with beautiful high-quality images...
            </p>
          </div>
          <div className="product-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="product-card">
                <div className="skeleton w-full h-48 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="skeleton h-4 w-3/4 mb-2"></div>
                  <div className="skeleton h-3 w-full mb-1"></div>
                  <div className="skeleton h-3 w-2/3 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="skeleton h-6 w-16"></div>
                    <div className="skeleton h-8 w-20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>
          <p className="text-muted-foreground">
            Browse our collection of products featuring beautiful high-quality images.
          </p>
        </div>

        <div className="product-grid" data-cy="product-grid">
          {products.slice(0, 12).map((product) => (
            <Card 
              key={product.id} 
              className="product-card cursor-pointer hover:shadow-lg transition-all"
              onClick={() => onProductClick(product.id)}
              data-cy={`product-card-${product.id}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={productImages.get(product.id) || '/src/assets/images/product-1.webp'}
                  alt={product.imageAlt || product.name}
                  className={`product-image object-cover transition-transform hover:scale-105 ${flags.missingSizes ? 'no-dimensions' : ''}`}
                  loading={flags.lazyOff ? 'eager' : 'lazy'}
                  style={!flags.missingSizes ? { width: '100%', height: '200px' } : undefined}
                  data-cy="product-image"
                />
                {!product.inStock && (
                  <Badge className="absolute top-2 right-2 bg-destructive">
                    Out of Stock
                  </Badge>
                )}
                <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground">
                  {product.category}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-muted-foreground">
                        ⭐ {product.rating}
                      </span>
                    </div>
                  </div>
                  
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
                      disabled={!product.inStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(product.id);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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