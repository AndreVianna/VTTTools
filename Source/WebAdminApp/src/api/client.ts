import axios from 'axios';
import type { RootState, AppDispatch } from '@store/store';
import { updateToken } from '@store/slices/authSlice';

let store: { getState: () => RootState; dispatch: AppDispatch } | null = null;

export const configureApiClient = (appStore: { getState: () => RootState; dispatch: AppDispatch }) => {
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
    (response) => {
        const refreshedToken = response.headers['x-refreshed-token'];
        if (refreshedToken && store) {
            const state = store.getState();
            if (state.auth.isAuthenticated && state.auth.token !== refreshedToken) {
                try {
                    localStorage.setItem('vtttools_admin_token', refreshedToken);
                    store.dispatch(updateToken(refreshedToken));
                } catch (error) {
                    console.warn('Failed to handle refreshed token', error);
                }
            }
        }
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            const state = store?.getState();
            if (state?.auth.isAuthenticated) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
