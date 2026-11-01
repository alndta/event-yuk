/**
 * API Base Configuration
 * In development and tunnel environments, requests use relative paths
 * which are proxied by Vite or reverse proxy.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
