import assert from "assert";
import axios from "axios";

assert.ok(process.env.BACKEND_BASE_URL, "BACKEND_BASE_URL is not set");
assert.ok(process.env.BACKEND_BASE_URL!.length > 0, "BACKEND_BASE_URL is empty");
console.log("Environment variables:", process.env);
const backendBaseURL = process.env.BACKEND_BASE_URL || "http://localhost:9999/api/v1/";
console.log("Backend base URL:", backendBaseURL);
export const loginURL = new URL("auth/jwt/login", backendBaseURL).toString();
export const userInfoURL = new URL("users/me", backendBaseURL).toString();
export const projectsURL = new URL("projects", backendBaseURL).toString();
export const filesURL = new URL("files", backendBaseURL).toString();
export const assetsURL = new URL("assets", backendBaseURL).toString();
export const processingRequestsURL = new URL("processing-requests", backendBaseURL).toString();

export const http = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios client failed on the backend:", error);
    if (error.response.status === 401) {
      console.error("Unauthorized:", error.response.data.message);
    }
    return Promise.reject(error);
  }
);
http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("Axios client request failed on the backend side:", error);
    return Promise.reject(error);
  }
);
