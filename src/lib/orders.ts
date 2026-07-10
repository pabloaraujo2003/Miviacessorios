import { hasSupabaseKeys, supabaseAnonKey, supabaseUrl } from './env';

export interface OrderItemPayload {
  name: string;
  quantity: number;
  price: string;
}

export interface OrderPayload {
  code: string;
  customerName: string;
  items: OrderItemPayload[];
  total: string;
}

interface OrderRecord {
  code?: unknown;
  customer_name?: unknown;
  items?: unknown;
  total?: unknown;
  created_at?: unknown;
}

export interface Order {
  code: string;
  customerName: string;
  items: OrderItemPayload[];
  total: string;
  createdAt: string;
}

/**
 * Gera um código curto e legível para o pedido (ex: MV-A1B2), usado tanto na
 * mensagem do WhatsApp quanto no registro salvo — permite a dona cruzar os dois.
 */
export const generateOrderCode = (): string => {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MV-${random}`;
};

/**
 * Registra o pedido no Supabase antes de abrir o WhatsApp. Melhor esforço:
 * se falhar (offline, RLS, etc.), não deve bloquear o checkout via WhatsApp.
 */
export const saveOrder = async (order: OrderPayload): Promise<boolean> => {
  if (!hasSupabaseKeys) {
    return false;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        code: order.code,
        customer_name: order.customerName,
        items: order.items,
        total: order.total,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const mapOrderRecord = (record: unknown): Order | null => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const orderRecord = record as OrderRecord;
  const code = typeof orderRecord.code === 'string' ? orderRecord.code : '';
  const customerName = typeof orderRecord.customer_name === 'string' ? orderRecord.customer_name : '';
  const total = typeof orderRecord.total === 'string' ? orderRecord.total : '';
  const createdAt = typeof orderRecord.created_at === 'string' ? orderRecord.created_at : '';
  const items = Array.isArray(orderRecord.items)
    ? orderRecord.items.filter(
        (item): item is OrderItemPayload =>
          !!item && typeof item === 'object' && typeof (item as OrderItemPayload).name === 'string'
      )
    : [];

  if (!code || !customerName) {
    return null;
  }

  return { code, customerName, items, total, createdAt };
};
