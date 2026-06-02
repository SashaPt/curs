import React, { createContext, useContext, useState, useEffect } from "react";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/content/products");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        console.warn("Empty response from API - server may not be running");
        setProducts([]);
        setError(null);
        return;
      }
      
      const data = JSON.parse(text);
      
      // Transform API data to frontend format
      const transformed = data.map(p => ({
        id: p.id,
        title: p.name,
        subtitle: p.description?.substring(0, 50) || "Quality furniture piece",
        price: formatPrice(p.price),
        originalPrice: p.original_price ? formatPrice(p.original_price) : null,
        category: p.category,
        image: p.image || "/images/products/product-1.png",
        badge: getBadge(p),
        slug: p.slug,
        inStock: p.in_stock,
        isFeatured: p.is_featured,
        isNew: p.is_new,
        description: p.description
      }));
      
      setProducts(transformed);
      setError(null);
    } catch (err) {
      console.warn("Failed to fetch products:", err.message);
      setProducts([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `Rp ${(price * 15000).toLocaleString('id-ID')}`;
  };

  const getBadge = (product) => {
    if (product.is_featured && product.original_price) {
      const discount = Math.round((1 - product.price / product.original_price) * 100);
      return { kind: "sale", label: `-${discount}%` };
    }
    if (product.is_new) {
      return { kind: "new", label: "New" };
    }
    return null;
  };

  const getProductById = (id) => {
    return products.find(p => p.id === parseInt(id));
  };

  const getProductBySlug = (slug) => {
    return products.find(p => p.slug === slug);
  };

  const getProductsByCategory = (category) => {
    return products.filter(p => p.category === category);
  };

  const getFeaturedProducts = () => {
    return products.filter(p => p.isFeatured);
  };

  return (
    <ProductsContext.Provider value={{
      products,
      loading,
      error,
      fetchProducts,
      getProductById,
      getProductBySlug,
      getProductsByCategory,
      getFeaturedProducts
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}