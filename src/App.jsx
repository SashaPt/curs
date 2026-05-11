import { galleryImages, headerIcons, inspirationImages, navLinks, products, rangeItems } from "./data";

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="logo-wrap">
          <img src="https://www.figma.com/api/mcp/asset/d2ede427-e9fe-4620-8016-d40c6ea41779" alt="Furniro icon" />
          <span>Furniro</span>
        </div>
        <nav className="main-nav">
          {navLinks.map((link) => (
            <a key={link} href="#">
              {link}
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
          <article key={item.title} className="product">
            <img src={item.image} alt={item.title} />
            {item.badge ? <span className={`badge ${item.badge.kind}`}>{item.badge.label}</span> : null}
            <div className="meta">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <strong>{item.price}</strong>
            </div>
          </article>
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

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        <div>
          <h3>Funiro.</h3>
          <p>400 University Drive Suite 200 Coral Gables, FL 33134 USA</p>
        </div>
        <div>
          <p className="muted">Links</p>
          {navLinks.map((link) => (
            <a key={link} href="#">
              {link}
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

export default function App() {
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
