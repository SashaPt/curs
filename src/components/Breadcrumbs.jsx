import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items, inline }) {
  const content = (
    <div className={`breadcrumb-nav ${inline ? "breadcrumb-inline" : ""}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast) {
          return (
            <span key={item.path || index} className="breadcrumb-current">
              {item.label}
            </span>
          );
        }
        
        return (
          <React.Fragment key={item.path || index}>
            <Link to={item.path} className="breadcrumb-link">
              {item.label}
            </Link>
            <img 
              src="/curs/images/products/arrow-right.png" 
              alt="Arrow" 
              className="breadcrumb-arrow" 
            />
          </React.Fragment>
        );
      })}
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <section className="breadcrumb">
      <div className="container breadcrumb-inner">
        {content}
      </div>
    </section>
  );
}