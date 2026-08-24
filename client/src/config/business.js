export const BUSINESS_WHATSAPP_NUMBER = '7509424230'
export const whatsappLink = (message, number = BUSINESS_WHATSAPP_NUMBER) => `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
