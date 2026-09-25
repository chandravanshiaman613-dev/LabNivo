import Test from '../models/Test.js'

export async function getTests(request, response, next) {
  try {
    const filter = {}
    if (request.query.category) filter.category = new RegExp(`^${escapeRegex(request.query.category)}$`, 'i')
    filter.status = 'active'
    const highlightOnly = request.query.highlight === 'popular'
    if (highlightOnly) filter.$or = [{ name: /cbc|hba1c|thyroid|vitamin d|liver|kidney/i }]
    if (request.query.search) {
      const search = new RegExp(escapeRegex(request.query.search), 'i')
      filter.$and = [...(filter.$or ? [{ $or: filter.$or }] : []), { $or: [{ name: search }, { category: search }, { shortDescription: search }] }]
      delete filter.$or
    }
    const requestedLimit = Number(request.query.limit)
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 0
    const fields = 'name slug category shortDescription sampleType preparation fastingRequired reportTAT imageUrl homeCollection mrp discountPercent sellingPrice status'
    let query = Test.find(filter).sort({ category: 1, name: 1 })
    if (limit) query = query.select(fields)
    if (limit) query = query.limit(limit)
    let data = await query
    if (highlightOnly && !data.length) {
      let fallback = Test.find({ status: 'active' }).select(fields).sort({ category: 1, name: 1 })
      data = await fallback.limit(limit || 4)
    }
    response.json({ success: true, data })
  } catch (error) { next(error) }
}

export async function getTestBySlug(request, response, next) {
  try {
    const data = await Test.findOne({ slug: request.params.slug, status: 'active' })
    if (!data) return response.status(404).json({ success: false, message: 'Test not found' })
    response.json({ success: true, data })
  } catch (error) { next(error) }
}

function escapeRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
