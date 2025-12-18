import axios from 'axios';

let onUnauthorized: (() => void) | null = null;

export const configureApiClient = (callbacks: { onUnauthorized?: () => void }) => {
    onUnauthorized = callbacks.onUnauthorized ?? null;
};

const apiClient = axios.create({
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            onUnauthorized?.();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
