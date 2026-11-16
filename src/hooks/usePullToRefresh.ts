import { useCallback, useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 72;
const MAX_PULL = 120;
// Movimento mínimo para decidir se o gesto é vertical (puxar) ou horizontal (carrosséis)
const DIRECTION_LOCK_PX = 8;

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
}

interface UsePullToRefreshResult {
  pullDistance: number;
  isRefreshing: boolean;
  isTriggered: boolean;
}

export const usePullToRefresh = ({ onRefresh, enabled = true }: UsePullToRefreshOptions): UsePullToRefreshResult => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const startY = useRef<number | null>(null);
  const startX = useRef(0);
  const gesture = useRef<'undecided' | 'pull' | 'ignore'>('undecided');
  const isPulling = useRef(false);

  const canPull = useCallback(() => {
    return enabled && !isRefreshing && window.scrollY === 0;
  }, [enabled, isRefreshing]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent): void => {
      if (!canPull()) return;
      startY.current = e.touches[0].clientY;
      startX.current = e.touches[0].clientX;
      gesture.current = 'undecided';
      isPulling.current = false;
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (startY.current === null || !canPull()) return;
      const delta = e.touches[0].clientY - startY.current;
      const deltaX = e.touches[0].clientX - startX.current;

      // Deslize lateral (ex.: carrossel do topo) não pode virar "puxar para atualizar"
      if (gesture.current === 'undecided') {
        if (Math.max(Math.abs(delta), Math.abs(deltaX)) < DIRECTION_LOCK_PX) return;
        gesture.current = delta > Math.abs(deltaX) ? 'pull' : 'ignore';
      }
      if (gesture.current === 'ignore' || delta <= 0) return;

      isPulling.current = true;
      const clamped = Math.min(delta * 0.5, MAX_PULL);
      setPullDistance(clamped);
      setIsTriggered(clamped >= PULL_THRESHOLD);

      if (clamped > 0) e.preventDefault();
    };

    const handleTouchEnd = async (): Promise<void> => {
      if (!isPulling.current) return;
      startY.current = null;
      isPulling.current = false;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(0);
        setIsTriggered(false);
        navigator.vibrate?.(30);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setPullDistance(0);
        setIsTriggered(false);
      }
    };

    const onTouchEnd = (): void => { void handleTouchEnd(); };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [canPull, onRefresh, pullDistance]);

  return { pullDistance, isRefreshing, isTriggered };
};
