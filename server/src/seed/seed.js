import dotenv from 'dotenv'
import { connectDB, disconnectDB } from '../config/db.js'
import Test from '../models/Test.js'
import Package from '../models/Package.js'

dotenv.config()
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const groups = {
  Hematology: ['Complete Blood Count (CBC)','Hemoglobin (Hb)','ESR','Platelet Count','Total Leukocyte Count (TLC)','Differential Leukocyte Count (DLC)','Peripheral Blood Smear','RBC Count','Hematocrit','MCV','MCH','MCHC','RDW','Absolute Eosinophil Count (AEC)','Reticulocyte Count','Blood Group & Rh Typing'],
  Diabetes: ['Fasting Blood Sugar','PP Blood Sugar','Random Blood Sugar','HbA1c','Fasting Insulin'],
  Liver: ['SGPT / ALT','SGOT / AST','Total Bilirubin','Direct Bilirubin','Indirect Bilirubin','Alkaline Phosphatase','Total Protein','Albumin','Globulin','Gamma GT','Liver Function Test (LFT)'],
  Kidney: ['Serum Creatinine','Blood Urea','Uric Acid','Sodium','Potassium','Calcium','Kidney Function Test (KFT)'],
  Lipid: ['Total Cholesterol','HDL Cholesterol','LDL Cholesterol','VLDL Cholesterol','Triglycerides','Lipid Profile'],
  Thyroid: ['TSH','T3','T4','Free T3','Free T4','Thyroid Profile'],
  Vitamins: ['Vitamin B12','Vitamin D','Folic Acid'],
  Iron: ['Serum Iron','Ferritin','TIBC','Iron Profile'],
  Infection: ['Widal','CRP','Dengue NS1','Dengue IgG','Dengue IgM','Malaria Antigen','Malaria Parasite','Typhoid Test'],
  Urine: ['Urine Routine & Microscopy','Urine Culture','Urine Pregnancy Test','Microalbumin'],
  'Other Common Tests': ['Amylase','Lipase','PSA','CA-125','CA-19-9','CEA','HBsAg','HIV 1 & 2','Anti-HCV','VDRL']
}
const priceOverrides = {
  'Complete Blood Count (CBC)': [350,29,249], Widal:[250,40,149], 'SGPT / ALT':[200,25,149], HbA1c:[500,30,349], TSH:[400,25,299], 'Vitamin D':[1200,42,699], 'Vitamin B12':[900,39,549], 'Liver Function Test (LFT)':[800,38,499], 'Kidney Function Test (KFT)':[800,38,499], 'Lipid Profile':[700,36,449]
}
const fastingNames = new Set(['Fasting Blood Sugar','PP Blood Sugar','Fasting Insulin','Lipid Profile','Total Cholesterol','HDL Cholesterol','LDL Cholesterol','VLDL Cholesterol','Triglycerides','Serum Iron','Iron Profile'])
function makeTest(name, category, index) {
  const [mrp, discountPercent, sellingPrice] = priceOverrides[name] || [180 + (index % 7) * 70, 20 + (index % 4) * 5, Math.round((180 + (index % 7) * 70) * (1 - (20 + (index % 4) * 5) / 100))]
  const fastingRequired = fastingNames.has(name)
  return { name, slug:slugify(name), category, shortDescription:`A ${category.toLowerCase()} laboratory measurement commonly ordered by clinicians.`, sampleType: category === 'Urine' ? 'Urine' : 'Blood sample', preparation:fastingRequired ? 'Fasting may be required; follow collection instructions.' : 'No special preparation unless advised by your clinician.', fastingRequired, reportTAT:category === 'Infection' ? '24–48 hours' : 'Within 24 hours', mrp, discountPercent, sellingPrice, partnerLabCost:Math.round(sellingPrice * .48), collectionCost:0, status:'active' }
}
const packageDefinitions = [
  ['Basic Health Package','CBC, fasting sugar, liver, kidney, lipid and thyroid checks.',['Complete Blood Count (CBC)','Fasting Blood Sugar','SGPT / ALT','SGOT / AST','Serum Creatinine','Lipid Profile','TSH'],1800,39,1099],
  ['Diabetes Care Package','Common monitoring tests grouped for doctor-advised diabetes care.',['Fasting Blood Sugar','HbA1c','Lipid Profile','Serum Creatinine','Urine Routine & Microscopy'],1500,40,899],
  ['Liver Care Package','A practical group of commonly ordered liver-related checks.',['Liver Function Test (LFT)','Complete Blood Count (CBC)','Total Bilirubin','SGPT / ALT','SGOT / AST'],1300,39,799],
  ['Kidney Care Package','Common kidney and urine checks in one package.',['Kidney Function Test (KFT)','Complete Blood Count (CBC)','Urine Routine & Microscopy','Uric Acid','Sodium','Potassium'],1400,39,849],
  ['Thyroid Package','T3, T4 and TSH testing in one package.',['T3','T4','TSH'],700,36,449],
  ['Full Body Basic Package','A broad collection of routine health checks.',['Complete Blood Count (CBC)','HbA1c','Fasting Blood Sugar','Liver Function Test (LFT)','Kidney Function Test (KFT)','Lipid Profile','TSH','Urine Routine & Microscopy'],2500,40,1499],
  ["Women's Health Package",'A general package of common health screening measurements.',['Complete Blood Count (CBC)','Thyroid Profile','Vitamin D','Vitamin B12','Serum Iron','Urine Routine & Microscopy'],2800,39,1699],
  ["Men's Health Package",'A general package of common health screening measurements.',['Complete Blood Count (CBC)','Lipid Profile','Liver Function Test (LFT)','Kidney Function Test (KFT)','PSA'],2600,38,1599]
]
async function seed() {
  await connectDB()
  const testData = Object.entries(groups).flatMap(([category,names]) => names.map((name,index) => makeTest(name,category,index)))
  await Package.deleteMany({})
  await Test.deleteMany({})
  const insertedTests = await Test.insertMany(testData)
  const ids = new Map(insertedTests.map(test => [test.name, test._id]))
  const packageData = packageDefinitions.map(([name,description,names,mrp,discountPercent,sellingPrice]) => ({ name, slug:slugify(name), description, includedTests:names.map(testName => ids.get(testName)), mrp, discountPercent, sellingPrice, preparation:'Follow any preparation instructions shared before collection.', reportTAT:'24–48 hours', status:'active' }))
  const insertedPackages = await Package.insertMany(packageData)
  console.log(`Seeded ${insertedTests.length} tests and ${insertedPackages.length} packages.`)
  await disconnectDB()
}
seed().catch(async error => { console.error(`Seed failed: ${error.message}`); await disconnectDB(); process.exit(1) })
