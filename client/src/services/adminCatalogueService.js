import api from './api'
export const getAdminTests=async()=> (await api.get('/admin/tests')).data.data
export const saveAdminTest=async(item)=> (item._id ? await api.put(`/admin/tests/${item._id}`,item) : await api.post('/admin/tests',item)).data.data
export const setAdminTestActive=async(id,active)=> (await api.put(`/admin/tests/${id}/status`,{active})).data.data
export const getAdminPackages=async()=> (await api.get('/admin/packages')).data.data
export const saveAdminPackage=async(item)=> (item._id ? await api.put(`/admin/packages/${item._id}`,item) : await api.post('/admin/packages',item)).data.data
export const setAdminPackageActive=async(id,active)=> (await api.put(`/admin/packages/${id}/status`,{active})).data.data
