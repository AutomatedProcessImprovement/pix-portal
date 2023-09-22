import axios from "axios";
import {storageconfig} from "../authConfig";

export const REGISTER_API_INSTANCE = axios.create({
  baseURL: import.meta.env.VITE_PIX_REACT_APP_BASE_URL,
});


export const API_instance = axios.create({
  baseURL: import.meta.env.VITE_PIX_REACT_APP_BASE_URL,
});
API_instance.interceptors.request.use((config) => {
  const value = localStorage.getItem(storageconfig) || '{}'
  const token = JSON.parse(value).id_token ;
  config.headers.Authorization = "Bearer " + token;

  return config;
});

