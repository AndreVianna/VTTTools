import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { World } from '@/types/domain';
import { WorldCard, type WorldCardProps } from './WorldCard';

vi.mock('@/config/development', () => ({
    getApiEndpoints: vi.fn(() => ({
        media: 'https://api.example.com/media',
    })),
}));

vi.mock('../shared', () => ({
    ContentCard: vi.fn(({ item, onClick, badges, metadata, actions }: {
        item: { id: string; name: string };
        onClick: (id: string) => void;
        badges: React.ReactNode;
        metadata: React.ReactNode;
        actions: React.ReactNode;
    }) => (
        <div
            role="button"
            aria-label={`Open ${item.name}`}
            onClick={() => onClick(item.id)}
        >
            <div data-content="name">{item.name}</div>
            <div data-content="badges">{badges}</div>
            <div data-content="metadata">{metadata}</div>
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

describe('WorldCard', () => {
    const createMockWorld = (overrides: Partial<World> = {}): World => ({
        id: 'world-123',
        ownerId: 'owner-1',
        name: 'Middle Earth',
        description: 'A fantasy world',
        isPublished: false,
        isPublic: false,
        campaigns: [],
        ...overrides,
    });

    const defaultProps: WorldCardProps = {
        world: createMockWorld(),
        onOpen: vi.fn(),
        onDuplicate: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render world name', () => {
            // Arrange
            const world = createMockWorld({ name: 'Forgotten Realms' });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Forgotten Realms')).toBeInTheDocument();
        });

        it('should show Published badge when world.isPublished is true', () => {
            // Arrange
            const world = createMockWorld({ isPublished: true });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Published')).toBeInTheDocument();
        });

        it('should not show Published badge when world.isPublished is false', () => {
            // Arrange
            const world = createMockWorld({ isPublished: false });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByText('Published')).not.toBeInTheDocument();
        });
    });

    describe('metadata', () => {
        it('should show singular campaign count when world has 1 campaign', () => {
            // Arrange
            const world = createMockWorld({
                campaigns: [
                    {
                        id: 'campaign-1',
                        ownerId: 'owner-1',
                        name: 'Campaign 1',
                        description: 'A campaign',
                        isPublished: false,
                        isPublic: false,
                    },
                ],
            });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('1 campaign')).toBeInTheDocument();
        });

        it('should show plural campaigns count when world has multiple campaigns', () => {
            // Arrange
            const world = createMockWorld({
                campaigns: [
                    {
                        id: 'campaign-1',
                        ownerId: 'owner-1',
                        name: 'Campaign 1',
                        description: 'A campaign',
                        isPublished: false,
                        isPublic: false,
                    },
                    {
                        id: 'campaign-2',
                        ownerId: 'owner-1',
                        name: 'Campaign 2',
                        description: 'Another campaign',
                        isPublished: false,
                        isPublic: false,
                    },
                    {
                        id: 'campaign-3',
                        ownerId: 'owner-1',
                        name: 'Campaign 3',
                        description: 'Yet another campaign',
                        isPublished: false,
                        isPublic: false,
                    },
                ],
            });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('3 campaigns')).toBeInTheDocument();
        });

        it('should show 0 campaigns when world has no campaigns', () => {
            // Arrange
            const world = createMockWorld({ campaigns: [] });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('0 campaigns')).toBeInTheDocument();
        });

        it('should show 0 campaigns when campaigns is undefined', () => {
            // Arrange
            const world = createMockWorld({ campaigns: undefined });

            // Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('0 campaigns')).toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('should call onOpen when card is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onOpen = vi.fn();
            const world = createMockWorld({ id: 'world-456' });

            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} world={world} onOpen={onOpen} />
                </TestWrapper>,
            );

            // Act
            const card = screen.getByRole('button', { name: /open middle earth/i });
            await user.click(card);

            // Assert
            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onOpen).toHaveBeenCalledWith('world-456');
        });

        it('should call onDuplicate when Clone button is clicked with stopPropagation', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDuplicate = vi.fn();
            const onOpen = vi.fn();
            const world = createMockWorld({ id: 'world-789' });

            render(
                <TestWrapper>
                    <WorldCard
                        {...defaultProps}
                        world={world}
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
            expect(onDuplicate).toHaveBeenCalledWith('world-789');
            expect(onOpen).not.toHaveBeenCalled();
        });

        it('should call onDelete when Delete button is clicked with stopPropagation', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDelete = vi.fn();
            const onOpen = vi.fn();
            const world = createMockWorld({ id: 'world-abc' });

            render(
                <TestWrapper>
                    <WorldCard
                        {...defaultProps}
                        world={world}
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
            expect(onDelete).toHaveBeenCalledWith('world-abc');
            expect(onOpen).not.toHaveBeenCalled();
        });
    });

    describe('action buttons', () => {
        it('should render Clone button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /clone/i })).toBeInTheDocument();
        });

        it('should render Delete button', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <WorldCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });
    });
});
