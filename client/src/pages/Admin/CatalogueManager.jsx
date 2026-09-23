import { useEffect, useState } from 'react'
import { money } from '../../utils/catalogue'
import { getAdminPackages, getAdminTests, saveAdminPackage, saveAdminTest, setAdminPackageActive, setAdminTestActive } from '../../services/adminCatalogueService'
import { getCoupons, saveCoupon, setCouponActive } from '../../services/couponService'
const err=e=>e?.response?.data?.message||'Unable to save changes.'
const testBlank={name:'',category:'',mrp:'',sellingPrice:'',reportTAT:'',sampleType:'',description:'',preparation:'',imageUrl:'',homeCollection:true,active:true}
const packageBlank={name:'',description:'',includedTests:[],mrp:'',sellingPrice:'',imageUrl:'',active:true}
const couponBlank={code:'',discountType:'PERCENTAGE',discountValue:'',customerEligibility:'ALL_CUSTOMERS',minimumOrder:0,maximumDiscount:0,validFrom:new Date().toISOString().slice(0,10),validUntil:'',usageLimit:0,showToCustomers:false,active:true}
const discount=x=>Number(x.mrp)>0&&Number(x.sellingPrice)>=0?(((Number(x.mrp)-Number(x.sellingPrice))/Number(x.mrp))*100):0
const testId = test => typeof test === 'string' ? test : test?._id
function IncludedTestsSelector({ tests, value, onChange }) {
  const [query, setQuery] = useState('')
  const selectedIds = (value || []).map(testId).filter(Boolean)
  const selected = new Set(selectedIds)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredTests = tests.filter(test => [test.name, test.category, test.sampleType, test.code].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery))
  const selectedTests = tests.filter(test => selected.has(test._id))
  const update = ids => onChange([...ids])
  const toggle = id => update(selected.has(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])
  const selectAll = () => update([...new Set([...selectedIds, ...filteredTests.map(test => test._id)])])
  return <section className="included-tests-selector" aria-label="Included Tests">
    <div className="included-tests-heading"><b>Included Tests ({selectedIds.length} selected)</b><span>Showing {filteredTests.length} of {tests.length} tests</span></div>
    {selectedTests.length > 0 && <div className="selected-test-chips" aria-label="Selected tests">{selectedTests.map(test => <span key={test._id}>{test.name}<button type="button" onClick={() => toggle(test._id)} aria-label={`Remove ${test.name}`}>×</button></span>)}</div>}
    <input className="included-tests-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tests..." aria-label="Search tests" />
    <div className="included-tests-actions"><button type="button" className="button button-secondary" onClick={selectAll} disabled={!filteredTests.length}>Select All{normalizedQuery ? ' Results' : ''}</button><button type="button" className="text-button" onClick={() => update([])} disabled={!selectedIds.length}>Clear All</button></div>
    <div className="included-tests-list">{filteredTests.length ? filteredTests.map(test => <label key={test._id} className="included-test-option"><input type="checkbox" checked={selected.has(test._id)} onChange={() => toggle(test._id)} /><span>{test.name}{test.status === 'inactive' && ' (inactive)'}{test.category && <small>{test.category}</small>}</span></label>) : <p className="included-tests-empty">No tests found</p>}</div>
  </section>
}
function Form({ value, onChange, onSave, onCancel, kind, tests = [] }) {
  const set = (key, val) => onChange({ ...value, [key]: val })
  // Package-only controls must not be evaluated for a coupon form. Rendering
  // them unconditionally made value.includedTests undefined on /admin/coupons.
  const catalogueFields = kind === 'Coupon' ? null : <div className="form-grid">
    <label>{kind} Name<input required value={value.name} onChange={e => set('name', e.target.value)} /></label>
    {kind === 'Test' && <label>Category<input required value={value.category} onChange={e => set('category', e.target.value)} /></label>}
    <label>MRP<input required type="number" min="0" value={value.mrp} onChange={e => set('mrp', e.target.value)} /></label>
    <label>Selling Price<input required type="number" min="0" max={value.mrp || undefined} value={value.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} /></label>
    <label>Discount<input readOnly value={`${discount(value).toFixed(2)}%`} /></label>
    <label className="wide">Image URL (optional)<input type="url" placeholder="https://..." value={value.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} /></label>
    {kind === 'Test' ? <>
      <label>TAT<input required value={value.reportTAT || ''} onChange={e => set('reportTAT', e.target.value)} /></label>
      <label>Sample Type<input required value={value.sampleType || ''} onChange={e => set('sampleType', e.target.value)} /></label>
      <label className="wide">Description<textarea required value={value.description || value.shortDescription || ''} onChange={e => set('description', e.target.value)} /></label>
      <label className="wide">Preparation Instructions<textarea required value={value.preparation || ''} onChange={e => set('preparation', e.target.value)} /></label>
      <label className="wide"><input type="checkbox" checked={value.homeCollection !== false} onChange={e => set('homeCollection', e.target.checked)} /> Home Collection</label>
    </> : <>
      <label className="wide">Description<textarea required value={value.description} onChange={e => set('description', e.target.value)} /></label>
      <div className="wide"><IncludedTestsSelector tests={tests} value={value.includedTests} onChange={includedTests => set('includedTests', includedTests)} /></div>
    </>}
    <label className="wide"><input type="checkbox" checked={value.active !== false} onChange={e => set('active', e.target.checked)} /> Active</label>
  </div>
  const couponFields = <div className="form-grid">
    <label>Code<input required value={value.code} onChange={e => set('code', e.target.value.toUpperCase())} /></label>
    <label>Discount Type<select value={value.discountType} onChange={e => set('discountType', e.target.value)}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option></select></label>
    <label>Discount Value<input required type="number" min="0" value={value.discountValue} onChange={e => set('discountValue', e.target.value)} /></label>
    <label>Customer Eligibility<select value={value.customerEligibility} onChange={e => set('customerEligibility', e.target.value)}><option value="ALL_CUSTOMERS">All Customers</option><option value="NEW_CUSTOMER_ONLY">New Customer Only</option></select></label>
    <label>Minimum Order<input type="number" min="0" value={value.minimumOrder} onChange={e => set('minimumOrder', e.target.value)} /></label>
    <label>Maximum Discount<input type="number" min="0" value={value.maximumDiscount} onChange={e => set('maximumDiscount', e.target.value)} /></label>
    <label>Valid From<input required type="date" value={String(value.validFrom).slice(0, 10)} onChange={e => set('validFrom', e.target.value)} /></label>
    <label>Valid Until<input type="date" value={value.validUntil ? String(value.validUntil).slice(0, 10) : ''} onChange={e => set('validUntil', e.target.value)} /></label>
    <label>Usage Limit (0 = unlimited)<input type="number" min="0" value={value.usageLimit} onChange={e => set('usageLimit', e.target.value)} /></label>
    <label className="wide"><input type="checkbox" checked={value.showToCustomers === true} onChange={e => set('showToCustomers', e.target.checked)} /> Show this active offer to customers at checkout</label>
    <label className="wide"><input type="checkbox" checked={value.active !== false} onChange={e => set('active', e.target.checked)} /> Active</label>
  </div>
  return <form className="booking-form admin-catalogue-form" onSubmit={e => { e.preventDefault(); onSave() }}>
    <div className="section-heading"><h2>{value._id ? 'Edit' : 'Add'} {kind}</h2><button type="button" className="text-button" onClick={onCancel}>Close</button></div>
    {kind === 'Coupon' ? couponFields : catalogueFields}
    <button className="button button-primary">Save {kind}</button>
  </form>
}
export default function CatalogueManager({type,onLogout}){const [items,setItems]=useState([]),[tests,setTests]=useState([]),[edit,setEdit]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);const coupon=type==='Coupon';const load=async()=>{try{if(coupon)setItems(await getCoupons());else if(type==='Test')setItems(await getAdminTests());else{const [p,t]=await Promise.all([getAdminPackages(),getAdminTests()]);setItems(p);setTests(t)}}catch(e){setError(err(e))}finally{setLoading(false)}};useEffect(()=>{load()},[type]);const blank=coupon?couponBlank:type==='Test'?testBlank:packageBlank;const save=async()=>{try{let result;if(coupon)result=await saveCoupon(edit);else if(type==='Test')result=await saveAdminTest(edit);else result=await saveAdminPackage(edit);setItems(xs=>xs.some(x=>x._id===result._id)?xs.map(x=>x._id===result._id?result:x):[result,...xs]);setEdit(null)}catch(e){setError(err(e))}};const toggle=async item=>{try{const result=coupon?await setCouponActive(item._id,!item.active):type==='Test'?await setAdminTestActive(item._id,item.status!=='active'):await setAdminPackageActive(item._id,item.status!=='active');setItems(xs=>xs.map(x=>x._id===result._id?result:x))}catch(e){setError(err(e))}};return <main className="admin-page"><div className="admin-header"><div><span className="overline">LAB NIVO ADMIN</span><h1>{coupon?'Coupons':`Catalogue — ${type}s`}</h1></div><button className="text-button" onClick={onLogout}>Sign out</button></div><div className="section-heading"><div><a href="/admin">Dashboard</a> · <a href="/admin/tests">Tests</a> · <a href="/admin/packages">Packages</a> · <a href="/admin/coupons">Coupons</a></div><button className="button button-primary" onClick={()=>setEdit({...blank})}>+ {coupon?'Create Coupon':`Add ${type}`}</button></div>{error&&<p className="form-error">{error}</p>}{edit&&<Form value={edit} onChange={setEdit} onSave={save} onCancel={()=>setEdit(null)} kind={type} tests={tests}/>} {loading?<p className="catalogue-state">Loading...</p>:<div className="admin-list">{items.map(item=>{const active=coupon?item.active:item.status==='active';return <div className="admin-row" key={item._id}><div><b>{coupon?item.code:item.name}</b><span>{coupon?`${item.discountType==='PERCENTAGE'?`${item.discountValue}%`:money(item.discountValue)} · ${item.customerEligibility==='NEW_CUSTOMER_ONLY'?'New Customer Only':'All Customers'} · ${item.usageCount}/${item.usageLimit||'∞'}`:type==='Package'?`${item.includedTests?.length||0} included tests · MRP ${money(item.mrp)} · ${money(item.sellingPrice)}`:`${item.category} · MRP ${money(item.mrp)} · ${money(item.sellingPrice)} · ${item.reportTAT}`}</span></div><div className="admin-row-meta"><Status active={active}/><button className="text-button" onClick={()=>setEdit({...item,includedTests:item.includedTests?.map(x=>x._id||x)})}>Edit</button><button className="text-button" onClick={()=>toggle(item)}>{active?'Deactivate':'Activate'}</button></div></div>})}</div>}</main>}
function Status({active}){return <span className="admin-status">{active?'ACTIVE':'INACTIVE'}</span>}
