import axios from "axios";

// Base URL dari environment variable, fallback ke localhost untuk development
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request interceptor untuk menambahkan token dari localStorage jika ada
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor untuk handle error global
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const isLogout = error.config?.url?.includes("/logout");

            // Handle 401 Unauthorized (skip for logout requests)
            if (error.response.status === 401 && !isLogout) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_data");
                window.location.href = "/";
            }

            // Handle 403 Forbidden (akun dinonaktifkan)
            if (error.response.status === 403 && !isLogout) {
                const message = error.response.data.message || "Akses ditolak";
                alert(message);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_data");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
