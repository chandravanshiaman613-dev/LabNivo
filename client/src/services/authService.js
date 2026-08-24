import api from './api'
export const sendOtp = mobile => api.post('/auth/send-otp', { mobile })
export async function verifyOtp(mobile, otp) { const { data } = await api.post('/auth/verify-otp', { mobile, otp }); localStorage.setItem('labnivo_customer_token', data.data.token) }
export const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('labnivo_customer_token') || ''}` })
export const signOut = () => localStorage.removeItem('labnivo_customer_token')
