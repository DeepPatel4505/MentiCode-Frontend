/**
 * lib/api.js
 * Re-exports the configured axios instance from lib/axios.js and adds
 * the helper functions that the analyze feature services require.
 */
import api from "./axios";

/**
 * Returns the stored access token (used for WebSocket auth in analyze).
 */
export function getApiAuthToken() {
  return localStorage.getItem("accessToken") ?? null;
}

/**
 * Converts an HTTP/HTTPS base URL to a WebSocket ws/wss URL.
 * Falls back to window.location.host if no env var is set.
 *
 * @param {string} path - e.g. "/ws"
 * @returns {string}    - e.g. "ws://localhost:8001/ws"
 */
export function getWsUrl(path = "") {
  const base =
    import.meta.env.VITE_WS_URL ??
    (window.location.protocol === "https:" ? "wss" : "ws") +
      "://" +
      window.location.host;
  return `${base}${path}`;
}

export default api;
