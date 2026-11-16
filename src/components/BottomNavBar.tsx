import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Search, Heart, Shield, UserRound } from 'lucide-react';
import { useAuth } from '../context/authContextValue';

interface BottomNavBarProps {
  className?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ className = '' }) => {
  const { isAdmin } = useAuth();
  const getLinkClasses = (isActive: boolean) => {
    const base =
      "mobile-tap-highlight touch-manipulation flex min-h-[2.75rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[999px] px-2 py-1 text-center transition-[background-color,color,transform] duration-200 active:scale-[0.96]";
    if (isActive) {
      return `${base} bg-[#2b3437]/[0.07] text-[#2b3437] dark:bg-white/10 dark:text-[#ffffff]`;
    }
    return `${base} text-[#737c7f] active:bg-[#2b3437]/6 active:text-[#2b3437] dark:text-[#abb3b7] dark:active:bg-white/8 dark:active:text-[#f8f9fa]`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Navegacao principal mobile"
      className={`md:hidden fixed inset-x-3 z-50 mx-auto max-w-md rounded-[999px] border border-black/[0.06] bg-[#f8f9fa]/55 shadow-[0_12px_40px_rgba(43,52,55,0.14)] backdrop-blur-md backdrop-saturate-150 dark:border-white/10 dark:bg-[#1f1f1f]/55 ${className}`}
      style={{ bottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      {/* Cápsula flutuante: descolada das bordas, item ativo com pílula por trás */}
      <div className="flex w-full items-stretch gap-1 p-1">
      
      <NavLink 
        to="/" 
        onClick={scrollToTop}
        className={({ isActive }) => getLinkClasses(isActive)}
      >
        {({ isActive }) => (
          <>
            <Sparkles className="h-[1.15rem] w-[1.15rem] stroke-[1.6]" fill={isActive ? 'currentColor' : 'none'} />
            <span className="block max-w-full truncate font-label text-[0.6rem] font-medium tracking-[0.01em]">
              Coleção
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/search" className={({ isActive }) => getLinkClasses(isActive)}>
        <Search className="h-[1.15rem] w-[1.15rem] stroke-[1.6]" />
        <span className="block max-w-full truncate font-label text-[0.6rem] font-medium tracking-[0.01em]">
          Buscar
        </span>
      </NavLink>
      
      <NavLink to="/saved" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <Heart className="h-[1.15rem] w-[1.15rem] stroke-[1.6]" fill={isActive ? 'currentColor' : 'none'} />
            <span className="block max-w-full truncate font-label text-[0.6rem] font-medium tracking-[0.01em]">
              Salvos
            </span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/conta" className={({ isActive }) => getLinkClasses(isActive)}>
        {({ isActive }) => (
          <>
            <UserRound className="h-[1.15rem] w-[1.15rem] stroke-[1.6]" fill={isActive ? 'currentColor' : 'none'} />
            <span className="block max-w-full truncate font-label text-[0.6rem] font-medium tracking-[0.01em]">
              Conta
            </span>
          </>
        )}
      </NavLink>

      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => getLinkClasses(isActive)}>
          {({ isActive }) => (
            <>
              <Shield className="h-[1.15rem] w-[1.15rem] stroke-[1.6]" fill={isActive ? 'currentColor' : 'none'} />
              <span className="block max-w-full truncate font-label text-[0.6rem] font-medium tracking-[0.01em]">
                Admin
              </span>
            </>
          )}
        </NavLink>
      )}

      </div>
    </nav>

  );
};
