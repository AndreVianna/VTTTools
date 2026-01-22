import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreviewModeAccess } from './usePreviewModeAccess';
import type { Encounter } from '@/types/domain';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';
const mockUseAuth = vi.mocked(useAuth);

// Helper to create a mock encounter
function createMockEncounter(ownerId: string): Encounter {
    return {
        id: 'encounter-1',
        ownerId,
        name: 'Test Encounter',
        description: 'A test encounter',
        isPublished: false,
        isPublic: false,
        adventure: null,
        stage: {
            id: 'stage-1',
            ownerId,
            name: 'Test Stage',
            description: '',
            isPublished: false,
            isPublic: false,
            settings: {
                useAlternateBackground: false,
                zoomLevel: 1,
                panning: { x: 0, y: 0 },
                ambientLight: 'Default' as any,
                ambientSoundSource: 'NotSet' as any,
                ambientSoundVolume: 1,
                ambientSoundLoop: true,
                ambientSoundIsPlaying: false,
                weather: 'Clear' as any,
            },
            grid: {
                type: 'Square' as any,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                scale: 1,
            },
            walls: [],
            regions: [],
            lights: [],
            elements: [],
            sounds: [],
        },
        actors: [],
        objects: [],
        effects: [],
    };
}

describe('usePreviewModeAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading state when auth is loading', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess('encounter-1', createMockEncounter('user-1'))
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasAccess).toBe(false);
    });

    it('should return loading state when encounter is undefined', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-1' },
            isLoading: false,
            isAuthenticated: true,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess('encounter-1', undefined)
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasAccess).toBe(false);
    });

    it('should deny access when not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess('encounter-1', createMockEncounter('user-1'))
        );

        expect(result.current.hasAccess).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('You must be logged in to preview encounters.');
    });

    it('should deny access when user is null', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: true,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess('encounter-1', createMockEncounter('user-1'))
        );

        expect(result.current.hasAccess).toBe(false);
        expect(result.current.error).toBe('You must be logged in to preview encounters.');
    });

    it('should deny access when encounterId is undefined', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-1' },
            isLoading: false,
            isAuthenticated: true,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess(undefined, createMockEncounter('user-1'))
        );

        expect(result.current.hasAccess).toBe(false);
        expect(result.current.error).toBe('No encounter specified.');
    });

    it('should grant access when user owns the encounter', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-1' },
            isLoading: false,
            isAuthenticated: true,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess('encounter-1', createMockEncounter('user-1'))
        );

        expect(result.current.hasAccess).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should deny access when user does not own the encounter', () => {
        mockUseAuth.mockReturnValue({
            user: { id: 'user-2' },
            isLoading: false,
            isAuthenticated: true,
        } as any);

        const { result } = renderHook(() =>
            usePreviewModeAccess('encounter-1', createMockEncounter('user-1'))
        );

        expect(result.current.hasAccess).toBe(false);
        expect(result.current.error).toBe('You do not have permission to preview this encounter.');
    });
});
