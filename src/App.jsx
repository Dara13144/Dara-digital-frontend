import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';

// Customer Pages
import { Home } from './pages/Home.jsx';
import { Shop } from './pages/Shop.jsx';
import { CategoryProducts } from './pages/CategoryProducts.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { Orders } from './pages/Orders.jsx';
import { OrderDetail } from './pages/OrderDetail.jsx';
import { Profile } from './pages/Profile.jsx';
import { Wallet } from './pages/Wallet.jsx';
import { TopUp } from './pages/TopUp.jsx';
import { Support } from './pages/Support.jsx';
import { NotFound } from './pages/NotFound.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminProducts } from './pages/admin/AdminProducts.jsx';
import { AdminStock } from './pages/admin/AdminStock.jsx';
import { AdminOrders } from './pages/admin/AdminOrders.jsx';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail.jsx';
import { AdminPayments } from './pages/admin/AdminPayments.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { AdminCategories } from './pages/admin/AdminCategories.jsx';
import { AdminCoupons } from './pages/admin/AdminCoupons.jsx';
import { AdminSettings } from './pages/admin/AdminSettings.jsx';
import { AdminLogs } from './pages/admin/AdminLogs.jsx';
import { AdminFlashSale } from './pages/admin/AdminFlashSale.jsx';

export default function App() {
  return (
    <Routes>
      {/* Customer Store Front */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="category/:slug" element={<CategoryProducts />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Navigate to="/shop" replace />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="topup" element={<TopUp />} />
        <Route path="support" element={<Support />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="stock" element={<AdminStock />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="flash-sale" element={<AdminFlashSale />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
