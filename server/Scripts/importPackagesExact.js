import 'dotenv/config'
import dns from 'dns'
import mongoose from 'mongoose'
import Package from '../src/models/Package.js'
import Test from '../src/models/Test.js'
import packages from './LabNivo_20_Packages_Import_ExactNames.json' with { type: 'json' }

dns.setServers(['8.8.8.8', '1.1.1.1'])

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured in server/.env')
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)

  const tests = await Test.find({}).select('_id name slug').lean()
  const testMap = new Map()

  for (const test of tests) {
    testMap.set(test.name.trim().toLowerCase(), test._id)
    if (test.slug) testMap.set(test.slug.trim().toLowerCase(), test._id)
  }

  const existing = await Package.find({}).select('name slug').lean()
  const existingNames = new Set(existing.map(p => p.name.trim().toLowerCase()))
  const existingSlugs = new Set(existing.map(p => p.slug.trim().toLowerCase()))

  let inserted = 0
  let skipped = 0

  for (const item of packages) {
    if (
      existingNames.has(item.name.trim().toLowerCase()) ||
      existingSlugs.has(item.slug.trim().toLowerCase())
    ) {
      console.log(`ALREADY EXISTS: ${item.name}`)
      skipped++
      continue
    }

    const includedTests = []
    const missingTests = []

    for (const testName of item.includedTestNames) {
      const id = testMap.get(testName.trim().toLowerCase())

      if (!id) missingTests.push(testName)
      else includedTests.push(id)
    }

    if (missingTests.length) {
      console.log(`SKIPPED: ${item.name}`)
      console.log(`Missing tests: ${missingTests.join(', ')}`)
      skipped++
      continue
    }

    await Package.create({
      name: item.name,
      slug: item.slug,
      description: item.description,
      includedTests,
      mrp: item.mrp,
      discountPercent: item.discountPercent,
      sellingPrice: item.sellingPrice,
      preparation: item.preparation,
      reportTAT: item.reportTAT,
      imageUrl: item.imageUrl || '',
      status: item.status || 'active'
    })

    console.log(`INSERTED: ${item.name}`)
    inserted++
  }

  console.log('')
  console.log('--- PACKAGE IMPORT SUMMARY ---')
  console.log(`Input: ${packages.length}`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Skipped/Existing: ${skipped}`)
  console.log(`Total packages in DB: ${await Package.countDocuments()}`)

  await mongoose.disconnect()
}

run().catch(async error => {
  console.error('IMPORT FAILED:', error.message)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})
