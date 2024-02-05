import assert from "assert";
import type { AxiosError } from "axios";
import axios from "axios";

assert.ok(process.env.BACKEND_BASE_URL, "BACKEND_BASE_URL is not set");
assert.ok(process.env.BACKEND_BASE_URL!.length > 0, "BACKEND_BASE_URL is empty");
console.log("Environment variables:", process.env);
const backendBaseURL = process.env.BACKEND_BASE_URL || "http://localhost:9999/api/v1/";
console.log("Backend base URL:", backendBaseURL);
export const loginURL = new URL("auth/jwt/login", backendBaseURL).toString();
export const verifyURL = new URL("auth/verify", backendBaseURL).toString();
export const passwordResetURL = new URL("auth/reset-password", backendBaseURL).toString();
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
    const err = error as AxiosError;
    console.error(
      `Axios client failed while requesting the backend: code=${err.code} message=${err.message} method=${err.request?.method} host=${err.request?.host} path=${err.request?.path}`
    );
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
