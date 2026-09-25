import api from './api'
const inFlightRequests = new Map()
export function getPackages(params = {}) {
  const key = JSON.stringify(params)
  if (inFlightRequests.has(key)) return inFlightRequests.get(key)
  const request = api.get('/packages', { params }).then(({ data }) => data.data).finally(() => inFlightRequests.delete(key))
  inFlightRequests.set(key, request)
  return request
}
export async function getPackageBySlug(slug) { const { data } = await api.get(`/packages/${slug}`); return data.data }
