import Package from '../models/Package.js'
import Test from '../models/Test.js'
const populatedTests = 'name slug category shortDescription sampleType preparation fastingRequired reportTAT mrp discountPercent sellingPrice status'

export async function getPackages(request, response, next) {
  try {
    const filter = { status: 'active' }
    if (request.query.search) {
      const search = new RegExp(escapeRegex(request.query.search), 'i')
      const matchingTests = await Test.find({ status: 'active', name: search }).distinct('_id')
      filter.$or = [{ name: search }, { description: search }, { includedTests: { $in: matchingTests } }]
    }
    const requestedLimit = Number(request.query.limit)
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 0
    let query = Package.find(filter).sort({ featured: -1, displayOrder: 1, name: 1 })
    if (limit) query = query.select('name slug description includedTests mrp discountPercent sellingPrice imageUrl featured displayOrder reportTAT').populate('includedTests', 'name')
    else query = query.populate('includedTests', populatedTests)
    if (limit) query = query.limit(limit)
    const data = await query
    response.json({ success: true, data })
  } catch (error) { next(error) }
}
export async function getPackageBySlug(request, response, next) {
  try { const data = await Package.findOne({ slug: request.params.slug, status: 'active' }).populate('includedTests', populatedTests); if (!data) return response.status(404).json({ success: false, message: 'Package not found' }); response.json({ success: true, data }) } catch (error) { next(error) }
}

function escapeRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
