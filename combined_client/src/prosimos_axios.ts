import axios from "axios";

console.log(import.meta.env.VITE_PROSIMOS_REACT_APP_BASE_URL)

const instance = axios.create({
  baseURL: import.meta.env.VITE_PROSIMOS_REACT_APP_BASE_URL,
});

export default instance;