import React, { useEffect, useState } from 'react';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { useCategoryOptions } from '../hooks/useCategoryOptions';

interface MobileCategorySheetProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  // A pílula só aparece depois que o filtro do topo saiu da tela
  isVisible: boolean;
}

/**
 * Filtro do celular: uma pílula flutuante acima da barra inferior abre uma
 * gaveta com as categorias. Substitui o filtro grudado, que tomava altura da
 * tela (já apertada pela barra de endereço do navegador).
 */
export const MobileCategorySheet: React.FC<MobileCategorySheetProps> = ({
  activeCategory,
  onSelectCategory,
  isVisible,
}) => {
  const options = useCategoryOptions();
  const [isOpen, setIsOpen] = useState(false);
  const active = options.find(option => option.id === activeCategory) ?? options.find(option => option.id === 'all');
  const isFiltered = activeCategory !== 'all';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id: string): void => {
    setIsOpen(false);
    onSelectCategory(id);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        className={`fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-[999px] px-4 py-2.5 font-label text-[0.65rem] uppercase tracking-[0.18em] shadow-[0_10px_30px_rgba(12,12,12,0.25)] transition-[opacity,transform] duration-300 active:scale-95 ${
          isFiltered ? 'bg-[#0c0c0c] text-white' : 'bg-surface-container-lowest text-on-surface border hairline'
        } ${isVisible ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
      >
        <SlidersHorizontal className="h-4 w-4 stroke-[1.5]" />
        Filtrar
        {isFiltered && active && (
          <span className={active.isBlackFriday ? 'text-[#ff5a5f]' : 'opacity-70'}>· {active.label}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[55] bg-[#101418]/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtrar por categoria"
            className="animate-sheet-up fixed inset-x-0 bottom-0 z-[60] max-h-[80dvh] overflow-y-auto rounded-t-[1.75rem] bg-surface-container-lowest px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
          >
            <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-outline-variant/60" />
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-headline text-xl italic text-on-surface">Categorias</h2>
              <button
                type="button"
                aria-label="Fechar filtro"
                onClick={() => setIsOpen(false)}
                className="interactive-icon h-10 w-10 rounded-full text-on-surface-variant active:bg-black/5"
              >
                <X className="h-5 w-5 stroke-[1.5]" />
              </button>
            </div>

            <ul className="divide-y divide-outline-variant/30">
              {options.map(option => {
                const isActive = option.id === activeCategory;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleSelect(option.id)}
                      className="flex w-full items-center justify-between gap-3 py-4 text-left active:opacity-60"
                    >
                      <span className="flex items-center gap-3">
                        {option.isBlackFriday ? (
                          <span className="bg-[#0c0c0c] px-2 py-1 font-label text-[0.65rem] uppercase tracking-[0.18em] text-white">
                            {option.label}
                          </span>
                        ) : (
                          <span className={`font-label text-[0.75rem] uppercase tracking-[0.15em] ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                            {option.label}
                          </span>
                        )}
                        <span className={`font-body text-xs tabular-nums ${option.isBlackFriday ? 'text-[#e5484d]' : 'text-outline'}`}>
                          {option.count}
                        </span>
                      </span>
                      {isActive && <Check className="h-4 w-4 text-on-surface" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
