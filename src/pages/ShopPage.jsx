import React from "react";
import { useSearchParams } from "react-router-dom";
import { products } from "../data";
import Features from "../components/Features";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductCard from "../components/ProductCard";

function ShopBanner() {
  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Shop" }
  ];

  return (
    <section className="shop-banner">
      <div className="shop-banner-overlay">
        <h1>Shop</h1>
        <Breadcrumbs items={breadcrumbs} inline />
      </div>
    </section>
  );
}

function ShopToolbar() {
  return (
    <section className="shop-toolbar">
      <div className="container shop-toolbar-inner">
        <div className="shop-toolbar-left">
          <img src="/curs/images/common/filter-icon.png" alt="Filter" />
          <span>Filter</span>
          <img src="/curs/images/common/grid-view-icon.png" alt="Grid view" />
          <img src="/curs/images/common/list-view-icon.png" alt="List view" />
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

function ShopProducts({ category }) {
  const filteredProducts = category
    ? products.filter((product) => product.category === category)
    : [...products, ...products];

  return (
    <section className="shop-products container">
      <div className="products-grid">
        {filteredProducts.map((item, index) => (
          <ProductCard key={`${item.id || item.title}-${index}`} item={item} />
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

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  return (
    <>
      <ShopBanner />
      <ShopToolbar />
      <ShopProducts category={category} />
      <Features />
    </>
  );
}