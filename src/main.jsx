import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ProductsProvider } from "./context/ProductsContext.jsx";
import { ContentProvider } from "./context/ContentContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContentProvider>
      <ProductsProvider>
        <App />
      </ProductsProvider>
    </ContentProvider>
  </React.StrictMode>
);
