import { useState, useEffect } from 'react';
import { CartItem } from '@/lib/types';

const CART_KEY = 'hypercart-cart';

// Global cart state to sync across components
let globalCart: CartItem[] = [];
const listeners: Set<(cart: CartItem[]) => void> = new Set();

// Initialize global cart from localStorage
try {
  const saved = localStorage.getItem(CART_KEY);
  globalCart = saved ? JSON.parse(saved) : [];
} catch {
  globalCart = [];
}

function notifyListeners() {
  listeners.forEach(listener => listener([...globalCart]));
}

function updateGlobalCart(newCart: CartItem[]) {
  globalCart = newCart;
  
  // Save to localStorage
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
  
  // Notify all listeners
  notifyListeners();
}

export function useCart(): [CartItem[], (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void] {
  const [cart, setCartState] = useState<CartItem[]>(globalCart);

  useEffect(() => {
    // Add listener
    const listener = (newCart: CartItem[]) => {
      setCartState(newCart);
    };
    listeners.add(listener);

    // Cleanup
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setCart = (newCart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    const updatedCart = typeof newCart === 'function' ? newCart(globalCart) : newCart;
    updateGlobalCart(updatedCart);
  };

  return [cart, setCart];
}