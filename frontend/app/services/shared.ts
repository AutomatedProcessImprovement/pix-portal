import axios from "axios";

export const clientSideHttp = axios.create({
  baseURL: "http://localhost:9999/api/v1",
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
