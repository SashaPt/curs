import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import SearchPage from "./pages/SearchPage";
import SingleProductPage from "./pages/SingleProduct";
import CartPage from "./pages/CartPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter basename="/curs/">
      <Routes>
        <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
        <Route path="/shop" element={<><Header /><ShopPage /><Footer /></>} />
        <Route path="/search" element={<><Header /><SearchPage /><Footer /></>} />
        <Route path="/product/:id" element={<><Header /><SingleProductPage /><Footer /></>} />
        <Route path="/cart" element={<><Header /><CartPage /><Footer /></>} />
      </Routes>
    </BrowserRouter>
  );
}