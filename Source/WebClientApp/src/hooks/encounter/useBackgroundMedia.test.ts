/**
 * useBackgroundMedia Hook Tests
 * Tests background URL and content type computation from encounter data
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBackgroundMedia } from './useBackgroundMedia';
import type { Encounter } from '@/types/domain';

// Mock the config to provide consistent API endpoint
vi.mock('@/config/development', () => ({
    getApiEndpoints: () => ({
        media: '/api/media',
    }),
}));

const createMockEncounter = (settingsOverrides?: Partial<NonNullable<Encounter['stage']['settings']>>): Encounter => ({
    id: 'test-encounter-id',
    ownerId: 'test-owner-id',
    name: 'Test Encounter',
    description: '',
    isPublished: false,
    isPublic: false,
    adventure: null,
    actors: [],
    objects: [],
    effects: [],
    stage: {
        id: 'test-stage-id',
        encounterId: 'test-encounter-id',
        grid: {
            type: 'Square',
            cellSize: 50,
            offset: { x: 0, y: 0 },
            scale: 1,
        },
        settings: settingsOverrides ? {
            mainBackground: null,
            alternateBackground: null,
            zoomLevel: 1,
            panning: { x: 0, y: 0 },
            ...settingsOverrides,
        } : null,
        walls: [],
        regions: [],
        lights: [],
        sounds: [],
    },
});

describe('useBackgroundMedia', () => {
    describe('Main background', () => {
        it('should return undefined backgroundUrl when encounter is undefined', () => {
            // Arrange & Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter: undefined })
            );

            // Assert
            expect(result.current.backgroundUrl).toBeUndefined();
            expect(result.current.backgroundContentType).toBeUndefined();
        });

        it('should return undefined backgroundUrl when settings is null', () => {
            // Arrange
            const encounter = createMockEncounter();

            // Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter })
            );

            // Assert
            expect(result.current.backgroundUrl).toBeUndefined();
            expect(result.current.backgroundContentType).toBeUndefined();
        });

        it('should return undefined backgroundUrl when mainBackground is null', () => {
            // Arrange
            const encounter = createMockEncounter({ mainBackground: null });

            // Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter })
            );

            // Assert
            expect(result.current.backgroundUrl).toBeUndefined();
            expect(result.current.backgroundContentType).toBeUndefined();
        });

        it('should return correct backgroundUrl when mainBackground is set', () => {
            // Arrange
            const encounter = createMockEncounter({
                mainBackground: {
                    id: 'bg-123',
                    contentType: 'image/png',
                    role: 'Background',
                    path: '/media/bg-123',
                    fileName: 'background.png',
                    fileSize: 1000,
                    dimensions: { width: 1920, height: 1080 },
                    duration: '00:00:00',
                    name: 'Background',
                    description: null,
                    tags: [],
                },
            });

            // Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter })
            );

            // Assert
            expect(result.current.backgroundUrl).toBe('/api/media/bg-123');
            expect(result.current.backgroundContentType).toBe('image/png');
        });

        it('should return correct content type for video backgrounds', () => {
            // Arrange
            const encounter = createMockEncounter({
                mainBackground: {
                    id: 'video-456',
                    contentType: 'video/mp4',
                    role: 'Background',
                    path: '/media/video-456',
                    fileName: 'background.mp4',
                    fileSize: 50000,
                    dimensions: { width: 1920, height: 1080 },
                    duration: '00:01:00',
                    name: 'Video Background',
                    description: null,
                    tags: [],
                },
            });

            // Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter })
            );

            // Assert
            expect(result.current.backgroundUrl).toBe('/api/media/video-456');
            expect(result.current.backgroundContentType).toBe('video/mp4');
        });
    });

    describe('Alternate background', () => {
        it('should return undefined alternateBackgroundUrl when not set', () => {
            // Arrange
            const encounter = createMockEncounter({
                mainBackground: {
                    id: 'bg-123',
                    contentType: 'image/png',
                    role: 'Background',
                    path: '/media/bg-123',
                    fileName: 'background.png',
                    fileSize: 1000,
                    dimensions: { width: 1920, height: 1080 },
                    duration: '00:00:00',
                    name: 'Background',
                    description: null,
                    tags: [],
                },
                alternateBackground: null,
            });

            // Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter })
            );

            // Assert
            expect(result.current.alternateBackgroundUrl).toBeUndefined();
            expect(result.current.alternateBackgroundContentType).toBeUndefined();
        });

        it('should return correct alternateBackgroundUrl when set', () => {
            // Arrange
            const encounter = createMockEncounter({
                mainBackground: {
                    id: 'bg-123',
                    contentType: 'image/png',
                    role: 'Background',
                    path: '/media/bg-123',
                    fileName: 'background.png',
                    fileSize: 1000,
                    dimensions: { width: 1920, height: 1080 },
                    duration: '00:00:00',
                    name: 'Background',
                    description: null,
                    tags: [],
                },
                alternateBackground: {
                    id: 'alt-789',
                    contentType: 'image/jpeg',
                    role: 'Background',
                    path: '/media/alt-789',
                    fileName: 'alt-background.jpg',
                    fileSize: 2000,
                    dimensions: { width: 1920, height: 1080 },
                    duration: '00:00:00',
                    name: 'Alternate Background',
                    description: null,
                    tags: [],
                },
            });

            // Act
            const { result } = renderHook(() =>
                useBackgroundMedia({ encounter })
            );

            // Assert
            expect(result.current.alternateBackgroundUrl).toBe('/api/media/alt-789');
            expect(result.current.alternateBackgroundContentType).toBe('image/jpeg');
        });
    });

    describe('Memoization', () => {
        it('should not recalculate backgroundUrl when unrelated properties change', () => {
            // Arrange
            const encounter1 = createMockEncounter({
                mainBackground: {
                    id: 'bg-123',
                    contentType: 'image/png',
                    role: 'Background',
                    path: '/media/bg-123',
                    fileName: 'background.png',
                    fileSize: 1000,
                    dimensions: { width: 1920, height: 1080 },
                    duration: '00:00:00',
                    name: 'Background',
                    description: null,
                    tags: [],
                },
            });

            const { result, rerender } = renderHook(
                ({ encounter }) => useBackgroundMedia({ encounter }),
                { initialProps: { encounter: encounter1 } }
            );

            const initialBackgroundUrl = result.current.backgroundUrl;

            // Act - create new encounter object with same mainBackground reference
            const encounter2: Encounter = {
                ...encounter1,
                name: 'Updated Name',
            };
            rerender({ encounter: encounter2 });

            // Assert - backgroundUrl should still be the same value
            expect(result.current.backgroundUrl).toBe(initialBackgroundUrl);
        });
    });
});
