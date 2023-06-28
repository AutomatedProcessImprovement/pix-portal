import axios from "axios";

export const API_instance = axios.create({
  baseURL: "http://localhost:8000"
});

export const ZITADEL_instance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'User-Agent': 'whatever',
    'Authorization': 'Bearer dGdrLUC2RyTxLiz3ICKJgZqa7RVrpS50MfPGZzOWQE1O-MzODSa-q9P0hO9630UGCk1aokc',
  },
});
