import api from './api'
export async function createBooking(payload) { const { data } = await api.post('/bookings', payload); return data.data }
export async function getBookingById(bookingId, mobile) { const { data } = await api.get(`/bookings/${bookingId}`, { params: { mobile } }); return data.data }
export async function getAdminBookings() { const { data } = await api.get('/admin/bookings'); return data.data }
export async function getAdminBooking(bookingId) { const { data } = await api.get(`/admin/bookings/${bookingId}`); return data.data }
export async function updateBookingStatus(bookingId, status) { const { data } = await api.put(`/admin/bookings/${bookingId}/status`, { status }); return data.data }
