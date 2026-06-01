import React, { useState } from "react";
import { products } from "./data";

function Breadcrumb() {
  return (
    <section className="breadcrumb">
      <div className="container breadcrumb-inner">
        <div className="breadcrumb-nav">
          <span>Home</span>
          <img src="/images/products/arrow-right.png" alt="Arrow" className="breadcrumb-arrow" />
          <span>Shop</span>
        </div>
      </div>
    </section>
  );
}

function ProductGallery() {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const images = [
    "/images/products/product-1.png",
    "/images/products/product-2.png",
    "/images/products/product-3.png",
    "/images/products/product-4.png"
  ];

  return (
    <div className="product-gallery">
      <div className="gallery-thumbnails">
        {images.map((img, index) => (
          <button
            key={index}
            className={`thumbnail ${selectedImage === index ? "active" : ""}`}
            onClick={() => setSelectedImage(index)}
          >
            <img src={img} alt={`Product ${index + 1}`} />
          </button>
        ))}
      </div>
      <div className="gallery-main">
        <img src={images[selectedImage]} alt="Selected product" />
      </div>
    </div>
  );
}

function ProductInfo() {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="product-info">
      <h1 className="product-title">Syltherine</h1>
      <p className="product-price">Rp 2.500.000</p>
      
      <div className="product-rating">
        <div className="stars">★★★★★</div>
        <span className="review-count">(5 Customer Reviews)</span>
      </div>

      <p className="product-description">
        Embodying the raw, wayward spirit of rock 'n' roll, the Kilburn portable active stereo speaker takes the unmistakable look and sound of Marshall, unplugs the chords, and takes the show on the road.
      </p>

      <div className="product-options">
        <div className="size-selector">
          <span className="option-label">Size</span>
          <div className="size-options">
            <button className="size-btn">L</button>
            <button className="size-btn active">XL</button>
            <button className="size-btn">XS</button>
          </div>
        </div>
        
        <div className="color-selector">
          <span className="option-label">Color</span>
          <div className="color-options">
            <button className="color-btn purple" />
            <button className="color-btn black active" />
            <button className="color-btn gold" />
          </div>
        </div>
      </div>

      <div className="quantity-cart">
        <div className="quantity-selector">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        <button className="add-to-cart">Add To Cart</button>
        <button className="compare-btn">+ Compare</button>
      </div>

      <div className="product-tabs">
        <div className="tab-headers">
          <button 
            className={`tab-header ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button 
            className={`tab-header ${activeTab === "additional" ? "active" : ""}`}
            onClick={() => setActiveTab("additional")}
          >
            Additional Information
          </button>
          <button 
            className={`tab-header ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews [5]
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-panel">
              <p>
                Weighing in under 7 pounds, the Kilburn is a lightweight piece of vintage styled engineering. 
                Setting the bar as one of the loudest speakers in its class, the Kilburn is a compact, 
                stout-hearted hero with a well-balanced audio which boasts a clear midrange and extended 
                highs for a sound that is both articulate and pronounced. The analogue knobs allow you to 
                fine tune the controls to your personal preferences while the guitar-influenced leather 
                strap enables easy and stylish travel.
              </p>
            </div>
          )}
          {activeTab === "additional" && (
            <div className="tab-panel">
              <p>Additional product information goes here.</p>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="tab-panel">
              <p>Customer reviews will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
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

function RelatedProducts() {
  return (
    <section className="related-products">
      <h2>Related Products</h2>
      <div className="products-grid">
        {products.slice(0, 4).map((item) => (
          <ProductCard key={item.title} item={item} />
        ))}
      </div>
      <button className="show-more-btn">Show More</button>
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

export default function SingleProductPage() {
  return (
    <>
      <Breadcrumb />
      <section className="product-detail">
        <div className="container product-detail-inner">
          <ProductGallery />
          <ProductInfo />
        </div>
      </section>
      <RelatedProducts />
      <ShopFeatures />
    </>
  );
}