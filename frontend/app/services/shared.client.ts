import axios from "axios";

interface Window {
  ENV: {
    BACKEND_BASE_URL: string;
  };
}
declare var window: Window;

const BACKEND_BASE_URL = window.ENV.BACKEND_BASE_URL;

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
    console.error("Axios client failed:", error);
    if (error.response.status === 401) {
      console.error("Unauthorized:", error.response.data.message);
    }
    return Promise.reject(error);
  }
);
