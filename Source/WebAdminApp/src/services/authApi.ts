import { createApi } from '@reduxjs/toolkit/query/react';
import type { AdminUser, LoginRequest, LoginResponse } from '../types/auth';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

// Admin Authentication API using RTK Query
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: createEnhancedBaseQuery('/api/admin/auth'),
    tagTypes: ['AdminUser'],
    endpoints: (builder) => ({
        // Login using admin auth endpoint
        // NOTE: Do NOT use invalidatesTags here - it causes an immediate /me refetch
        // before the browser has stored the cookie from the login response.
        // The login response already includes user data which we use directly.
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),

        // Logout using admin auth endpoint
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['AdminUser'],
        }),

        // Get current authenticated admin user
        getCurrentUser: builder.query<AdminUser, void>({
            query: () => '/me',
            providesTags: ['AdminUser'],
            transformResponse: (response: unknown): AdminUser => {
                const resp = response as { User?: AdminUser; user?: AdminUser } | AdminUser;
                if (resp && typeof resp === 'object' && ('User' in resp || 'user' in resp)) {
                    const user = (resp as { User?: AdminUser; user?: AdminUser }).User ||
                        (resp as { User?: AdminUser; user?: AdminUser }).user;
                    if (user) {
                        return user;
                    }
                }
                if (resp && typeof resp === 'object' && 'id' in resp) {
                    return resp as AdminUser;
                }
                throw new Error('Invalid user response format');
            },
        }),

        // Check session validity
        checkSession: builder.query<boolean, void>({
            query: () => '/session',
            transformResponse: () => true,
            transformErrorResponse: () => false,
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useLazyGetCurrentUserQuery,
    useCheckSessionQuery,
    useLazyCheckSessionQuery,
} = authApi;
