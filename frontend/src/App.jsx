import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import NavBar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import Footer from "./components/Footer";
import Carousel from "./components/Carousel";
import "./i18n";
// Customer pages
import HomePage from "./pages/Cutomer/Home";
import CartPage from "./pages/Cutomer/Cart";
import ProductDetail from "./pages/Cutomer/ProductDetail";
import CheckoutPage from "./pages/Cutomer/Checkout";
import OrderListPage from "./pages/Cutomer/Orders";
import OrderDetailPage from "./pages/Cutomer/OrderDetail";
import UserProfilePage from "./pages/Cutomer/ProfilePage";
import ShopInfo from "./pages/Cutomer/ShopInfor";
// Seller pages
import SellerPage from "./pages/Seller/SellerPage";
import SellerRegister from "./pages/Seller/SellerRegis";
import ProductManagement from "./pages/Seller/ProductManagement";
import EditProductPage from "./pages/Seller/EditProduct";
import AddProduct from "./pages/Seller/AddProduct";
import SellerOrdersPage from "./pages/Seller/SellerOrder";
import SellerOrderDetailPage from "./pages/Seller/SellerOrdDetail";
import SellerDashboardPage from "./pages/Seller/StatSeller";
import SellerProfile from "./pages/Seller/SellerProfile";

// Auth
import LoginPage from "./pages/Login";


// Admin pages
import AdminPage from "./pages/Admin/AdminPage";
import AdminUserManagement from "./pages/Admin/AdminUserManagement";
import AdminProductManagement from "./pages/Admin/AdminProductManagement";
import AdminOrderManagement from "./pages/Admin/AdminOrderManagement";
import UserDetail from "./pages/Admin/AdminUserDetail"
import AdminOrderDetail from "./pages/Admin/AdminOrderDetail";
import AdminProductDetail from "./pages/Admin/AdminProductDetail";
import SystemStats from "./pages/Admin/AdminStatPage";
import SellerManagement from "./pages/Admin/AdminSellerManagement";
import SellerDetail from "./pages/Admin/AdminSellerDetail";
import CategoryManagement from "./pages/Admin/AdminCategoryManagement";
function AppContent() {
  const location = useLocation();

  // Ẩn layout mặc định khi vào login/register/seller/admin
  const hideDefaultLayout =
    location.pathname === "/login" ||
    
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
    location.pathname.startsWith("/order") ||
    location.pathname === "/profile" ||
    location.pathname.startsWith("/shop");
  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/product") ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/seller") ||
    location.pathname.startsWith("/admin") ||
    location.pathname === "/checkout" ||
    location.pathname === "/cart" ||
    location.pathname === "/profile" ||
    location.pathname.startsWith("/order") ||
    location.pathname.startsWith("/shop");
  return (
    <>
  {!hideDefaultLayout && <NavBar />}

  <div className="flex">
    {!hideSidebar && (
      <div className="w-72 shrink-0">
        <Sidebar />
      </div>
    )}
    <div className="flex-1">
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
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/shop/:id" element={<ShopInfo />} />

        {/* Seller routes */}
        <Route path="/seller/*" element={<SellerPage />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/products/edit/:id" element={<EditProductPage />} />
        <Route path="/seller/products/add" element={<AddProduct />} />
        <Route path="/seller/products" element={<ProductManagement />} />
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
        <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
        <Route path="/seller/profile" element={<SellerProfile />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/products" element={<AdminProductManagement />} />
        <Route path="/admin/orders" element={<AdminOrderManagement />} />
        <Route path="/admin/users/:userId" element={<UserDetail />} />
        <Route path="admin/orders/:id" element={<AdminOrderDetail />} />
        <Route path="/admin/products/:productId" element={<AdminProductDetail />} />
        <Route path="/admin/stats/" element={<SystemStats />} />
        <Route path="/admin/sellers" element={<SellerManagement />} />
        <Route path="/admin/sellers/:id" element={<SellerDetail />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
      </Routes>
    </div>
  </div>
</>
  );
}
import { GoogleOAuthProvider } from "@react-oauth/google";
export default function App() {
  return (
    <GoogleOAuthProvider clientId="505731603497-l5t49j3pmpkfevdb7bgoki9apruatk63.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <AppContent />
          <Footer />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}


 