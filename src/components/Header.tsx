import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/appContextValue';
import { blackFridayEndLabel, isBlackFridayActive, maxDiscountOf } from '../lib/campaign';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { cart, products, toggleCart, toggleMenu } = useAppContext();
  const showBlackFriday = isBlackFridayActive();
  const maxDiscount = showBlackFriday ? maxDiscountOf(products) : null;
  const headerRef = useRef<HTMLElement>(null);
  // Celular: ao rolar, o header encolhe numa cápsula flutuante (como a barra inferior)
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const update = () => setIsCompact(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Expõe a altura do header fixo em --header-h (o filtro de categorias gruda logo abaixo)
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () => document.documentElement.style.setProperty('--header-h', `${Math.round(header.getBoundingClientRect().bottom)}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-0 right-0 top-0 z-40 overflow-hidden backdrop-blur-md transition-[top,left,right,border-radius,background-color,box-shadow] duration-300 ${
          isCompact
            ? 'border-b hairline bg-[#f8f9fa]/95 dark:bg-[#1f1f1f]/95 max-md:left-3 max-md:right-3 max-md:top-[calc(0.5rem+env(safe-area-inset-top))] max-md:rounded-[999px] max-md:border max-md:border-black/[0.06] max-md:bg-[#f8f9fa]/55 max-md:shadow-[0_12px_40px_rgba(43,52,55,0.14)] max-md:backdrop-saturate-150 max-md:dark:border-white/10 max-md:dark:bg-[#1f1f1f]/55'
            : 'border-b hairline bg-[#f8f9fa]/95 dark:bg-[#1f1f1f]/95'
        } ${className}`}
      >
        {showBlackFriday && (
          <div className={`flex h-8 items-center justify-center overflow-hidden bg-[#0c0c0c] px-4 text-center font-label text-[0.6rem] uppercase tracking-[0.25em] text-white transition-[height] duration-300 ${isCompact ? 'max-md:h-0' : ''}`}>
            <span className="truncate">
              Black Friday
              {maxDiscount !== null && (
                <> · até <strong className="font-bold text-[#ff5a5f]">{maxDiscount}% OFF</strong></>
              )}
              {' '}· até {blackFridayEndLabel}
            </span>
          </div>
        )}
        <div className={`mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 transition-[padding] duration-300 sm:px-6 lg:px-8 ${isCompact ? 'max-md:px-1.5 max-md:py-0.5' : ''}`}>
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
            <span className={`mt-1 block font-label text-[0.5rem] uppercase tracking-[0.45em] text-outline sm:text-[0.55rem] ${isCompact ? 'max-md:hidden' : ''}`}>Acessórios</span>
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
      {/* O header é fixed: o espaçador empurra o conteúdo pela altura da faixa */}
      {showBlackFriday && <div aria-hidden="true" className="h-8" />}
    </>
  );
};
