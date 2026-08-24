export const SUPPORTED_CITIES = ['Indore', 'Bhopal']
const storageKey = 'labNivoServiceCity'

export const normalizeCity = city => String(city || '').trim().toLowerCase()
export const isServiceableCity = city => SUPPORTED_CITIES.some(item => normalizeCity(item) === normalizeCity(city))
export const getSelectedCity = () => localStorage.getItem(storageKey) || ''
export const setSelectedCity = city => {
  if (isServiceableCity(city)) localStorage.setItem(storageKey, SUPPORTED_CITIES.find(item => normalizeCity(item) === normalizeCity(city)))
}
export const serviceabilityMessage = 'Online home sample collection is currently available only in Indore and Bhopal.'
