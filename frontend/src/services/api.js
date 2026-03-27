import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      localStorage.clear();
    }
    return Promise.reject(error.response);
  },
);

async function apiRequest(endpoint, method, data, customHeaders = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
  const response = await api({ method, url: endpoint, data, headers });
  return response;
}

export default apiRequest;
