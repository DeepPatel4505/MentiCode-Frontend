import axios from "axios";

axios.defaults.withCredentials = true;

export const API_BASE_URL =
    import.meta.env.VITE_API_URL || "/api/v1";

let authToken = null;

export const setApiAuthToken = (token) => {
    authToken = token || null;
};

export const getApiAuthToken = () => authToken;

export const getWsUrl = (path = "/ws") => {
    const apiUrl = new URL(API_BASE_URL, window.location.origin);
    const wsProtocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${apiUrl.host}${path}`;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const nextConfig = { ...config };
        nextConfig.headers = nextConfig.headers || {};

        if (authToken && !nextConfig.headers.Authorization) {
            nextConfig.headers.Authorization = `Bearer ${authToken}`;
        }
        console.log("Making API request to:", nextConfig.url);

        return nextConfig;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API request failed:", error);
        const normalizedError =
            error?.response?.data ||
            new Error(error?.message || "Request failed");
        return Promise.reject(normalizedError);
    },
);

export default api;