import api from './api'
export async function getTests(params = {}) { const { data } = await api.get('/tests', { params }); return data.data }
export async function getTestBySlug(slug) { const { data } = await api.get(`/tests/${slug}`); return data.data }
