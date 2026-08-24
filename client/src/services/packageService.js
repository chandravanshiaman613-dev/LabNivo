import api from './api'
export async function getPackages() { const { data } = await api.get('/packages'); return data.data }
export async function getPackageBySlug(slug) { const { data } = await api.get(`/packages/${slug}`); return data.data }
