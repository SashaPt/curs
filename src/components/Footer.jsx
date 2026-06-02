import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container foot-grid">
        <div>
          <h3>Funiro.</h3>
          <p>400 University Drive Suite 200 Coral Gables, FL 33134 USA</p>
        </div>
        <div>
          <p className="muted">Links</p>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
        </div>
        <div>
          <p className="muted">Help</p>
          <a href="#">Payment Options</a>
          <a href="#">Returns</a>
          <a href="#">Privacy Policies</a>
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