import api, { API_BASE_URL } from './api'
export const bannerImageUrl = url => url ? (url.startsWith('http') ? url : `${API_BASE_URL.replace('/api', '')}${url}`) : ''
let bannersRequest
export function getBanners() {
  if (!bannersRequest) bannersRequest = api.get('/banners').then(({ data }) => data.data).finally(() => { bannersRequest = null })
  return bannersRequest
}
export async function getAdminBanners() { const { data } = await api.get('/admin/banners'); return data.data }
export async function saveBanner(banner, image) { const form = new FormData(); ['type', 'label', 'title', 'description', 'buttonText', 'buttonLink', 'active', 'displayOrder'].forEach(key => form.append(key, banner[key] ?? '')); if (image) form.append('image', image); const { data } = banner._id ? await api.put(`/admin/banners/${banner._id}`, form) : await api.post('/admin/banners', form); return data.data }
export async function setBannerActive(id, active) { const { data } = await api.put(`/admin/banners/${id}/status`, { active }); return data.data }
export async function deleteBanner(id) { await api.delete(`/admin/banners/${id}`) }
