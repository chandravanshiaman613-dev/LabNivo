import Test from '../models/Test.js'

export async function getTests(request, response, next) {
  try {
    const filter = {}
    if (request.query.category) filter.category = new RegExp(`^${escapeRegex(request.query.category)}$`, 'i')
    filter.status = 'active'
    if (request.query.search) {
      const search = new RegExp(escapeRegex(request.query.search), 'i')
      filter.$or = [{ name: search }, { category: search }, { shortDescription: search }]
    }
    const data = await Test.find(filter).sort({ category: 1, name: 1 })
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
