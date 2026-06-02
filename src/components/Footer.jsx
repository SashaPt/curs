import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [footerData, setFooterData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/footer')
      .then(res => res.json())
      .then(data => {
        setFooterData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <footer className="site-footer">
        <div className="container foot-grid">
          <div className="skeleton-footer">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-text short"></div>
            <div className="skeleton-text short"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-text short"></div>
            <div className="skeleton-text short"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-text short"></div>
          </div>
        </div>
      </footer>
    );
  }

  const aboutLinks = footerData.about?.links || [];
  const helpLinks = footerData.customer_service?.links || [];
  const infoLinks = footerData.information?.links || [];
  const contactLinks = footerData.contact?.links || [];

  const address = contactLinks.find(l => l.key === 'address')?.value || '400 University Drive Suite 200 Coral Gables, FL 33134 USA';
  const email = contactLinks.find(l => l.key === 'email')?.value || '';
  const phone = contactLinks.find(l => l.key === 'phone')?.value || '';

  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        <div>
          <h3>{footerData.about?.title || 'Funiro.'}</h3>
          <p>{address}</p>
          {email && <p>{email}</p>}
          {phone && <p>{phone}</p>}
        </div>
        <div>
          <p className="muted">Links</p>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
        </div>
        <div>
          <p className="muted">Help</p>
          {helpLinks.map(link => (
            <a key={link.key} href="#">{link.value}</a>
          ))}
        </div>
        <div>
          <p className="muted">Newsletter</p>
          <div className="newsletter">
            <input placeholder="Enter Your Email Address" />
            <button>SUBSCRIBE</button>
          </div>
        </div>
      </div>
      <div className="container copyright">2023 furino. All rights reserved</div>
    </footer>
  );
}