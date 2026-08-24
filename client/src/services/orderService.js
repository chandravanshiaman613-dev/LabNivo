import api from './api'
import { authHeaders } from './authService'
export async function getMyOrders() { const { data } = await api.get('/my-orders', { headers: authHeaders() }); return data.data }
export async function getMyOrder(id) { const { data } = await api.get(`/my-orders/${id}`, { headers: authHeaders() }); return data.data }
