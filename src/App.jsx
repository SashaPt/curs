import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import SingleProductPage from "./pages/SingleProduct";
import CartPage from "./pages/CartPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter basename="/curs">
      <Routes>
        <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
        <Route path="/shop" element={<><Header /><ShopPage /><Footer /></>} />
        <Route path="/product" element={<><Header /><SingleProductPage /><Footer /></>} />
        <Route path="/cart" element={<><Header /><CartPage /><Footer /></>} />
      </Routes>
    </BrowserRouter>
  );
}