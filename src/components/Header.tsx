import React from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/appContextValue';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { cart, toggleCart, toggleMenu } = useAppContext();
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`bg-[#f8f9fa]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl fixed top-0 w-full z-40 border-b hairline ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          aria-label="Abrir menu"
          onClick={toggleMenu}
          className="mobile-tap-highlight touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#5f5e5e] transition-[background-color,transform,color] duration-200 active:scale-95 active:bg-[#2b3437]/8 dark:text-[#eaeff1] dark:active:bg-white/10"
        >
          <Menu className="w-6 h-6 stroke-[1.5]" />
        </button>
        <h1
          onClick={scrollToTop}
          className="min-w-0 flex-1 cursor-pointer select-none truncate text-center leading-none text-[#2b3437] dark:text-[#f8f9fa] active:opacity-70 transition-opacity"
        >
          <span className="block font-headline text-base font-light tracking-[0.32em] sm:text-lg md:text-xl md:tracking-[0.4em]">MIVI</span>
          <span className="mt-1 block font-label text-[0.5rem] uppercase tracking-[0.45em] text-outline sm:text-[0.55rem]">Acessórios</span>
        </h1>
        <button 
          aria-label="Abrir sacola"
          onClick={toggleCart}
          className="mobile-tap-highlight touch-manipulation relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#5f5e5e] transition-[background-color,transform,color] duration-200 active:scale-95 active:bg-[#2b3437]/8 dark:text-[#eaeff1] dark:active:bg-white/10"
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
