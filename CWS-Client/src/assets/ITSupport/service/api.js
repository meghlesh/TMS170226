import axios from "axios";

const API = axios.create({
  baseURL: "https://api-tmsdev-be-ede3ccg8dxd3awbw.southindia-01.azurewebsites.net/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
