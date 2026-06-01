import React from "react";
import { products } from "./data";

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
          <img src="/images/common/filter-icon.png" alt="Filter" />
          <span>Filter</span>
          <img src="/images/common/grid-view-icon.png" alt="Grid view" />
          <img src="/images/common/list-view-icon.png" alt="List view" />
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

export default function ShopPage() {
  return (
    <>
      <ShopBanner />
      <ShopToolbar />
      <ShopProducts />
      <ShopFeatures />
    </>
  );
}