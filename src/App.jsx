import React from "react";
import { navLinks, headerIcons } from "./data";
import HomePage from "./HomePage";
import ShopPage from "./ShopPage";
import SingleProductPage from "./SingleProduct";

function Header({ isShopPage = false }) {
  const links = navLinks.map((link) => {
    if (link === "Home") {
      return { label: link, href: "#/" };
    }
    if (link === "Shop") {
      return { label: link, href: "#/shop" };
    }
    return { label: link, href: "#" };
  });

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-wrap">
          <img src="/images/common/logo.png" alt="Furniro icon" />
          <span>Furniro</span>
        </div>
        <nav className="main-nav">
          {links.map((link) => (
            <a key={link.label} href={link.href} className={isShopPage && link.label === "Shop" ? "active-link" : ""}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="icons">
          {headerIcons.map((icon) => (
            <img key={icon.alt} src={icon.src} alt={icon.alt} />
          ))}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const links = navLinks.map((link) => {
    if (link === "Home") {
      return { label: link, href: "#/" };
    }
    if (link === "Shop") {
      return { label: link, href: "#/shop" };
    }
    return { label: link, href: "#" };
  });

  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        <div>
          <h3>Funiro.</h3>
          <p>400 University Drive Suite 200 Coral Gables, FL 33134 USA</p>
        </div>
        <div>
          <p className="muted">Links</p>
          {links.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
        <div>
          <p className="muted">Help</p>
          <a href="#">Payment Options</a>
          <a href="#">Returns</a>
          <a href="#">Privacy Policies</a>
        </div>
        <div>
          <p className="muted">Newsletter</p>
          <div className="newsletter">
            <input placeholder="Enter Your Email Address" />
            <button>SUBSCRIBE</button>
          </div>
        </div>
      </div>
      <div className="container copyright">2023 furino. All rights reserved</div>
    </footer>
  );
}

function HomePageWrapper() {
  return (
    <>
      <Header />
      <HomePage />
      <Footer />
    </>
  );
}

function ShopPageWrapper() {
  return (
    <>
      <Header isShopPage />
      <ShopPage />
      <Footer />
    </>
  );
}

function ProductDetailPage() {
  return (
    <>
      <Header />
      <SingleProductPage />
      <Footer />
    </>
  );
}

export default function App() {
  const [route, setRoute] = React.useState(window.location.hash || "#/");

  React.useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return route === "#/shop" ? <ShopPageWrapper /> : route === "#/product" ? <ProductDetailPage /> : <HomePageWrapper />;
}