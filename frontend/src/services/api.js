import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from "./token";

// Base axios instance (sử dụng cho hầu hết các request)
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate axios instance for auth endpoints to avoid interceptor loop
const authClient = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: { "Content-Type": "application/json" },
});

// Queue để chứa request chờ khi đang refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request interceptor: gắn access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: nếu 401 -> thử refresh, queue các request khác
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu không có response hoặc không phải 401 thì reject
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    // Nếu đã retry rồi hoặc là endpoint token/refresh hoặc token obtain thì reject
    if (status !== 401 || originalRequest._retry || originalRequest.url.includes("token/refresh") || originalRequest.url.includes("token/")) {
      return Promise.reject(error);
    }

    // Nếu access token tồn tại nhưng expired -> thử refresh
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      // Không có refresh -> logout (caller nên xử lý)
      clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Đang refresh -> queue request
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const resp = await authClient.post("token/refresh/", { refresh: refreshToken });
      const newAccess = resp.data.access;
      // Lưu access mới (giữ refresh cũ)
      setTokens(newAccess, refreshToken);

      processQueue(null, newAccess);
      originalRequest.headers.Authorization = "Bearer " + newAccess;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;