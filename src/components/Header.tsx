import React from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { cart, toggleCart, toggleMenu } = useAppContext();
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className={`bg-[#f8f9fa]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl fixed top-0 w-full z-40 ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          aria-label="Abrir menu"
          onClick={toggleMenu}
          className="shrink-0 text-[#5f5e5e] dark:text-[#eaeff1] hover:opacity-70 transition-opacity duration-300 active:scale-95 active:duration-150"
        >
          <Menu className="w-6 h-6 stroke-[1.5]" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-light tracking-[0.18em] text-[#2b3437] dark:text-[#f8f9fa] font-headline sm:text-base md:text-xl md:tracking-[0.3em]">
          MIVI ACESSÓRIOS
        </h1>
        <button 
          aria-label="Abrir sacola"
          onClick={toggleCart}
          className="relative shrink-0 text-[#5f5e5e] dark:text-[#eaeff1] hover:opacity-70 transition-opacity duration-300 active:scale-95 active:duration-150"
        >
          <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-surface-container-highest text-on-surface text-[0.6rem] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-background">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
