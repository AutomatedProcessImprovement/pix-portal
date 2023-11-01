import axios from "axios";

const backendBaseURL = process.env.BACKEND_BASE_URL!;
export const loginURL = new URL("/api/v1/auth/jwt/login", backendBaseURL).toString();
export const userInfoURL = new URL("/api/v1/users/me", backendBaseURL).toString();
export const projectsURL = new URL("/api/v1/projects", backendBaseURL).toString();
export const filesURL = new URL("/api/v1/files", backendBaseURL).toString();
export const assetsURL = new URL("/api/v1/assets", backendBaseURL).toString();

export const http = axios.create();

http.interceptors.response.use(
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
