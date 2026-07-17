import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const isAuthRoute = error.config?.url?.includes("/auth/login");

        if (status === 401 && !isAuthRoute) {
            localStorage.removeItem("admin_token");
            Cookies.remove("admin_token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;