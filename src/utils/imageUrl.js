let webpSupport = null;

export function checkWebpSupport() {
  if (webpSupport !== null) return Promise.resolve(webpSupport);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { webpSupport = true; resolve(true); };
    img.onerror = () => { webpSupport = false; resolve(false); };
    img.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgQAAAD8=";
  });
}

export function resolveImageSrc(src) {
  if (!src) return "";
  if (typeof src === "string") return src;

  const webp = src.path || "";
  const fallback = src.fallback || webp;

  if (webp.endsWith(".webp") && webpSupport === false) return fallback;
  return webp || fallback;
}

export async function initWebpCheck() {
  await checkWebpSupport();
}
