import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Encounter } from '@/types/domain';
import { GridType, Weather } from '@/types/domain';
import type { Stage } from '@/types/stage';
import { AmbientLight } from '@/types/stage';
import { EncounterCard, type EncounterCardProps } from './EncounterCard';

vi.mock('@/config/development', () => ({
    getApiEndpoints: vi.fn(() => ({
        media: 'https://api.example.com/media',
    })),
}));

vi.mock('../shared', () => ({
    ContentCard: vi.fn(({ item, onClick, badges, actions }: {
        item: { id: string; name: string };
        onClick: (id: string) => void;
        badges: React.ReactNode;
        actions: React.ReactNode;
    }) => (
        <div
            role="button"
            aria-label={`Open ${item.name}`}
            onClick={() => onClick(item.id)}
        >
            <div data-content="name">{item.name}</div>
            <div data-content="badges">{badges}</div>
            <div data-content="actions">{actions}</div>
        </div>
    )),
    PublishedBadge: vi.fn(() => <span>Published</span>),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

const createMockStage = (overrides: Partial<Stage> = {}): Stage => ({
    id: 'stage-1',
    ownerId: 'owner-1',
    name: 'Test Stage',
    description: 'A test stage',
    isPublished: false,
    isPublic: false,
    settings: {
        mainBackground: null,
        alternateBackground: null,
        zoomLevel: 1,
        panning: { x: 0, y: 0 },
        ambientLight: AmbientLight.Default,
        ambientSound: null,
        ambientSoundVolume: 1,
        ambientSoundLoop: false,
        ambientSoundIsPlaying: false,
        weather: Weather.Clear,
    },
    grid: {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        scale: 1,
    },
    walls: [],
    regions: [],
    lights: [],
    elements: [],
    sounds: [],
    ...overrides,
});

describe('EncounterCard', () => {
    const createMockEncounter = (overrides: Partial<Encounter> = {}): Encounter => ({
        id: 'encounter-123',
        ownerId: 'owner-1',
        name: 'Dragon Lair',
        description: 'A dangerous encounter',
        isPublished: false,
        isPublic: false,
        adventure: null,
        stage: createMockStage(),
        actors: [],
        objects: [],
        effects: [],
        ...overrides,
    });

    const defaultProps: EncounterCardProps = {
        encounter: createMockEncounter(),
        onOpen: vi.fn(),
        onDuplicate: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render encounter name', () => {
            // Arrange
            const encounter = createMockEncounter({ name: 'Goblin Ambush' });

            // Act
            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} encounter={encounter} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Goblin Ambush')).toBeInTheDocument();
        });

        it('should show Published badge when encounter.isPublished is true', () => {
            // Arrange
            const encounter = createMockEncounter({ isPublished: true });

            // Act
            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} encounter={encounter} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Published')).toBeInTheDocument();
        });

        it('should not show Published badge when encounter.isPublished is false', () => {
            // Arrange
            const encounter = createMockEncounter({ isPublished: false });

            // Act
            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} encounter={encounter} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByText('Published')).not.toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('should call onOpen when card is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onOpen = vi.fn();
            const encounter = createMockEncounter({ id: 'encounter-456' });

            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} encounter={encounter} onOpen={onOpen} />
                </TestWrapper>,
            );

            // Act
            const card = screen.getByRole('button', { name: /open dragon lair/i });
            await user.click(card);

            // Assert
            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onOpen).toHaveBeenCalledWith('encounter-456');
        });

        it('should call onDuplicate when Clone button is clicked with stopPropagation', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDuplicate = vi.fn();
            const onOpen = vi.fn();
            const encounter = createMockEncounter({ id: 'encounter-789' });

            render(
                <TestWrapper>
                    <EncounterCard
                        {...defaultProps}
                        encounter={encounter}
                        onDuplicate={onDuplicate}
                        onOpen={onOpen}
                    />
                </TestWrapper>,
            );

            // Act
            const cloneButton = screen.getByRole('button', { name: /clone/i });
            await user.click(cloneButton);

            // Assert
            expect(onDuplicate).toHaveBeenCalledTimes(1);
            expect(onDuplicate).toHaveBeenCalledWith('encounter-789');
            expect(onOpen).not.toHaveBeenCalled();
        });

        it('should call onDelete when Delete button is clicked with stopPropagation', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDelete = vi.fn();
            const onOpen = vi.fn();
            const encounter = createMockEncounter({ id: 'encounter-abc' });

            render(
                <TestWrapper>
                    <EncounterCard
                        {...defaultProps}
                        encounter={encounter}
                        onDelete={onDelete}
                        onOpen={onOpen}
                    />
                </TestWrapper>,
            );

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            // Assert
            expect(onDelete).toHaveBeenCalledTimes(1);
            expect(onDelete).toHaveBeenCalledWith('encounter-abc');
            expect(onOpen).not.toHaveBeenCalled();
        });
    });

    describe('stage background', () => {
        it('should handle encounter with stage background', () => {
            // Arrange
            const stageWithBackground = createMockStage({
                settings: {
                    mainBackground: {
                        id: 'bg-resource-1',
                        contentType: 'image/png',
                        path: '/media/backgrounds/dungeon.png',
                        fileName: 'dungeon.png',
                        fileSize: 1024,
                        dimensions: { width: 800, height: 600 },
                        duration: '',
                    },
                    alternateBackground: null,
                    zoomLevel: 1,
                    panning: { x: 0, y: 0 },
                    ambientLight: AmbientLight.Default,
                    ambientSound: null,
                    ambientSoundVolume: 1,
                    ambientSoundLoop: false,
                    ambientSoundIsPlaying: false,
                    weather: Weather.Clear,
                },
            });
            const encounter = createMockEncounter({ stage: stageWithBackground });

            // Act
            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} encounter={encounter} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dragon Lair')).toBeInTheDocument();
        });
    });

    describe('action buttons', () => {
        it('should render Clone button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /clone/i })).toBeInTheDocument();
        });

        it('should render Delete button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <EncounterCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });
    });
});
