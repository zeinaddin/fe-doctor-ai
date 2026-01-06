import axios, {type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('access_token');

        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                // No refresh token, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Try to refresh the token
                const response = await axios.post(`${API_BASE_URL}/users/refresh`, {
                    refresh_token: refreshToken,
                });

                const {access_token, refresh_token: new_refresh_token} = response.data;

                // Update tokens
                localStorage.setItem('access_token', access_token);
                if (new_refresh_token) {
                    localStorage.setItem('refresh_token', new_refresh_token);
                }

                // Update authorization header
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                processQueue(null, access_token);

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                processQueue(refreshError as Error, null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);

export default api;

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string; detail?: string }>;
        return (
            axiosError.response?.data?.message ||
            axiosError.response?.data?.detail ||
            axiosError.message ||
            'An unexpected error occurred'
        );
    }
    return 'An unexpected error occurred';
};
