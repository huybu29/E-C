import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import NavBar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import ProductManagement from "./pages/Seller/ProductManagement";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import HomePage from "./pages/Cutomer/Home";
import CartPage from "./pages/Cutomer/Cart";
import ProductDetail from "./pages/Cutomer/ProductDetail";
import CheckoutPage from "./pages/Cutomer/Checkout";
import OrderListPage from "./pages/Cutomer/Orders";
import SellerRegister from "./pages/Seller/SellerRegis";
import SellerPage from "./pages/Seller/SellerPage";
import EditProductPage from "./pages/Seller/EditProduct";
import AddProduct from "./pages/Seller/AddProduct";
import SellerOrdersPage from "./pages/Seller/SellerOrder";
import SellerOrderDetailPage from "./pages/Seller/SellerOrdDetail";
import OrderDetailPage from "./pages/Cutomer/OrderDetail";
import SellerDashboardPage from "./pages/Seller/StatSeller";
function AppContent() {
  const location = useLocation();

  // Ẩn NavBar và Sidebar khi vào trang seller
  const hideLayout = location.pathname.startsWith("/seller");

  return (
    <>
      {!hideLayout && <NavBar />}
      {!hideLayout && (
        <div className="max-w-6xl mx-auto flex gap-6 p-6">
          <Sidebar />
          <div className="flex-1"></div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="category/:id" element={<HomePage />} />
        <Route path="/search" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order" element={<OrderListPage />} />
        <Route path="/seller/*" element={<SellerPage />} />
        <Route path="/seller/register" element={<SellerRegister />} />
        <Route path="/seller/products/edit/:id" element={<EditProductPage />} />
        <Route path="/seller/products/add" element={<AddProduct />} />
        <Route path="/seller/products" element={<ProductManagement />} />
        
        <Route path="/seller/orders" element={<SellerOrdersPage />} />
        <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
        <Route path="/order/:id" element={<OrderDetailPage />} />
        <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
