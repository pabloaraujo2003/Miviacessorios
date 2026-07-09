const PREFIX = 'mivi:v1:';

/**
 * Leitura síncrona de cache local para permitir stale-while-revalidate:
 * a UI renderiza o valor da visita anterior instantaneamente, e quem
 * chamou é responsável por buscar dados novos em paralelo e regravar.
 */
export const readCache = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const writeCache = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage cheio ou indisponível (modo privado) — segue sem cache.
  }
};
