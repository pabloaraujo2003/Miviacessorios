import React from 'react';
import { NavLink } from 'react-router-dom';

interface BottomNavBarProps {
  className?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ className = '' }) => {
  const getLinkClasses = (isActive: boolean) => {
    const base =
      "mobile-tap-highlight touch-manipulation flex min-h-[4.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 py-3 text-center transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.96]";
    if (isActive) {
      return `${base} bg-[#eaeff1] text-[#2b3437] shadow-[0_10px_30px_rgba(43,52,55,0.10)] dark:bg-[#2b3437] dark:text-[#ffffff]`;
    }
    return `${base} text-[#737c7f] active:bg-[#2b3437]/6 active:text-[#2b3437] dark:text-[#abb3b7] dark:active:bg-white/8 dark:active:text-[#f8f9fa]`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Navegacao principal mobile"
      className={`md:hidden fixed bottom-0 left-0 z-50 w-full rounded-t-[1.75rem] border-t border-black/5 bg-[#f8f9fa]/92 backdrop-blur-2xl shadow-[0px_-18px_50px_rgba(43,52,55,0.08)] dark:border-white/10 dark:bg-[#1A1A1A]/92 ${className}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-stretch gap-2 px-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 sm:px-4">
      
      <NavLink 
        to="/" 
        onClick={scrollToTop}
        className={({ isActive }) => getLinkClasses(isActive)}
      >
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined text-[1.35rem] leading-none" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>auto_awesome</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Colecao
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/search" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined text-[1.35rem] leading-none" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>search</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Buscar
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/saved" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined text-[1.35rem] leading-none" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Salvos
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/admin" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined text-[1.35rem] leading-none" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>shield_person</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Admin
            </span>
          </>
        )}
      </NavLink>

      </div>
    </nav>

  );
};
