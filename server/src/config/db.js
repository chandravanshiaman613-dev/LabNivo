import dns from 'dns'
import mongoose from 'mongoose'

export async function connectDB() {
  dns.setServers(['8.8.8.8', '1.1.1.1'])

  const mongoUri = process.env.MONGO_URI
  if (!mongoUri) throw new Error('MONGO_URI is not configured. Add it to server/.env.')
  await mongoose.connect(mongoUri)
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
}

export async function disconnectDB() {
  await mongoose.disconnect()
}