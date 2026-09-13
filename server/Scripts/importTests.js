import 'dotenv/config'
import dns from 'dns'
import mongoose from 'mongoose'
import Test from '../src/models/Test.js'

dns.setServers(['8.8.8.8', '1.1.1.1'])

const tests = [
  // The script reads the generated JSON file below.
]

const run = async () => {
  try {
    const { default: data } = await import('./LabNivo_Customer_Friendly_80_HighDemand_Tests.json', { with: { type: 'json' } })
    const existing = await Test.find({
      name: { $in: data.map(t => t.name) }
    }).select('name')

    const existingNames = new Set(existing.map(t => t.name))
    const newTests = data.filter(t => !existingNames.has(t.name))

    if (newTests.length) {
      await Test.insertMany(newTests, { ordered: false })
    }

    console.log(`Total in JSON: ${data.length}`)
    console.log(`Already existed: ${existingNames.size}`)
    console.log(`Inserted: ${newTests.length}`)
    console.log('LAB NIVO test import complete.')
  } catch (err) {
    console.error('Test import failed:', err.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

const mongoUri = process.env.MONGO_URI
if (!mongoUri) {
  console.error('MONGO_URI missing in server/.env')
  process.exit(1)
}

await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 })
console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
await run()
