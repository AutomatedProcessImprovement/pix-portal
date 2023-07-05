import axios from "axios";
import {storageconfig} from "../authConfig";


export const REGISTER_API_INSTANCE = axios.create({
  baseURL: "http://localhost:8000",
});


export const API_instance = axios.create({
  baseURL: "http://localhost:8000",
});

API_instance.interceptors.request.use(function (config) {
  const token = JSON.parse(localStorage.getItem(storageconfig)).id_token;
  config.headers.Authorization = "Bearer " + token;

  return config;
});

