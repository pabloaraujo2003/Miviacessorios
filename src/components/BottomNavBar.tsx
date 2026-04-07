import React from 'react';
import { NavLink } from 'react-router-dom';

interface BottomNavBarProps {
  className?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ className = '' }) => {
  const getLinkClasses = (isActive: boolean) => {
    const base =
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center active:scale-90 duration-200 transition-colors";
    if (isActive) {
      return `${base} text-[#2b3437] dark:text-[#ffffff] bg-[#eaeff1] dark:bg-[#2b3437]`;
    }
    return `${base} text-[#737c7f] dark:text-[#abb3b7] hover:text-[#5f5e5e] dark:hover:text-[#f8f9fa]`;
  };

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 w-full bg-[#f8f9fa]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl z-50 rounded-t-xl shadow-[0px_-10px_30px_rgba(43,52,55,0.04)] ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl items-stretch gap-1 px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 sm:px-4">
      
      <NavLink to="/" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>auto_awesome</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Colecao
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/search" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>search</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Buscar
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/saved" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            <span className="mt-1 block max-w-full truncate font-label text-[0.6rem] uppercase tracking-[0.08rem] sm:text-[0.6875rem]">
              Salvos
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/admin" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>shield_person</span>
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
