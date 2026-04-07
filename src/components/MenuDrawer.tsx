import React from 'react';
import { NavLink } from 'react-router-dom';
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

  if (!isMenuOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#101418]/28 backdrop-blur-sm transition-opacity"
        onClick={closeMenu}
      />

      <aside className={`fixed left-0 top-0 z-[60] flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-surface-container-lowest px-6 pb-10 pt-6 shadow-2xl ${className}`}>
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
            className="text-on-surface-variant transition-all hover:text-on-surface hover:rotate-90 active:scale-90"
          >
            <X className="h-6 w-6 stroke-[1.5]" />
          </button>
        </header>

        <nav className="flex flex-1 flex-col gap-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-2xl border px-4 py-4 transition-colors ${
                  isActive
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-outline/10 text-on-surface hover:border-primary/20 hover:bg-surface'
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
