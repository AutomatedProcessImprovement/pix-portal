import axios from "axios";

// For requests from the browser, the backend base URL is relative to the current host.
export const BACKEND_BASE_URL = `${window.location.origin}/api/v1/`;

export const clientSideHttp = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
clientSideHttp.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios client failed on the client side:", error);
    return Promise.reject(error);
  }
);
