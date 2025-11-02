import axios from 'axios';
import type { RootState } from '@store/store';

let store: { getState: () => RootState } | null = null;

export const configureApiClient = (appStore: { getState: () => RootState }) => {
    store = appStore;
};

const apiClient = axios.create({
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        if (store) {
            const state = store.getState();
            const token = state.auth.token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const state = store?.getState();
            if (state?.auth.isAuthenticated) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
