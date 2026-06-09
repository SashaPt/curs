import React, { useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "./ResponsiveImage";

export default function ProductCard({ item }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInCompare(!isInCompare);
  };

  return (
    <article className="product">
      <Link to={`/product/${item.id}`}>
        <ResponsiveImage className="product-img" src={item.image} alt={item.title} />

        {item.badge && <span className={`badge ${item.badge.kind}`}>{item.badge.label}</span>}
  
        <div className="product-actions">
          <button className="action-btn add-to-cart">
            <img src="/curs/images/common/cart-icon.svg" alt="Cart" />
            Add to Cart
          </button>
          <div className="action-icons">
            <button 
              className={`icon-btn ${isInWishlist ? "active" : ""}`} 
              onClick={toggleWishlist}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <img src="/curs/images/common/wishlist-icon.svg" alt="Wishlist" />
            </button>
            <button 
              className={`icon-btn ${isInCompare ? "active" : ""}`} 
              onClick={toggleCompare}
              title={isInCompare ? "Remove from compare" : "Compare"}
            >
              <img src="/curs/images/common/compare-icon.svg" alt="Compare" />
            </button>
          </div>
        </div>

        <div className="meta">
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
          <strong>{item.price}</strong>
        </div>
      </Link>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="product skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
    </article>
  );
}