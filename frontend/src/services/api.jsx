import axios from 'axios';


const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export const authAPI = axios.create({
  baseURL: `${baseURL}/auth`,
});

export const vehicleAPI = axios.create({
  baseURL: `${baseURL}/vehicles`,
});

export const rentalAPI = axios.create({
  baseURL: `${baseURL}/rentals`,
});


const setupInterceptors = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (import.meta.env.DEV) {
        console.error("API Error:", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(authAPI);
setupInterceptors(vehicleAPI);
setupInterceptors(rentalAPI);

export default {
  authAPI,
  vehicleAPI,
  rentalAPI,
};
