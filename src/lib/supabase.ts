import { createClient } from '@supabase/supabase-js';
import type { Product } from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const fallbackSupabaseUrl = 'https://placeholder.supabase.co';
const fallbackSupabaseAnonKey = 'placeholder-anon-key';

// If credentials are not present, this client will fail on requests. 
export const hasSupabaseKeys = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = createClient(
  hasSupabaseKeys ? supabaseUrl : fallbackSupabaseUrl,
  hasSupabaseKeys ? supabaseAnonKey : fallbackSupabaseAnonKey,
);

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
  collectionId?: unknown;
  features?: unknown;
  isBundle?: unknown;
  bundledProducts?: unknown;
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
    collectionId: toString(productRecord.collectionId) || undefined,
    features: toStringArray(productRecord.features),
    isBundle: Boolean(productRecord.isBundle),
    bundledProducts: toBundledProducts(productRecord.bundledProducts),
  };
};
