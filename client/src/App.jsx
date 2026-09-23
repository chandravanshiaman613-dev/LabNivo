import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar/Navbar'
import CartModal from './components/CartModal/CartModal'
import Home from './pages/Home/Home'
import './App.css'

const Tests = lazy(() => import('./pages/Tests/Tests'))
const TestDetails = lazy(() => import('./pages/TestDetails/TestDetails'))
const Packages = lazy(() => import('./pages/Packages/Packages'))
const PackageDetails = lazy(() => import('./pages/PackageDetails/PackageDetails'))
const UploadPrescription = lazy(() => import('./pages/UploadPrescription/UploadPrescription'))
const Booking = lazy(() => import('./pages/Booking/Booking'))
const BookingSuccess = lazy(() => import('./pages/BookingSuccess/BookingSuccess'))
const Admin = lazy(() => import('./pages/Admin/Admin'))
const BannerManager = lazy(() => import('./pages/Admin/BannerManager'))
const Collector = lazy(() => import('./pages/Collector/Collector'))
const MyOrders = lazy(() => import('./pages/MyOrders/MyOrders'))
const OrderDetails = lazy(() => import('./pages/MyOrders/OrderDetails'))
const Quotation = lazy(() => import('./pages/Quotation/Quotation'))
const Contact = lazy(() => import('./pages/Info/Info').then(module => ({ default: module.Contact })))
const PartnerNetwork = lazy(() => import('./pages/Info/Info').then(module => ({ default: module.PartnerNetwork })))
const HowItWorks = lazy(() => import('./pages/Info/Info').then(module => ({ default: module.HowItWorks })))

function Loading() {
  return <main aria-live="polite" style={{ minHeight: '40vh' }}>Loading...</main>
}

export default function App() {
  return <CartProvider><div className="app-shell" style={{ overflowX: 'clip', overflowY: 'visible' }}><Navbar /><CartModal />
    <Suspense fallback={<Loading />}><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tests" element={<Tests />} /><Route path="/tests/:slug" element={<TestDetails />} />
      <Route path="/packages" element={<Packages />} /><Route path="/packages/:slug" element={<PackageDetails />} />
      <Route path="/upload-prescription" element={<UploadPrescription />} /><Route path="/book" element={<Booking />} />
      <Route path="/booking-success/:bookingId" element={<BookingSuccess />} /><Route path="/track-booking" element={<Navigate to="/my-orders" replace />} />
      <Route path="/my-orders" element={<MyOrders />} /><Route path="/my-orders/:bookingId" element={<OrderDetails />} /><Route path="/quotation/:quotationId" element={<Quotation />} />
      <Route path="/contact" element={<Contact />} /><Route path="/partner-network" element={<PartnerNetwork />} /><Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/admin" element={<Admin />} /><Route path="/admin/prescriptions" element={<Admin />} /><Route path="/admin/prescriptions/:leadId" element={<Admin />} />
      <Route path="/admin/bookings" element={<Admin />} /><Route path="/admin/bookings/:bookingId" element={<Admin />} /><Route path="/admin/tests" element={<Admin />} />
      <Route path="/admin/packages" element={<Admin />} /><Route path="/admin/coupons" element={<Admin />} />
      <Route path="/admin/banners" element={<BannerManager onLogout={() => { localStorage.removeItem('labNivoAdminToken'); window.location.assign('/admin') }} />} />
      <Route path="/admin/collectors" element={<Admin />} /><Route path="/admin/partner-labs" element={<Admin />} /><Route path="/admin/reports" element={<Admin />} />
      <Route path="/collector" element={<Collector />} /><Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense>
  </div></CartProvider>
}
