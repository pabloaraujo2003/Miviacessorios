import { useEffect, useRef, useState } from 'react';

interface UseIncrementalListOptions {
  pageSize?: number;
  /** Quando muda (categoria, busca), volta a exibir só o primeiro lote. */
  resetKey?: string;
}

/**
 * Scroll infinito no cliente: renderiza a lista em lotes e libera o próximo
 * quando o sentinela chega perto da tela. A lista já está toda em memória
 * (o JSON do catálogo é leve); o que pesa são os cards e as fotos.
 */
export const useIncrementalList = <T,>(items: T[], { pageSize = 8, resetKey = '' }: UseIncrementalListOptions = {}) => {
  const [state, setState] = useState({ resetKey, count: pageSize });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset durante o render (padrão do React para estado derivado de props),
  // sem esperar um efeito e sem piscar a lista antiga.
  let count = state.count;
  if (state.resetKey !== resetKey) {
    count = pageSize;
    setState({ resetKey, count });
  }

  const hasMore = count < items.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || !sentinel) return;

    // Recriado a cada lote: se o sentinela continuar visível (tela alta),
    // o callback inicial do observer já libera o lote seguinte.
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setState(prev => ({ ...prev, count: prev.count + pageSize }));
        }
      },
      { rootMargin: '800px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [count, hasMore, pageSize]);

  return { visibleItems: items.slice(0, count), hasMore, sentinelRef };
};
