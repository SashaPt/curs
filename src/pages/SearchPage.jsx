import React, { useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../data";
import Features from "../components/Features";
import Breadcrumbs from "../components/Breadcrumbs";

function SearchBanner() {
  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Search" }
  ];

  return (
    <section className="shop-banner">
      <div className="shop-banner-overlay">
        <h1>Search</h1>
        <Breadcrumbs items={breadcrumbs} inline />
      </div>
    </section>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <section className="search-input-section">
      <div className="container search-input-wrapper">
        <input
          type="text"
          placeholder="Search for products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input"
          autoFocus
        />
        <img src="/curs/images/common/search-icon.svg" alt="Search" className="search-icon" />
      </div>
    </section>
  );
}

function SearchResults({ results, query }) {
  if (!query) {
    return (
      <section className="search-results container">
        <p className="search-empty">Enter a search term to find products</p>
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="search-results container">
        <p className="search-empty">No products found for "{query}"</p>
      </section>
    );
  }

  return (
    <section className="search-results container">
      <p className="search-count">Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</p>
      <div className="products-grid">
        {results.map((item) => (
          <article key={item.id} className="product">
            <Link to="/product">
              <img src={item.image} alt={item.title} />
            </Link>
            {item.badge ? <span className={`badge ${item.badge.kind}`}>{item.badge.label}</span> : null}
            <div className="meta">
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <strong>{item.price}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filteredProducts = query
    ? products.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <>
      <SearchBanner />
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults results={filteredProducts} query={query} />
      <Features />
    </>
  );
}