import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from '@/services/enhancedBaseQuery';

export interface ProfileResponse {
  name: string;
  displayName: string;
  phoneNumber?: string;
  avatarId?: string;
  success: boolean;
  message?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  displayName?: string;
  phoneNumber?: string;
}

export interface UploadAvatarResponse {
  avatarId: string;
  success: boolean;
  message?: string;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: createEnhancedBaseQuery('/api'),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<ProfileResponse, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    uploadAvatar: builder.mutation<UploadAvatarResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: '/profile/avatar',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Profile'],
    }),

    deleteAvatar: builder.mutation<{ success: boolean; message?: string }, void>({
      query: () => ({
        url: '/profile/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation, useDeleteAvatarMutation } =
  profileApi;
