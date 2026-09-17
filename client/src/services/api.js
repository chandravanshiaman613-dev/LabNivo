import axios from 'axios'

const LOCAL_API_URL = 'http://localhost:5000/api'
const PRODUCTION_API_URL = 'https://labnivo.onrender.com/api'
const hostname = typeof window === 'undefined' ? '' : window.location.hostname
const defaultBaseURL = hostname === 'labnivo.pages.dev'
  ? PRODUCTION_API_URL
  : LOCAL_API_URL

// Cloudflare supplies VITE_API_URL for the deployed site. In local development
// the deliberate fallback is always HTTP: local Express does not serve HTTPS.
const configuredBaseURL = import.meta.env.VITE_API_URL?.trim()
export const API_BASE_URL = configuredBaseURL || defaultBaseURL

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 })
api.interceptors.request.use(config => { if (config.url?.startsWith('/admin/')) { const token = localStorage.getItem('labNivoAdminToken'); if (token) config.headers.Authorization = `Bearer ${token}` } return config })
export default api
