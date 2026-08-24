import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 10000 })
api.interceptors.request.use(config => { if (config.url?.startsWith('/admin/')) { const token = localStorage.getItem('labNivoAdminToken'); if (token) config.headers.Authorization = `Bearer ${token}` } return config })
export default api
