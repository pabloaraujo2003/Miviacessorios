import React, { useRef, useState } from 'react';
import { ShoppingBag, X, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/appContextValue';
import { STORE_WHATSAPP_NUMBER, hasStoreWhatsappNumber } from '../lib/storeContact';

interface CartDrawerProps {
  className?: string;
}

const SWIPE_CLOSE_THRESHOLD = 80;

export const CartDrawer: React.FC<CartDrawerProps> = ({ className = '' }) => {
  const { cart, isCartOpen, toggleCart, closeCart, removeFromCart, addToCart } = useAppContext();

  const touchStartX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  const parsePrice = (priceStr: string): number => {
    const num = priceStr.replace('R$ ', '').replace('.', '').replace(',', '.');
    return parseFloat(num) || 0;
  };

  const total = cart.reduce((acc, item) => acc + (parsePrice(item.price) * Math.max(1, item.quantity)), 0);
  const formattedTotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleCheckout = (): void => {
    if (cart.length === 0) return;

    if (!hasStoreWhatsappNumber) {
      window.alert('Configure o número da loja em VITE_STORE_WHATSAPP_NUMBER para finalizar pelo WhatsApp.');
      return;
    }

    const itemLines = cart.map(item => `- ${item.name} x${item.quantity} (${item.price})`);
    const message = [
      'Oi! Vim pelo site da Mivi e quero fechar minha compra.',
      '',
      'Itens do pedido:',
      ...itemLines,
      '',
      `Total estimado: ${formattedTotal}`,
      '',
      'Quero confirmar valores, entrega e forma de pagamento.',
    ].join('\n');

    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTouchStart = (e: React.TouchEvent): void => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (delta > 0) setDragX(delta);
  };

  const handleTouchEnd = (): void => {
    if (dragX > SWIPE_CLOSE_THRESHOLD) {
      closeCart();
    }
    setDragX(0);
    touchStartX.current = null;
  };

  if (!isCartOpen) return null;

  const drawerOpacity = dragX > 0 ? Math.max(0.1, 1 - dragX / 300) : 1;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-[#101418]/28 backdrop-blur-sm transition-opacity"
        style={{ opacity: drawerOpacity }}
        onClick={closeCart}
      />

      <aside
        aria-label="Sacola de compras"
        aria-modal="true"
        role="dialog"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: dragX > 0 ? `translateX(${dragX}px)` : undefined,
          transition: dragX > 0 ? 'none' : 'transform 0.3s ease-in-out',
        }}
        className={`fixed top-0 right-0 z-[60] flex h-full w-full max-w-md flex-col bg-surface-container-lowest px-6 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))] shadow-2xl ${className}`}
      >
        <header className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-2xl text-on-surface flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            Sua Sacola
          </h2>
          <button
            type="button"
            aria-label="Fechar sacola"
            onClick={toggleCart}
            className="interactive-icon h-11 w-11 rounded-full text-on-surface-variant active:bg-black/5 active:text-on-surface dark:active:bg-white/10"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-on-surface-variant opacity-70">
              <ShoppingBag className="w-12 h-12 stroke-1" />
              <p className="font-body font-light text-center">Sua sacola está vazia.</p>
            </div>
          ) : (
            cart.map(item => {
              const isAtStockLimit = item.stock != null && Math.max(1, item.quantity) >= item.stock;
              return (
              <div key={item.id} className="flex gap-4 p-4 bg-surface rounded-md">
                <img src={item.imageUrl} alt={item.name} loading="lazy" className="interactive-media h-24 w-20 rounded-sm object-cover" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline text-lg">{item.name}</h3>
                    <p className="font-label text-[0.65rem] tracking-wider text-outline uppercase">{(item.features ?? []).join(' • ')}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-body text-sm font-light">{item.price}</span>
                    <div className="flex items-center gap-3 bg-surface-container rounded-full px-2 py-1">
                      <button type="button" aria-label={`Remover ${item.name} da sacola`} onClick={() => removeFromCart(item.id)} className="interactive-icon h-9 w-9 rounded-full text-on-surface-variant active:bg-error/10 active:text-error">
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                      <span className="font-body text-sm w-4 text-center">{Math.max(1, item.quantity)}</span>
                      <button type="button" aria-label={isAtStockLimit ? `Estoque máximo de ${item.name} atingido` : `Adicionar mais um ${item.name}`} disabled={isAtStockLimit} onClick={() => addToCart(item)} className="interactive-icon h-9 w-9 rounded-full text-on-surface-variant active:bg-primary/10 active:text-primary disabled:opacity-30 disabled:active:bg-transparent disabled:active:text-on-surface-variant">
                        <Plus className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="pt-6 border-t border-surface-container mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="font-label text-sm uppercase tracking-wider text-on-surface-variant">Total Estimado</span>
              <span className="font-headline text-2xl text-on-surface">{formattedTotal}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="interactive-surface w-full rounded-sm bg-primary py-4 font-label text-xs uppercase tracking-[0.2em] text-on-primary active:bg-primary-dim"
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
