import api from './api'
export async function adminLogin(email,password){const {data}=await api.post('/auth/admin/login',{email,password});localStorage.setItem('labNivoAdminToken',data.data.token);return data.data}
export function isAdminLoggedIn(){return Boolean(localStorage.getItem('labNivoAdminToken'))}
export function adminLogout(){localStorage.removeItem('labNivoAdminToken')}
