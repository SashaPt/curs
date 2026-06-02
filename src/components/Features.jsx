import React, { useState, useEffect } from "react";

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/features')
      .then(res => res.json())
      .then(data => {
        setFeatures(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="shop-features">
        <div className="container features-grid">
          {[1, 2, 3, 4].map(i => (
            <article key={i} className="skeleton-feature">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="shop-features">
      <div className="container features-grid">
        {features.map((feature, index) => (
          <article key={feature.id || index}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}