import React, { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/mockData';
import { MOCK_PRODUCTS } from '../data/mockData';
import { hasSupabaseKeys } from '../lib/env';
import { fetchProductsRest, readCachedProducts, writeCachedProducts } from '../lib/products';
import { AppContext } from './appContextValue';
import type { CartItem } from './appContextValue';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Stale-while-revalidate: renderiza o catálogo da visita anterior
  // instantaneamente (sem skeleton) enquanto revalida em background.
  const cachedProducts = hasSupabaseKeys ? readCachedProducts() : null;
  const [products, setProducts] = useState<Product[]>(
    !hasSupabaseKeys ? MOCK_PRODUCTS : cachedProducts ?? []
  );
  const [isLoadingProducts, setIsLoadingProducts] = useState(hasSupabaseKeys && !cachedProducts);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch products from database if keys are configured
  React.useEffect(() => {
    if (!hasSupabaseKeys) {
      return;
    }

    const abortController = new AbortController();
    let isActive = true;

    const fetchProducts = async (): Promise<void> => {
      const data = await fetchProductsRest(abortController.signal);

      if (!isActive || abortController.signal.aborted) {
        return;
      }

      if (data) {
        setProducts(data);
        writeCachedProducts(data);
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
    if (!product.id || product.stock === 0) {
      return;
    }

    navigator.vibrate?.(40);

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const maxQuantity = existing.stock ?? Infinity;
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(Math.max(1, item.quantity) + 1, maxQuantity) }
            : item
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
    const data = await fetchProductsRest(controller.signal);
    if (controller.signal.aborted) return;
    if (data) {
      setProducts(data);
      writeCachedProducts(data);
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
