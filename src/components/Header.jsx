import React from "react";
import { Link, useLocation } from "react-router-dom";
import { headerIcons } from "../data";

export default function Header() {
  const location = useLocation();
  const isShopPage = location.pathname === "/shop";
  const isCartPage = location.pathname === "/cart";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-wrap">
          <img src="/curs/images/common/logo.png" alt="Furniro icon" />
          <span>Furniro</span>
        </div>
        <nav className="main-nav">
          <Link to="/" className={location.pathname === "/" ? "active-link" : ""}>Home</Link>
          <Link to="/shop" className={isShopPage ? "active-link" : ""}>Shop</Link>
          <Link to="/cart" className={isCartPage ? "active-link" : ""}>Cart</Link>
        </nav>
        <div className="icons">
          {headerIcons.map((icon) => (
            <Link key={icon.alt} to={icon.alt === "Cart" ? "/cart" : "#"}>
              <img src={icon.src} alt={icon.alt} />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}