import React from "react";

function getImagePaths(src) {
  if (!src) return { webp: "", fallback: "" };

  if (typeof src === "object") {
    return {
      webp: src.path || src.webp || "",
      fallback: src.fallback || src.path || ""
    };
  }

  if (typeof src === "string" && src.endsWith(".webp")) {
    return {
      webp: src,
      fallback: src.replace(/\.webp$/i, ".jpg").replace(/\.webp$/i, ".png")
    };
  }

  return { webp: "", fallback: src };
}

export default function ResponsiveImage({ src, alt = "", className, ...props }) {
  const { webp, fallback } = getImagePaths(src);
  const imgFallback = fallback || webp;

  if (!imgFallback) return null;

  if (webp && webp !== imgFallback) {
    return (
      <picture>
        <source srcSet={webp} type="image/webp" />
        <img src={imgFallback} alt={alt} className={className} {...props} />
      </picture>
    );
  }

  return <img src={imgFallback} alt={alt} className={className} {...props} />;
}
