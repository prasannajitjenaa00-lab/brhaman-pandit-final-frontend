// Single place that reads build-time environment. VITE_API_URL is empty in dev (Vite proxies /api and
// /uploads) and in production behind Nginx (same origin); set it only for a separately hosted API.
export const API_URL = import.meta.env.VITE_API_URL || '';
export const API_BASE = `${API_URL}/api`;

// Resolve an image path stored in the database (absolute Cloudinary URL or relative /uploads path).
export const assetUrl = (src) => {
  if (!src) return '';
  return /^https?:/.test(src) ? src : `${API_URL}${src}`;
};
