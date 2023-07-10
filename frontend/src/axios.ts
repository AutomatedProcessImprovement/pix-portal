import axios from "axios";
import {storageconfig} from "../authConfig";


export const REGISTER_API_INSTANCE = axios.create({
  baseURL: "http://pix.cloud.ut.ee:8000",
});


export const API_instance = axios.create({
  baseURL: "http://pix.cloud.ut.ee:8000",
});

API_instance.interceptors.request.use((config) => {
  const value = localStorage.getItem(storageconfig) || '{}'
  const token = JSON.parse(value).id_token ;
  config.headers.Authorization = "Bearer " + token;

  return config;
});

