import React from "react";
import ProductCard from "./ProductCard.jsx";

const ProductList = ({ products = [] }) => {
  if (!products.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", width: "100%" }}>
        <p style={{ color: "hsl(var(--text-muted))", fontSize: "1.1rem" }}>
          No products matched your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
