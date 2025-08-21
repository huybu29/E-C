import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import NavBar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import ProductManagement from "./pages/Seller/ProductManagement";
import Footer from "./components/Footer";
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
import SellerProductDashboard from "./pages/Seller/SellerProductDetail";
import Carousel from "./components/Carousel";
function AppContent() {
  const location = useLocation();

  // Ẩn NavBar và Sidebar khi vào trang seller
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
 
    location.pathname.startsWith("/seller");
  const hideCarousel = 
    location.pathname === "/login" ||
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/product") ||
    location.pathname === "/register" ||
   location.pathname.startsWith("/seller") ||
    location.pathname === "/checkout" ||
    location.pathname === "/cart" ||
    location.pathname.startsWith("/order");
   const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/product") ||
    location.pathname === "/register" ||
   location.pathname.startsWith("/seller") ||
    location.pathname === "/checkout" ||
    location.pathname === "/cart" ||
    location.pathname.startsWith("/order");
    

  return (
    <>
       {!hideLayout && <NavBar />}
       {!hideCarousel && <Carousel />}
    <div className="float-left top-0 left-0">
      {!hideSidebar && <Sidebar />}
      
    </div>
      
      
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
        <Route path="/seller/products/dashboard/:id" element={<SellerProductDashboard />} />
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
