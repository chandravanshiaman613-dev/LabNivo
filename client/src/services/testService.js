import api from './api'
const inFlightRequests = new Map()
export function getTests(params = {}) {
  const key = JSON.stringify(params)
  if (inFlightRequests.has(key)) return inFlightRequests.get(key)
  const request = api.get('/tests', { params }).then(({ data }) => data.data).finally(() => inFlightRequests.delete(key))
  inFlightRequests.set(key, request)
  return request
}
export async function getTestBySlug(slug) { const { data } = await api.get(`/tests/${slug}`); return data.data }
