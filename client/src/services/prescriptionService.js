import api from './api'

export async function getAdminPrescriptionLeads() {
  const { data } = await api.get('/admin/prescriptions')
  return data.data
}

export async function getAdminPrescriptionLead(leadId) {
  const { data } = await api.get(`/admin/prescriptions/${leadId}`)
  return data.data
}

export async function updatePrescriptionStatus(leadId, status) {
  const { data } = await api.put(`/admin/prescriptions/${leadId}/status`, { status })
  return data.data
}
