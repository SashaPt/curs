import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Features from "../components/Features";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductsContext";

function Breadcrumb({ product }) {
  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: product?.title || "Product" }
  ];

  return <Breadcrumbs items={breadcrumbs} />;
}

function ProductGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  const images = [product.image];

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
      
      {product.originalPrice && (
        <p className="product-original-price">{product.originalPrice}</p>
      )}
      
      <div className="product-rating">
        <div className="stars">★★★★★</div>
        <span className="review-count">(5 Customer Reviews)</span>
      </div>

      <p className="product-description">{product.description}</p>

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
              <p>{product.description}</p>
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

function RelatedProducts({ currentProduct }) {
  const { products } = useProducts();
  
  return (
    <section className="related-products">
      <h2>Related Products</h2>
      <div className="products-grid">
        {products
          .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
          .slice(0, 4)
          .map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
      </div>
      <button className="show-more-btn">Show More</button>
    </section>
  );
}

export default function SingleProductPage() {
  const params = useParams();
  const { getProductById, products, loading } = useProducts();
  
  const product = getProductById(params.id);

  if (loading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

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
      <Breadcrumb product={product} />
      <section className="product-detail">
        <div className="container product-detail-inner">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
      </section>
      <RelatedProducts currentProduct={product} />
      <Features />
    </>
  );
}