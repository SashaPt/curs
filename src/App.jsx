import React from "react";
import { galleryImages, headerIcons, inspirationImages, navLinks, products, rangeItems } from "./data";

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
          <img src="https://www.figma.com/api/mcp/asset/d2ede427-e9fe-4620-8016-d40c6ea41779" alt="Furniro icon" />
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

function ShopBanner() {
  return (
    <section className="shop-banner">
      <div className="shop-banner-overlay">
        <h1>Shop</h1>
        <p>
          Home <span>&gt;</span> Shop
        </p>
      </div>
    </section>
  );
}

function ShopToolbar() {
  return (
    <section className="shop-toolbar">
      <div className="container shop-toolbar-inner">
        <div className="shop-toolbar-left">
          <img src="https://www.figma.com/api/mcp/asset/8f984451-8cc3-4b15-8826-7f398ab25fa0" alt="Filter" />
          <span>Filter</span>
          <img src="https://www.figma.com/api/mcp/asset/9bbe33ff-6058-489f-b176-6270503fec9e" alt="Grid view" />
          <img src="https://www.figma.com/api/mcp/asset/98734713-dfd2-4002-9bbd-16bd4e352541" alt="List view" />
          <span className="shop-divider" />
          <p>Showing 1-16 of 32 results</p>
        </div>
        <div className="shop-toolbar-right">
          <div className="toolbar-input-wrap">
            <span>Show</span>
            <div className="toolbar-box">16</div>
          </div>
          <div className="toolbar-input-wrap">
            <span>Sort by</span>
            <div className="toolbar-wide-box">Default</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ item }) {
  return (
    <article className="product">
      <img src={item.image} alt={item.title} />
      {item.badge ? <span className={`badge ${item.badge.kind}`}>{item.badge.label}</span> : null}
      <div className="meta">
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
        <strong>{item.price}</strong>
      </div>
    </article>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-card">
        <p className="hero-label">New arrival</p>
        <h1>Discover Our New Collection</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.</p>
        <button>BUY NOW</button>
      </div>
    </section>
  );
}

function Range() {
  return (
    <section className="range container">
      <h2>Browse The Range</h2>
      <p className="subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <div className="range-grid">
        {rangeItems.map((item) => (
          <article key={item.title}>
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className="products container">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map((item) => (
          <ProductCard key={item.title} item={item} />
        ))}
      </div>
      <button className="ghost-btn">Show More</button>
    </section>
  );
}

function Inspiration() {
  return (
    <section className="inspiration">
      <div className="container insp-wrap">
        <div>
          <h2>50+ Beautiful rooms inspiration</h2>
          <p>Our designer already made a lot of beautiful prototipe of rooms that inspire you</p>
          <button>Explore More</button>
        </div>
        <div className="insp-images">
          {inspirationImages.map((image, index) => (
            <img key={image} src={image} alt={`Room inspiration ${index + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="gallery container">
      <p>Share your setup with</p>
      <h2>#FuniroFurniture</h2>
      <div className="masonry">
        {galleryImages.map((image, index) => (
          <img key={image} src={image} alt={`Gallery ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}

function ShopProducts() {
  const shopProducts = [...products, ...products];

  return (
    <section className="shop-products container">
      <div className="products-grid">
        {shopProducts.map((item, index) => (
          <ProductCard key={`${item.title}-${index}`} item={item} />
        ))}
      </div>
      <div className="shop-pagination">
        <button className="page-btn current">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <button className="page-btn next">Next</button>
      </div>
    </section>
  );
}

function ShopFeatures() {
  return (
    <section className="shop-features">
      <div className="container features-grid">
        <article>
          <h3>High Quality</h3>
          <p>crafted from top materials</p>
        </article>
        <article>
          <h3>Warranty Protection</h3>
          <p>Over 2 years</p>
        </article>
        <article>
          <h3>Free Shipping</h3>
          <p>Order over 150 $</p>
        </article>
        <article>
          <h3>24 / 7 Support</h3>
          <p>Dedicated support</p>
        </article>
      </div>
    </section>
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

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Range />
      <Products />
      <Inspiration />
      <Gallery />
      <Footer />
    </>
  );
}

function ShopPage() {
  return (
    <>
      <Header isShopPage />
      <ShopBanner />
      <ShopToolbar />
      <ShopProducts />
      <ShopFeatures />
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

  return route === "#/shop" ? <ShopPage /> : <HomePage />;
}
