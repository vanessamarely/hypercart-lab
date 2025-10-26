import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShoppingCart } from '@phosphor-icons/react';
import { Product, CartItem } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';

interface CartAddedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onContinueShopping: () => void;
  onViewCart: () => void;
}

export function CartAddedModal({ 
  open, 
  onOpenChange, 
  product, 
  onContinueShopping,
  onViewCart 
}: CartAddedModalProps) {
  const [cart] = useCart();
  
  const totalCartItems = (cart || []).reduce((total, item) => total + item.quantity, 0);

  return (
    <Dialog open={open && !!product} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby="cart-added-description">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle size={24} weight="fill" />
                Added to Cart!
              </DialogTitle>
            </DialogHeader>
            
            <div id="cart-added-description" className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                    <ShoppingCart size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {product.category}
                  </Badge>
                  <p className="text-lg font-semibold text-primary">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                <ShoppingCart size={20} className="text-primary" />
                <span className="font-medium">
                  {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in cart
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onContinueShopping}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={onViewCart}
                  className="flex-1"
                >
                  View Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}