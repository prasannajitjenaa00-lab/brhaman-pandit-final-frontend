import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout, RequireAuth } from './components/Layout';
import { AdminShell, DashboardShell } from './components/Shells';
import { Spinner } from './components/ui';

import Home from './pages/Home';
import About from './pages/About';
import Pujas from './pages/Pujas';
import PujaDetail from './pages/PujaDetail';
import Pandits from './pages/Pandits';
import PanditDetail from './pages/PanditDetail';
import Book from './pages/Book';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from './pages/AuthPages';
import NotFound from './pages/NotFound';
import Info from './pages/Info';

import DashHome from './pages/dashboard/DashHome';
import { MyBookings, BookingDetail } from './pages/dashboard/Bookings';
import { MyOrders, OrderDetail } from './pages/dashboard/Orders';
import { Profile, ChangePassword, Addresses, Wishlist } from './pages/dashboard/Account';

// Admin bundle is code-split so regular visitors never download it
const A = (name) => lazy(() => import(`./pages/admin/${name}.jsx`));
const AdminDashboard = A('AdminDashboard');
const AdminUsers = A('AdminUsers');
const AdminPandits = A('AdminPandits');
const AdminPanditForm = A('AdminPanditForm');
const AdminPujas = A('AdminPujas');
const AdminPujaForm = A('AdminPujaForm');
const AdminProducts = A('AdminProducts');
const AdminProductForm = A('AdminProductForm');
const AdminCategories = A('AdminCategories');
const AdminInventory = A('AdminInventory');
const AdminBookings = A('AdminBookings');
const AdminBookingDetail = A('AdminBookingDetail');
const AdminOrders = A('AdminOrders');
const AdminOrderDetail = A('AdminOrderDetail');
const AdminReviews = A('AdminReviews');
const AdminCoupons = A('AdminCoupons');
const AdminMessages = A('AdminMessages');
const AdminReports = A('AdminReports');
const AdminSettings = A('AdminSettings');

export default function App() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen items-center" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="pujas" element={<Pujas />} />
          <Route path="pujas/:slug" element={<PujaDetail />} />
          <Route path="pandits" element={<Pandits />} />
          <Route path="pandits/:id" element={<PanditDetail />} />
          <Route path="shop" element={<Shop />} />
          <Route path="shop/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="contact" element={<Contact />} />
          <Route path="info/:slug" element={<Info />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          <Route element={<RequireAuth />}>
            <Route path="book" element={<Book />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="dashboard" element={<DashboardShell />}>
              <Route index element={<DashHome />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="bookings/:id" element={<BookingDetail />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="password" element={<ChangePassword />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="wishlist" element={<Wishlist />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<RequireAuth admin />}>
          <Route path="admin" element={<AdminShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="pandits" element={<AdminPandits />} />
            <Route path="pandits/create" element={<AdminPanditForm />} />
            <Route path="pandits/:id" element={<AdminPanditForm />} />
            <Route path="pujas" element={<AdminPujas />} />
            <Route path="pujas/create" element={<AdminPujaForm />} />
            <Route path="pujas/:id" element={<AdminPujaForm />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/create" element={<AdminProductForm />} />
            <Route path="products/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/:id" element={<AdminBookingDetail />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
