import React, { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/mockData';
import { MOCK_PRODUCTS } from '../data/mockData';
import { supabase, hasSupabaseKeys } from '../lib/supabase';

interface CartItem extends Product {
  quantity: number;
}

interface AppContextType {
  cart: CartItem[];
  savedItems: Product[];
  isCartOpen: boolean;
  isMenuOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  toggleSaved: (product: Product) => void;
  isSaved: (productId: string) => boolean;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  products: Product[];
  isLoadingProducts: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(!hasSupabaseKeys ? MOCK_PRODUCTS : []);
  const [isLoadingProducts, setIsLoadingProducts] = useState(hasSupabaseKeys);

  // Fetch products from database if keys are configured
  React.useEffect(() => {
    if (hasSupabaseKeys) {
      const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*');
        if (data && !error) {
          const mappedData = data.map((p: any) => ({
            ...p,
            imageUrl: p.imageUrl,
            collectionId: p.collectionId,
            isBundle: p.isBundle,
            bundledProducts: p.bundledProducts
          }));
          setProducts(mappedData as Product[]);
        }
        setIsLoadingProducts(false);
      };
      fetchProducts();
    }
  }, []);

  React.useEffect(() => {
    const shouldLockScroll = isCartOpen || isMenuOpen;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isMenuOpen]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); // Open drawer automatically when adding
    setIsMenuOpen(false);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleSaved = useCallback((product: Product) => {
    setSavedItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isSaved = useCallback((productId: string) => {
    return savedItems.some(item => item.id === productId);
  }, [savedItems]);

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
        products, isLoadingProducts
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
