export async function lookupPincode(pincode) { if (!/^\d{6}$/.test(pincode)) return null; const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`); const [data] = await response.json(); const office = data?.PostOffice?.[0]; return office ? { city: office.District, district: office.District, state: office.State } : null }

// Nominatim is used without an API key. Coordinates are used only for this
// one-time lookup and are never persisted or sent to the LAB NIVO API.
export async function reverseGeocodeLocation(latitude, longitude) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`)
  if (!response.ok) throw new Error('Reverse geocoding failed.')
  const result = await response.json()
  const address = result?.address || {}
  return {
    address: address.road || '',
    city: address.city || address.town || address.village || address.county || '',
    district: address.county || address.state_district || '',
    state: address.state || '',
    pincode: address.postcode || '',
    landmark: address.neighbourhood || address.suburb || ''
  }
}
