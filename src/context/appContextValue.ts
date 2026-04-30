import { createContext, useContext } from 'react';
import type { Product } from '../data/mockData';

export interface CartItem extends Product {
  quantity: number;
}

export interface AppContextType {
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
  refreshProducts: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
