import 'dotenv/config'
import dns from 'dns'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

import Test from '../src/models/Test.js'
import Package from '../src/models/Package.js'

dns.setServers(['8.8.8.8', '1.1.1.1'])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outputPath = path.resolve(
  __dirname,
  '../../client/public/sitemap.xml'
)

const BASE_URL = 'https://labnivo.in'

async function generateSitemap() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        'MONGO_URI is not configured in server/.env'
      )
    }

    await mongoose.connect(
      process.env.MONGO_URI
    )

    console.log('MongoDB connected')

    const tests = await Test.find(
      { status: 'active' },
      { slug: 1, updatedAt: 1 }
    ).lean()

    const packages = await Package.find(
      { status: 'active' },
      { slug: 1, updatedAt: 1 }
    ).lean()

    const staticUrls = [
      {
        loc: `${BASE_URL}/`,
        priority: '1.0'
      },
      {
        loc: `${BASE_URL}/tests`,
        priority: '0.9'
      },
      {
        loc: `${BASE_URL}/packages`,
        priority: '0.9'
      }
    ]

    const testUrls = tests.map(test => ({
      loc: `${BASE_URL}/tests/${test.slug}`,
      lastmod: test.updatedAt,
      priority: '0.8'
    }))

    const packageUrls = packages.map(pack => ({
      loc: `${BASE_URL}/packages/${pack.slug}`,
      lastmod: pack.updatedAt,
      priority: '0.8'
    }))

    const urls = [
      ...staticUrls,
      ...testUrls,
      ...packageUrls
    ]

    const escapeXml = value =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

    const xmlUrls = urls
      .map(url => {
        const lastmod = url.lastmod
          ? new Date(url.lastmod)
              .toISOString()
              .split('T')[0]
          : ''

        return `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${
      lastmod
        ? `<lastmod>${lastmod}</lastmod>`
        : ''
    }
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`
      })
      .join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>
`

    fs.writeFileSync(
      outputPath,
      sitemap,
      'utf8'
    )

    console.log(
      'Sitemap generated successfully'
    )

    console.log(
      `Active tests: ${tests.length}`
    )

    console.log(
      `Active packages: ${packages.length}`
    )

    console.log(
      `Total URLs: ${urls.length}`
    )

    console.log(
      `File: ${outputPath}`
    )
  } catch (error) {
    console.error(
      'Sitemap generation failed:',
      error.message
    )

    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

generateSitemap()