import axios from "axios";
import { STORAGE_KEYS } from "../lib/constants";

const API = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

// Pass JWT Token in Headers automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    return Promise.reject(error);
  },
);

export function extractApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (!data) {
    if (error?.code === "ECONNABORTED") return "The server took too long to respond.";
    if (error?.message === "Network Error") {
      return "Cannot reach the server. Make sure the backend is running on port 5000.";
    }
    return error?.message || fallback;
  }
  if (typeof data === "string") return data;
  return data.message || data.error || fallback;
}

/**
 * Downloads a protected binary endpoint (PDF CV) with the auth header attached.
 */
export async function downloadFile(url, fileName) {
  const response = await API.get(url, { responseType: "blob" });

  const contentType = response.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await response.data.text();
    let message = "The requested file is not available yet.";
    try {
      message = JSON.parse(text)?.message || message;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default API;
