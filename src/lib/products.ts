import type { Product } from '../data/mockData';
import { hasSupabaseKeys, supabaseAnonKey, supabaseUrl } from './env';
import { readCache, writeCache } from './cache';

interface BundledProductRecord {
  id?: unknown;
  name?: unknown;
  price?: unknown;
  features?: unknown;
}

type BundledProduct = NonNullable<Product['bundledProducts']>[number];

interface ProductRecord {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  price?: unknown;
  imageUrl?: unknown;
  dominantColor?: unknown;
  collectionId?: unknown;
  features?: unknown;
  isBundle?: unknown;
  bundledProducts?: unknown;
  stock?: unknown;
}

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toStringArray = (value: unknown): string[] => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
);

const toBundledProducts = (value: unknown): Product['bundledProducts'] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): BundledProduct | null => {
      const bundledItem = item as BundledProductRecord;
      const id = toString(bundledItem.id);
      const name = toString(bundledItem.name);
      const price = toString(bundledItem.price);

      if (!id || !name || !price) {
        return null;
      }

      return {
        id,
        name,
        price,
        features: toStringArray(bundledItem.features),
      };
    })
    .filter((item): item is BundledProduct => item !== null);
};

export const mapProductRecord = (record: unknown): Product | null => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const productRecord = record as ProductRecord;
  const id = toString(productRecord.id);
  const name = toString(productRecord.name);
  const category = toString(productRecord.category);
  const price = toString(productRecord.price);
  const imageUrl = toString(productRecord.imageUrl);

  if (!id || !name || !category || !price || !imageUrl) {
    return null;
  }

  return {
    id,
    name,
    category,
    price,
    imageUrl,
    dominantColor: toString(productRecord.dominantColor) || undefined,
    collectionId: toString(productRecord.collectionId) || undefined,
    features: toStringArray(productRecord.features),
    stock: typeof productRecord.stock === 'number' && productRecord.stock >= 0
      ? Math.floor(productRecord.stock)
      : null,
    isBundle: Boolean(productRecord.isBundle),
    bundledProducts: toBundledProducts(productRecord.bundledProducts),
  };
};

const PRODUCTS_CACHE_KEY = 'products';
const HERO_CACHE_KEY = 'hero_url';

/**
 * Fetch via REST (PostgREST) direto, sem @supabase/supabase-js — mantém o
 * caminho público (Home/AppContext/Hero) livre desse pacote, que só é
 * necessário no Admin (auth, storage, escrita). Isso permite ao bundler
 * isolar o vendor-supabase (~47KB gzip) no chunk assíncrono do /admin.
 */
export const fetchProductsRest = async (signal?: AbortSignal): Promise<Product[] | null> => {
  if (!hasSupabaseKeys) {
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      signal,
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as unknown[];
    return data.map(mapProductRecord).filter((p): p is Product => p !== null);
  } catch {
    return null;
  }
};

export const fetchHeroUrlRest = async (signal?: AbortSignal): Promise<string | null> => {
  if (!hasSupabaseKeys) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/settings?select=value&id=eq.hero_image_url`,
      { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }, signal }
    );
    if (!response.ok) {
      return null;
    }
    const rows = (await response.json()) as { value?: unknown }[];
    const value = rows[0]?.value;
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
};

export const readCachedProducts = (): Product[] | null => readCache<Product[]>(PRODUCTS_CACHE_KEY);
export const writeCachedProducts = (products: Product[]): void => writeCache(PRODUCTS_CACHE_KEY, products);

export const readCachedHeroUrl = (): string | null => readCache<string>(HERO_CACHE_KEY);
export const writeCachedHeroUrl = (url: string): void => writeCache(HERO_CACHE_KEY, url);
