import axios from "axios";

declare global {
  interface Window {
    ENV: {
      BACKEND_BASE_URL_PUBLIC?: string;
    };
  }
}

export const clientSideHttp = axios.create({
  baseURL: window.ENV.BACKEND_BASE_URL_PUBLIC,
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
