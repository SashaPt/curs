import React, { useState } from "react";
import { products } from "../data";

function CartBanner() {
  return (
    <section className="cart-banner">
      <div className="cart-banner-overlay">
        <h1>Cart</h1>
        <p>
          Home <span>&gt;</span> Cart
        </p>
      </div>
    </section>
  );
}

function CartItem({ product, quantity, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="cart-item-details">
        <h3>{product.title}</h3>
        <p>Price: {product.price}</p>
        <div className="cart-item-quantity">
          <button onClick={() => onUpdateQuantity(product, Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => onUpdateQuantity(product, quantity + 1)}>+</button>
        </div>
      </div>
      <div className="cart-item-subtotal">
        <p>Subtotal: {product.price}</p>
      </div>
      <button className="cart-item-remove" onClick={() => onRemove(product)}>
        <img src="/curs/images/products/arrow-right.png" alt="Remove" style={{ transform: "rotate(180deg)" }} />
      </button>
    </div>
  );
}

function CartTable({ cartItems, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-table">
      <div className="cart-table-header">
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Subtotal</span>
        <span></span>
      </div>
      <div className="cart-table-body">
        {cartItems.map((item, index) => (
          <CartItem
            key={`${item.product.title}-${index}`}
            product={item.product}
            quantity={item.quantity}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function CartTotals() {
  const subtotal = 125000;
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="cart-totals">
      <h2>Cart Totals</h2>
      <div className="cart-totals-row">
        <span>Subtotal</span>
        <span>Rp 125.000</span>
      </div>
      <div className="cart-totals-row">
        <span>Total</span>
        <span>Rp 125.000</span>
      </div>
      <button className="checkout-btn">Check Out</button>
    </div>
  );
}

function CartFeatures() {
  return (
    <section className="cart-features">
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { product: products[0], quantity: 1 },
    { product: products[2], quantity: 1 }
  ]);

  const updateQuantity = (product, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.title === product.title
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (product) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.title !== product.title)
    );
  };

  return (
    <>
      <CartBanner />
      <section className="cart-content">
        <div className="container cart-content-inner">
          <CartTable
            cartItems={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
          <CartTotals />
        </div>
      </section>
      <CartFeatures />
    </>
  );
}