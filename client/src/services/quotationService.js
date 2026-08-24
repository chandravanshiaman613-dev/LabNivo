import api from './api'
import { authHeaders } from './authService'
export async function getQuotation(id) { const { data } = await api.get(`/quotations/${id}`, { headers: authHeaders() }); return data.data }
export async function approveQuotation(id) { const { data } = await api.put(`/quotations/${id}/approve`, {}, { headers: authHeaders() }); return data.data }
export async function getLeadQuotations(id) { const { data } = await api.get(`/admin/prescriptions/${id}/quotations`); return data.data }
export async function createQuotation(id, tests) { const { data } = await api.post(`/admin/prescriptions/${id}/quotations`, { tests }); return data.data }
export async function convertQuotation(id) { const { data } = await api.post(`/admin/quotations/${id}/convert`); return data.data }
