import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { products } from "../data";
import Features from "../components/Features";
import Breadcrumbs from "../components/Breadcrumbs";

function Breadcrumb() {
  const params = useParams();
  const product = products.find(p => p.id === parseInt(params.id));
  
  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: product?.title || "Product" }
  ];

  return <Breadcrumbs items={breadcrumbs} />;
}

function ProductGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Use product image as main, add placeholders for gallery
  const images = [
    product.image,
    "/curs/images/products/product-2.png",
    "/curs/images/products/product-3.png",
    "/curs/images/products/product-4.png"
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

function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="product-info">
      <h1 className="product-title">{product.title}</h1>
      <p className="product-price">{product.price}</p>
      
      <div className="product-rating">
        <div className="stars">★★★★★</div>
        <span className="review-count">(5 Customer Reviews)</span>
      </div>

      <p className="product-description">
        {product.subtitle}. Embodying the raw, wayward spirit of rock 'n' roll, the Kilburn portable active stereo speaker takes the unmistakable look and sound of Marshall, unplugs the chords, and takes the show on the road.
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
      <Link to={`/product/${item.id}`}>
        <img src={item.image} alt={item.title} />
      </Link>
      {item.badge && <span className={`badge ${item.badge.kind}`}>{item.badge.label}</span>}
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



export default function SingleProductPage() {
  const params = useParams();
  const product = products.find(p => p.id === parseInt(params.id));

  if (!product) {
    return (
      <div className="container">
        <h1>Product not found</h1>
        <Link to="/shop">Back to Shop</Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb />
      <section className="product-detail">
        <div className="container product-detail-inner">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
      </section>
      <RelatedProducts />
      <Features />
    </>
  );
}