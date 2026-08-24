import { Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar/Navbar'
import CartModal from './components/CartModal/CartModal'
import Home from './pages/Home/Home'
import Tests from './pages/Tests/Tests'
import TestDetails from './pages/TestDetails/TestDetails'
import Packages from './pages/Packages/Packages'
import PackageDetails from './pages/PackageDetails/PackageDetails'
import UploadPrescription from './pages/UploadPrescription/UploadPrescription'
import Booking from './pages/Booking/Booking'
import BookingSuccess from './pages/BookingSuccess/BookingSuccess'
import Admin from './pages/Admin/Admin'
import Collector from './pages/Collector/Collector'
import MyOrders from './pages/MyOrders/MyOrders'
import OrderDetails from './pages/MyOrders/OrderDetails'
import Quotation from './pages/Quotation/Quotation'
import './App.css'

export default function App() {
  return <CartProvider><div className="app-shell" style={{ overflowX: 'clip', overflowY: 'visible' }}><Navbar /><CartModal />
    <Routes>
      <Route path="/" element={<Home />} /><Route path="/tests" element={<Tests />} />
      <Route path="/tests/:slug" element={<TestDetails />} /><Route path="/packages" element={<Packages />} />
      <Route path="/packages/:slug" element={<PackageDetails />} /><Route path="/upload-prescription" element={<UploadPrescription />} />
      <Route path="/book" element={<Booking />} /><Route path="/booking-success/:bookingId" element={<BookingSuccess />} /><Route path="/track-booking" element={<Navigate to="/my-orders" replace />} />
      <Route path="/my-orders" element={<MyOrders />} /><Route path="/my-orders/:bookingId" element={<OrderDetails />} /><Route path="/quotation/:quotationId" element={<Quotation />} />
      <Route path="/admin" element={<Admin />} /><Route path="/admin/prescriptions" element={<Admin />} /><Route path="/admin/prescriptions/:leadId" element={<Admin />} />
      <Route path="/admin/bookings" element={<Admin />} /><Route path="/admin/bookings/:bookingId" element={<Admin />} /><Route path="/admin/tests" element={<Admin />} />
      <Route path="/admin/packages" element={<Admin />} /><Route path="/admin/coupons" element={<Admin />} /><Route path="/admin/collectors" element={<Admin />} />
      <Route path="/admin/partner-labs" element={<Admin />} /><Route path="/admin/reports" element={<Admin />} />
      <Route path="/collector" element={<Collector />} /><Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div></CartProvider>
}
