import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import HomePage from "./pages/Home";
import CartPage from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/Checkout";
import OrderListPage from "./pages/Orders";
import Sidebar from "./components/SideBar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <div className="max-w-6xl mx-auto flex gap-6 p-6">
          <Sidebar />
          <div className="flex-1">

          </div>
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
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;