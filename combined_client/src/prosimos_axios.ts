import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_PROSIMOS_REACT_APP_BASE_URL,
});

export default instance;