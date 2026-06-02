import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { galleryImages, inspirationImages } from "../data";
import Features from "../components/Features";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductsContext";

function Hero() {
  const [heroContent, setHeroContent] = useState(null);

  useEffect(() => {
    fetch('/api/content/homepage')
      .then(res => res.json())
      .then(data => {
        const hero = data.find(s => s.section === 'hero');
        if (hero) setHeroContent(hero);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="hero">
      <div className="hero-card">
        <p className="hero-label">{heroContent?.subtitle || 'New arrival'}</p>
        <h1>{heroContent?.title || 'Discover Our New Collection'}</h1>
        <p>{heroContent?.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.'}</p>
        <Link to={heroContent?.link || '/shop'} className="button">{heroContent?.link_text || 'BUY NOW'}</Link>
      </div>
    </section>
  );
}

function Range() {
  const { products } = useProducts();
  const rangeItems = [
    { title: "Dining", category: "dining", image: "/curs/images/home/range-dining.png" },
    { title: "Living", category: "living", image: "/curs/images/home/range-living.png" },
    { title: "Bedroom", category: "bedroom", image: "/curs/images/home/range-bedroom.png" }
  ];

  return (
    <section className="range container">
      <h2>Browse The Range</h2>
      <p className="subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <div className="range-grid">
        {rangeItems.map((item) => {
          const categoryProducts = products.filter((p) => p.category === item.category);
          return (
            <Link key={item.title} to={`/shop?category=${item.category}`} className="range-card">
              <div className="range-card-image">
                <img src={item.image} alt={item.title} />
                {categoryProducts.length > 0 && (
                  <span className="range-count">{categoryProducts.length} products</span>
                )}
              </div>
              <div className="range-card-meta">
                <h3>{item.title}</h3>
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
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="product skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slidesPerView = 2;
  const totalSlides = Math.ceil(inspirationImages.length / slidesPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % inspirationImages.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + inspirationImages.length) % inspirationImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="inspiration">
      <div className="container insp-wrap">
        <div className="insp-content">
          <h2>50+ Beautiful rooms inspiration</h2>
          <p>Our designer already made a lot of beautiful prototipe of rooms that inspire you</p>
          <button className="button" onClick={() => openLightbox(0)}>Explore More</button>
        </div>
        <div className="insp-slider">
          <div className="insp-slider-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="insp-slide">
                {inspirationImages.slice(slideIndex * slidesPerView, (slideIndex + 1) * slidesPerView).map((image, index) => {
                  const globalIndex = slideIndex * slidesPerView + index;
                  return (
                    <div key={image} className="insp-image-wrap" onClick={() => openLightbox(globalIndex)}>
                      <img src={image} alt={`Room inspiration ${globalIndex + 1}`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <button className="slider-btn slider-btn-prev" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="slider-btn slider-btn-next" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="slider-pagination">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <span
                key={index}
                className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button className="lightbox-btn lightbox-btn-prev" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={inspirationImages[lightboxIndex]} alt={`Room ${lightboxIndex + 1}`} />
          </div>
          <button className="lightbox-btn lightbox-btn-next" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {inspirationImages.length}
          </div>
        </div>
      )}
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
      <Features />
    </>
  );
}