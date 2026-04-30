import React, { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/mockData';
import { MOCK_PRODUCTS } from '../data/mockData';
import { supabase, hasSupabaseKeys, mapProductRecord } from '../lib/supabase';
import { AppContext } from './appContextValue';
import type { CartItem } from './appContextValue';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(!hasSupabaseKeys ? MOCK_PRODUCTS : []);
  const [isLoadingProducts, setIsLoadingProducts] = useState(hasSupabaseKeys);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch products from database if keys are configured
  React.useEffect(() => {
    if (!hasSupabaseKeys) {
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

    const fetchProducts = async (): Promise<void> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .abortSignal(abortController.signal);

      if (!isActive || abortController.signal.aborted) {
        return;
      }

      if (data && !error) {
        setProducts(data.map(mapProductRecord).filter((product): product is Product => product !== null));
      }
      setIsLoadingProducts(false);
    };

    void fetchProducts();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (!product.id) {
      return;
    }

    navigator.vibrate?.(40);

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: Math.max(1, item.quantity) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setIsMenuOpen(false);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    if (!productId) {
      return;
    }

    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleSaved = useCallback((product: Product) => {
    if (!product.id) {
      return;
    }

    setSavedItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isSaved = useCallback((productId: string) => {
    if (!productId) {
      return false;
    }

    return savedItems.some(item => item.id === productId);
  }, [savedItems]);

  const refreshProducts = useCallback(async (): Promise<void> => {
    if (!hasSupabaseKeys) return;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .abortSignal(controller.signal);
    if (controller.signal.aborted) return;
    if (data && !error) {
      setProducts(data.map(mapProductRecord).filter((p): p is Product => p !== null));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => {
      const next = !prev;
      if (next) {
        setIsMenuOpen(false);
      }
      return next;
    });
  }, []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const next = !prev;
      if (next) {
        setIsCartOpen(false);
      }
      return next;
    });
  }, []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <AppContext.Provider 
      value={{ 
        cart, savedItems, isCartOpen, isMenuOpen,
        addToCart, removeFromCart, toggleSaved, isSaved, clearCart, toggleCart, closeCart, toggleMenu, closeMenu,
        products, isLoadingProducts, refreshProducts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
