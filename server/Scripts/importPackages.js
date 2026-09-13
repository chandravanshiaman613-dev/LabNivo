import 'dotenv/config'
import dns from 'dns'
import mongoose from 'mongoose'
import Package from '../models/Package.js'
import Test from '../models/Test.js'
import packages from './LabNivo_20_Packages_Import.json' with { type: 'json' }

dns.setServers(['8.8.8.8', '1.1.1.1'])

const aliases = {
  'Blood Glucose Fasting': 'Fasting Blood Sugar',
  'Blood Glucose PP': 'Post Prandial Blood Sugar',
  'Thyroid Profile Total (T3, T4, TSH)': 'Thyroid Profile (T3 T4 TSH)',
  'Thyroid Profile Free (FT3, FT4, TSH)': 'Thyroid Profile Extended',
  'Kidney Function Test (KFT/RFT)': 'Kidney Function Test (KFT)',
  'Vitamin D Total-25 Hydroxy': 'Vitamin D Total',
  'Iron Profile': 'Iron Studies',
  'SGPT/ALT': 'SGPT / ALT',
  'SGOT/AST': 'SGOT / AST',
  'Dengue NS1': 'Dengue NS1 Antigen',
  'Dengue IgG/IgM': 'Dengue IgG IgM',
  'Malaria Parasite Test': 'Malaria Antigen',
  'HBsAg': 'Hepatitis B Surface Antigen (HBsAg)',
  'HIV 1 & 2': 'HIV 1 & 2 Antibody/Antigen',
  'Testosterone Total': 'Total Testosterone'
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured in server/.env')
  }

  await mongoose.connect(process.env.MONGO_URI)

  console.log(
    `MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`
  )

  const tests = await Test.find({})
    .select('_id name slug')
    .lean()

  const testMap = new Map()

  for (const test of tests) {
    testMap.set(
      test.name.trim().toLowerCase(),
      test._id
    )

    if (test.slug) {
      testMap.set(
        test.slug.trim().toLowerCase(),
        test._id
      )
    }
  }

  const existingPackages = await Package.find({})
    .select('name slug')
    .lean()

  const existingNames = new Set(
    existingPackages.map(p => p.name.trim().toLowerCase())
  )

  const existingSlugs = new Set(
    existingPackages.map(p => p.slug.trim().toLowerCase())
  )

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

    for (const originalName of item.includedTestNames) {

      const actualName =
        aliases[originalName] || originalName

      const testId =
        testMap.get(actualName.trim().toLowerCase())

      if (!testId) {
        missingTests.push(actualName)
      } else {
        includedTests.push(testId)
      }
    }

    if (missingTests.length > 0) {
      console.log(`SKIPPED: ${item.name}`)
      console.log(
        `Missing tests: ${missingTests.join(', ')}`
      )
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
  console.log(`Input packages: ${packages.length}`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Skipped/Existing: ${skipped}`)
  console.log(
    `Total packages in DB: ${await Package.countDocuments()}`
  )

  await mongoose.disconnect()
}

run().catch(async error => {
  console.error('IMPORT FAILED:', error.message)

  try {
    await mongoose.disconnect()
  } catch {}

  process.exit(1)
})