import Package from '../models/Package.js'
const populatedTests = 'name slug category shortDescription sampleType preparation fastingRequired reportTAT mrp discountPercent sellingPrice status'

export async function getPackages(_request, response, next) {
  try { const data = await Package.find({ status: 'active' }).populate('includedTests', populatedTests).sort({ name: 1 }); response.json({ success: true, data }) } catch (error) { next(error) }
}
export async function getPackageBySlug(request, response, next) {
  try { const data = await Package.findOne({ slug: request.params.slug, status: 'active' }).populate('includedTests', populatedTests); if (!data) return response.status(404).json({ success: false, message: 'Package not found' }); response.json({ success: true, data }) } catch (error) { next(error) }
}
