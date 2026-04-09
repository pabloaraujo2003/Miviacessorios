import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { House, Search, Heart, Shield, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface MenuDrawerProps {
  className?: string;
}

const NAV_ITEMS = [
  { to: '/', label: 'Colecao', icon: House },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/saved', label: 'Salvos', icon: Heart },
  { to: '/admin', label: 'Admin', icon: Shield },
];

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ className = '' }) => {
  const { isMenuOpen, closeMenu } = useAppContext();
  const location = useLocation();
  const previousPathnameRef = React.useRef(location.pathname);

  React.useEffect(() => {
    if (isMenuOpen && previousPathnameRef.current !== location.pathname) {
      closeMenu();
    }
    previousPathnameRef.current = location.pathname;
  }, [location.pathname, isMenuOpen, closeMenu]);

  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  if (!isMenuOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#101418]/28 backdrop-blur-sm transition-opacity"
        onClick={closeMenu}
      />

      <aside
        aria-label="Menu principal"
        aria-modal="true"
        role="dialog"
        className={`fixed left-0 top-0 z-[60] flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-surface-container-lowest px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl ${className}`}
      >
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-label text-[0.65rem] uppercase tracking-[0.22em] text-on-surface-variant">
              Navegacao
            </p>
            <h2 className="mt-2 font-headline text-2xl text-on-surface">Menu</h2>
          </div>
          <button
            aria-label="Fechar menu"
            onClick={closeMenu}
            className="mobile-tap-highlight touch-manipulation flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-[background-color,transform,color] duration-200 active:scale-95 active:bg-black/5 active:text-on-surface dark:active:bg-white/10"
          >
            <X className="h-6 w-6 stroke-[1.5]" />
          </button>
        </header>

        <nav className="flex flex-1 flex-col gap-3" aria-label="Atalhos do menu">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-tap-highlight touch-manipulation flex min-h-[4.25rem] items-center justify-between rounded-[1.4rem] border px-4 py-4 transition-[background-color,border-color,color,transform,box-shadow] duration-200 active:scale-[0.985] ${
                  isActive
                    ? 'border-primary/30 bg-primary/6 text-primary shadow-[0_12px_30px_rgba(0,0,0,0.06)]'
                    : 'border-outline/10 text-on-surface active:border-primary/20 active:bg-surface'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 stroke-[1.5]" />
                <span className="font-headline text-lg">{label}</span>
              </span>
              <span className="font-label text-[0.6rem] uppercase tracking-[0.18em] text-on-surface-variant">
                Ir
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
