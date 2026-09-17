import api from './api'

export const validateCoupon = async (payload) => {
  const response = await api.post('/coupons/validate', payload)
  return response.data.data
}

export const getCoupons = async () => {
  const response = await api.get('/admin/coupons')
  if (!Array.isArray(response.data?.data)) {
    throw new Error('Unexpected coupon-list response from the API.')
  }
  return response.data.data
}

export const saveCoupon = async (item) => {
  const response = item._id
    ? await api.put(`/admin/coupons/${item._id}`, item)
    : await api.post('/admin/coupons', item)

  return response.data.data
}

export const setCouponActive = async (id, active) => {
  const response = await api.put(`/admin/coupons/${id}/status`, { active })
  return response.data.data
}
