import axios from "axios";

export const clientSideHttp = axios.create({
  baseURL: "http://localhost:9999/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
