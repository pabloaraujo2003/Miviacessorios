const rawWhatsappNumber =
  import.meta.env.VITE_STORE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '5521971497835';

export const STORE_WHATSAPP_NUMBER = rawWhatsappNumber;

export const hasStoreWhatsappNumber = STORE_WHATSAPP_NUMBER.length > 0;
