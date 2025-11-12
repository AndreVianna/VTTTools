import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CreateGameSessionRequest,
  GameSession,
  JoinGameSessionRequest,
  UpdateGameSessionRequest,
} from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

// Game Sessions API consuming existing Game microservice
export const gameSessionsApi = createApi({
  reducerPath: 'gameSessionsApi',
  baseQuery: createEnhancedBaseQuery('/api/sessions'),
  tagTypes: ['GameSession', 'SessionPlayer'],
  endpoints: (builder) => ({
    // Get all sessions
    getSessions: builder.query<
      GameSession[],
      {
        status?: string;
        adventureId?: string;
        limit?: number;
        offset?: number;
      }
    >({
      query: (params = {}) => ({
        url: '',
        params,
      }),
      providesTags: ['GameSession'],
    }),

    // Get single session
    getSession: builder.query<GameSession, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'GameSession', id }],
    }),

    // Create session using existing CreateGameSessionRequest from Domain.Game.Sessions.ApiContracts
    createSession: builder.mutation<GameSession, CreateGameSessionRequest>({
      query: (request) => ({
        url: '',
        method: 'POST',
        body: request, // Matches existing C# contract exactly
      }),
      invalidatesTags: ['GameSession'],
    }),

    // Update session using existing UpdateGameSessionRequest from Domain layer
    updateSession: builder.mutation<GameSession, { id: string; request: UpdateGameSessionRequest }>({
      query: ({ id, request }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: request, // Matches existing C# contract exactly
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'GameSession', id }],
    }),

    // Delete session
    deleteSession: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GameSession'],
    }),

    // Join session using existing JoinGameSessionRequest
    joinSession: builder.mutation<{ success: boolean; sessionId: string }, JoinGameSessionRequest>({
      query: (request) => ({
        url: '/join',
        method: 'POST',
        body: request, // Uses existing Domain.Game.Sessions.ApiContracts
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [{ type: 'GameSession', id: sessionId }, 'SessionPlayer'],
    }),

    // Leave session
    leaveSession: builder.mutation<void, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: `/${sessionId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [{ type: 'GameSession', id: sessionId }, 'SessionPlayer'],
    }),

    // Get session players
    getSessionPlayers: builder.query<
      Array<{
        id: string;
        userId: string;
        email: string;
        displayName: string;
        role: string;
        joinedAt: string;
        isOnline: boolean;
      }>,
      string
    >({
      query: (sessionId) => `/${sessionId}/players`,
      providesTags: ['SessionPlayer'],
    }),

    // Update player role
    updatePlayerRole: builder.mutation<
      void,
      {
        sessionId: string;
        playerId: string;
        role: string;
      }
    >({
      query: ({ sessionId, playerId, role }) => ({
        url: `/${sessionId}/players/${playerId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['SessionPlayer'],
    }),

    // Kick player
    kickPlayer: builder.mutation<
      void,
      {
        sessionId: string;
        playerId: string;
      }
    >({
      query: ({ sessionId, playerId }) => ({
        url: `/${sessionId}/players/${playerId}/kick`,
        method: 'POST',
      }),
      invalidatesTags: ['SessionPlayer'],
    }),

    // Start session
    startSession: builder.mutation<GameSession, string>({
      query: (id) => ({
        url: `/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'GameSession', id }],
    }),

    // End session
    endSession: builder.mutation<GameSession, string>({
      query: (id) => ({
        url: `/${id}/end`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'GameSession', id }],
    }),

    // Pause session
    pauseSession: builder.mutation<GameSession, string>({
      query: (id) => ({
        url: `/${id}/pause`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'GameSession', id }],
    }),

    // Resume session
    resumeSession: builder.mutation<GameSession, string>({
      query: (id) => ({
        url: `/${id}/resume`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'GameSession', id }],
    }),

    // Get my active sessions
    getMyActiveSessions: builder.query<GameSession[], void>({
      query: () => '/my-active',
      providesTags: ['GameSession'],
    }),

    // Get session by invitation code
    getSessionByInviteCode: builder.query<GameSession, string>({
      query: (inviteCode) => `/invite/${inviteCode}`,
    }),

    // Generate session invitation
    generateSessionInvitation: builder.mutation<
      { inviteCode: string; expiresAt: string },
      {
        sessionId: string;
        expiresInHours?: number;
      }
    >({
      query: ({ sessionId, expiresInHours = 24 }) => ({
        url: `/${sessionId}/invite`,
        method: 'POST',
        body: { expiresInHours },
      }),
    }),

    // Search public sessions
    searchPublicSessions: builder.query<
      GameSession[],
      {
        query?: string;
        adventureType?: string;
        maxPlayers?: number;
        hasOpenSlots?: boolean;
      }
    >({
      query: (params) => ({
        url: '/public/search',
        params,
      }),
      providesTags: ['GameSession'],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSessionQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useJoinSessionMutation,
  useLeaveSessionMutation,
  useGetSessionPlayersQuery,
  useUpdatePlayerRoleMutation,
  useKickPlayerMutation,
  useStartSessionMutation,
  useEndSessionMutation,
  usePauseSessionMutation,
  useResumeSessionMutation,
  useGetMyActiveSessionsQuery,
  useGetSessionByInviteCodeQuery,
  useGenerateSessionInvitationMutation,
  useSearchPublicSessionsQuery,
} = gameSessionsApi;
