import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const secret = () => process.env.JWT_SECRET || 'lab-nivo-development-secret-change-me'
const configuredAdmin = () => ({ email: String(process.env.ADMIN_EMAIL || '').trim().toLowerCase(), password: String(process.env.ADMIN_PASSWORD || '') })

export async function adminLogin(request, response) {
  const { email, password } = request.body || {}
  const admin = configuredAdmin()
  if (!admin.email || !admin.password) return response.status(503).json({ success: false, message: 'Admin login has not been configured.' })
  if (String(email || '').trim().toLowerCase() !== admin.email) return response.status(401).json({ success: false, message: 'Invalid admin credentials.' })
  const valid = admin.password.startsWith('$2') ? await bcrypt.compare(String(password || ''), admin.password) : String(password || '') === admin.password
  if (!valid) return response.status(401).json({ success: false, message: 'Invalid admin credentials.' })
  const token = jwt.sign({ role: 'admin', email: admin.email }, secret(), { expiresIn: '8h' })
  response.json({ success: true, data: { token } })
}

export function requireAdmin(request, response, next) {
  try {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    const payload = jwt.verify(token || '', secret())
    if (payload.role !== 'admin') throw new Error('unauthorized')
    request.admin = payload
    next()
  } catch { response.status(401).json({ success: false, message: 'Admin authentication is required.' }) }
}
