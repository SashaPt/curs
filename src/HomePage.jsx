import React from "react";
import { galleryImages, inspirationImages, rangeItems, products } from "./data";

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

export default function HomePage() {
  return (
    <>
      <Hero />
      <Range />
      <Products />
      <Inspiration />
      <Gallery />
    </>
  );
}