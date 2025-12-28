import axios from "axios";


const PORT = import.meta.env.VITE_API_PORT || 3002;


const API_URL = `http://localhost:${PORT}/api`;

export const api = axios.create({
  baseURL: "http://localhost:3002/api",
  withCredentials: true,

  xsrfCookieName: 'XSRF-TOKEN', // Backend'in bıraktığı cookienin adı
  xsrfHeaderName: 'X-XSRF-TOKEN', // Backend'in beklediği header adı
  timeout: 10000, // 10 saniye sonra zaman aşımı (Sonsuz beklemeyi önler)
});

// Her isteğe otomatik token ekle
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Manuel CSRF Header Ekleme (Axios bazen kaçırabiliyor)
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

export default api;