import api from './api'
export const validateCoupon=async(payload)=> (await api.post('/coupons/validate',payload)).data.data
export const getCoupons=async()=> (await api.get('/admin/coupons')).data.data
export const saveCoupon=async(item)=> (item._id ? await api.put(`/admin/coupons/${item._id}`,item) : await api.post('/admin/coupons',item)).data.data
export const setCouponActive=async(id,active)=> (await api.put(`/admin/coupons/${id}/status`,{active})).data.data
