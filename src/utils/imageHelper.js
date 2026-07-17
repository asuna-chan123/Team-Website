export const normalizeImagePath = (path) => {
  const fallback = "/images/products/no-image.jpg";

  if (!path || typeof path !== "string") {
    return fallback;
  }

  const trimmed = path.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  let normalized = trimmed
    .replace(/\\/g, "/")
    .replace(/\/+$/, "");

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return encodeURI(normalized);
};

export const getProductImage = (product) => {
  const rawImage =
    product?.images?.[0] ||
    product?.image ||
    product?.variants?.[0]?.image ||
    product?.variants?.[0]?.images?.[0] ||
    "/images/products/no-image.jpg";

  return normalizeImagePath(rawImage);
};
