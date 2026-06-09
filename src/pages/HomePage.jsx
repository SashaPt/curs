import React, { useState, useEffect } from "react";
import { resolveImageSrc, checkWebpSupport } from "../utils/imageUrl";
import { Link } from "react-router-dom";
import Features from "../components/Features";
import ProductCard from "../components/ProductCard";
import ResponsiveImage from "../components/ResponsiveImage";
import { useProducts } from "../context/ProductsContext";
import { useContent } from "../context/ContentContext";

function Hero() {
  const { getGroup, loading } = useContent();
  const hero = getGroup("homepage", "homepage-hero");
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    if (!hero.hero_image) return;
    checkWebpSupport().then(() => setBgImage(resolveImageSrc(hero.hero_image)));
  }, [hero.hero_image]);

  if (loading) return <section className="hero"><div className="hero-card skeleton" /></section>;

  return (
    <section className="hero" style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}>
      <div className="hero-card">
        <p className="hero-label">{hero.hero_label || "New arrival"}</p>
        <h1>{hero.hero_title || "Discover Our New Collection"}</h1>
        <p>{hero.hero_description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}</p>
        <Link to={hero.hero_button_link || "/shop"} className="button">
          {hero.hero_button_text || "BUY NOW"}
        </Link>
      </div>
    </section>
  );
}

function Range() {
  const { products } = useProducts();
  const { getGroup, loading } = useContent();
  const range = getGroup("homepage", "homepage-range");
  const [categories, setCategories] = useState([]);

  React.useEffect(() => {
    fetch("/api/content/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const title = range.range_title || "Browse The Range";
  const subtitle = range.range_subtitle || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

  return (
    <section className="range container">
      <h2>{title}</h2>
      <p className="subtitle">{subtitle}</p>
      <div className="range-grid">
        {(categories.length ? categories : [
          { slug: "dining", name: "Dining", image: "/images/home/range-dining.png" },
          { slug: "living", name: "Living", image: "/images/home/range-living.png" },
          { slug: "bedroom", name: "Bedroom", image: "/images/home/range-bedroom.png" }
        ]).map((item) => {
          const categoryProducts = products.filter((p) => p.category === item.slug);
          return (
            <Link key={item.slug} to={`/shop?category=${item.slug}`} className="range-card">
              <div className="range-card-image">
                <ResponsiveImage src={item.image} alt={item.name} />
                {categoryProducts.length > 0 && (
                  <span className="range-count">{categoryProducts.length} products</span>
                )}
              </div>
              <div className="range-card-meta">
                <h3>{item.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Products() {
  const { products, loading } = useProducts();
  const [displayCount, setDisplayCount] = useState(8);

  if (loading) {
    return (
      <section className="products container">
        <h2>Our Products</h2>
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="product skeleton">
              <div className="skeleton-image" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="products container">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.slice(0, displayCount).map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
      {products.length > displayCount && (
        <button className="ghost-btn" onClick={() => setDisplayCount(displayCount + 8)}>
          Show More
        </button>
      )}
    </section>
  );
}

function Inspiration() {
  const { getGroup, loading } = useContent();
  const insp = getGroup("homepage", "homepage-inspiration");
  const images = Array.isArray(insp.inspiration_images) ? insp.inspiration_images : [];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slidesPerView = 2;
  const totalSlides = Math.max(1, Math.ceil(images.length / slidesPerView));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  if (loading || !images.length) return null;

  return (
    <section className="inspiration">
      <div className="container insp-wrap">
        <div className="insp-content">
          <h2>{insp.inspiration_title || "50+ Beautiful rooms inspiration"}</h2>
          <p>{insp.inspiration_text || "Our designer already made a lot of beautiful prototipe of rooms that inspire you"}</p>
          <button className="button" onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}>Explore More</button>
        </div>
        <div className="insp-slider">
          <div className="insp-slider-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="insp-slide">
                {images.slice(slideIndex * slidesPerView, (slideIndex + 1) * slidesPerView).map((item, index) => {
                  const globalIndex = slideIndex * slidesPerView + index;
                  return (
                    <div key={globalIndex} className="insp-image-wrap" onClick={() => { setLightboxIndex(globalIndex); setLightboxOpen(true); }}>
                      <ResponsiveImage src={item.image} alt={item.caption || `Room ${globalIndex + 1}`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <button className="slider-btn slider-btn-prev" onClick={prevSlide} aria-label="Previous">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="slider-btn slider-btn-next" onClick={nextSlide} aria-label="Next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="slider-pagination">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <span key={index} className={`pagination-dot ${index === currentSlide ? "active" : ""}`} onClick={() => setCurrentSlide(index)} />
            ))}
          </div>
        </div>
      </div>
      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>×</button>
          <button className="lightbox-btn lightbox-btn-prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <ResponsiveImage src={images[lightboxIndex]?.image} alt={images[lightboxIndex]?.caption || ""} />
          </div>
          <button className="lightbox-btn lightbox-btn-next" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % images.length); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="lightbox-counter">{lightboxIndex + 1} / {images.length}</div>
        </div>
      )}
    </section>
  );
}

function Gallery() {
  const { getGroup, loading } = useContent();
  const gallery = getGroup("homepage", "homepage-gallery");
  const images = Array.isArray(gallery.gallery_images) ? gallery.gallery_images : [];

  if (loading) return null;

  return (
    <section className="gallery container">
      <p>{gallery.gallery_subtitle || "Share your setup with"}</p>
      <h2>{gallery.gallery_title || "#FuniroFurniture"}</h2>
      <div className="masonry">
        {images.map((item, index) => (
          <ResponsiveImage key={index} src={item.image} alt={item.alt || `Gallery ${index + 1}`} />
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
      <Features />
    </>
  );
}
