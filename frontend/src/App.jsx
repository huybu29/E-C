import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import NavBar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";

// Customer pages
import HomePage from "./pages/Cutomer/Home";
import CartPage from "./pages/Cutomer/Cart";
import ProductDetail from "./pages/Cutomer/ProductDetail";
import CheckoutPage from "./pages/Cutomer/Checkout";
import OrderListPage from "./pages/Cutomer/Orders";
import OrderDetailPage from "./pages/Cutomer/OrderDetail";

// Seller pages
import SellerPage from "./pages/Seller/SellerPage";
import SellerRegister from "./pages/Seller/SellerRegis";
import ProductManagement from "./pages/Seller/ProductManagement";
import EditProductPage from "./pages/Seller/EditProduct";
import AddProduct from "./pages/Seller/AddProduct";
import SellerOrdersPage from "./pages/Seller/SellerOrder";
import SellerOrderDetailPage from "./pages/Seller/SellerOrdDetail";
import SellerDashboardPage from "./pages/Seller/StatSeller";
import SellerProductDashboard from "./pages/Seller/SellerProductDetail";

// Auth
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import AdminProductManagement from "./pages/Admin/AdminProductManagement";
import AdminOrderManagement from "./pages/Admin/AdminOrderManagement";
import UserDetail from "./pages/Admin/AdminUserDetail";
function AppContent() {
  const location = useLocation();

  // Ẩn layout mặc định khi vào login/register/seller/admin
  const hideDefaultLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/seller") ||
    location.pathname.startsWith("/admin");

  const hideCarousel =
    location.pathname === "/login" ||
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/product") ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/seller") ||
    location.pathname.startsWith("/admin") ||
    location.pathname === "/checkout" ||
    location.pathname === "/cart" ||
    location.pathname.startsWith("/order");

  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/product") ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/seller") ||
    location.pathname.startsWith("/admin") ||
    location.pathname === "/checkout" ||
    location.pathname === "/cart" ||
    location.pathname.startsWith("/order");

  return (
    <>
      {/* Layout mặc định (Customer) */}
      {!hideDefaultLayout && <NavBar />}
      {!hideCarousel && <Carousel />}
      <div className="float-left top-0 left-0">
        {!hideSidebar && <Sidebar />}
      </div>

      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="category/:id" element={<HomePage />} />
        <Route path="/search" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order" element={<OrderListPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Seller routes */}
        <Route path="/seller/*" element={<SellerPage />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/products/edit/:id" element={<EditProductPage />} />
        <Route path="/seller/products/add" element={<AddProduct />} />
        <Route path="/seller/products" element={<ProductManagement />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
        <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
        <Route path="/seller/products/dashboard/:id" element={<SellerProductDashboard />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/products" element={<AdminProductManagement />} />
        <Route path="/admin/orders" element={<AdminOrderManagement />} />
        <Route path="/admin/users/:userId" element={<UserDetail />} />
        {/* Catch-all route */}
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Footer />
      </Router>
    </AuthProvider>
  );
}
