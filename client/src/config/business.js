// Keep customer-facing contact details in one place.  Components must import
// these values instead of embedding phone numbers or email addresses.
export const BUSINESS_WHATSAPP_NUMBER = '917987659405'
export const BUSINESS_PHONE_NUMBER = '+917987659405'
export const BUSINESS_EMAIL = 'labnivo.in@gmail.com'
export const whatsappLink = (message, number = BUSINESS_WHATSAPP_NUMBER) => `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
