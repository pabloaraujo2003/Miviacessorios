const rawWhatsappNumber = import.meta.env.VITE_STORE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '';

export const STORE_WHATSAPP_NUMBER = rawWhatsappNumber;

export const hasStoreWhatsappNumber = STORE_WHATSAPP_NUMBER.length > 0;

if (import.meta.env.DEV && !hasStoreWhatsappNumber) {
  console.warn(
    '[storeContact] VITE_STORE_WHATSAPP_NUMBER não está configurada — o botão "Finalizar Compra" ficará indisponível.'
  );
}
