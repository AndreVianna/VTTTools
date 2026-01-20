import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdventureCard as AdventureCardData } from '@/types/domain';
import { AdventureStyle } from '../../types';
import { AdventureCard, type AdventureCardProps } from './AdventureCard';

vi.mock('../shared', () => ({
    ContentCard: vi.fn(({ item, onClick, badges, metadata, actions }) => (
        <div data-mock="ContentCard">
            <span>{item.name}</span>
            <div data-mock="badges">{badges}</div>
            <div data-mock="metadata">{metadata}</div>
            <div data-mock="actions">{actions}</div>
            <button onClick={() => onClick(item.id)}>Open Card</button>
        </div>
    )),
    PublishedBadge: vi.fn(() => <span>Published</span>),
}));

vi.mock('@/config/development', () => ({
    getApiEndpoints: vi.fn(() => ({
        media: 'http://localhost:5000/api/media',
    })),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AdventureCard', () => {
    const mockAdventure: AdventureCardData = {
        id: 'adventure-1',
        name: 'Dragon Lair Adventure',
        description: 'An epic adventure in the dragon lair',
        isPublished: false,
        isPublic: false,
        style: AdventureStyle.DungeonCrawl,
        isOneShot: false,
        encounterCount: 5,
        backgroundId: null,
    };

    const defaultProps: AdventureCardProps = {
        adventure: mockAdventure,
        onOpen: vi.fn<(id: string) => void>(),
        onDuplicate: vi.fn<(id: string) => void>(),
        onDelete: vi.fn<(id: string) => void>(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render adventure name', () => {
            // Arrange & Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dragon Lair Adventure')).toBeInTheDocument();
        });

        it('should show One-Shot badge when adventure.isOneShot is true', () => {
            // Arrange
            const oneShotAdventure: AdventureCardData = {
                ...mockAdventure,
                isOneShot: true,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={oneShotAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('One-Shot')).toBeInTheDocument();
        });

        it('should not show One-Shot badge when adventure.isOneShot is false', () => {
            // Arrange
            const regularAdventure: AdventureCardData = {
                ...mockAdventure,
                isOneShot: false,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={regularAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByText('One-Shot')).not.toBeInTheDocument();
        });

        it('should show adventure style badge with correct label for DungeonCrawl', () => {
            // Arrange
            const dungeonCrawlAdventure: AdventureCardData = {
                ...mockAdventure,
                style: AdventureStyle.DungeonCrawl,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={dungeonCrawlAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dungeon Crawl')).toBeInTheDocument();
        });

        it('should show adventure style badge with correct label for OpenWorld', () => {
            // Arrange
            const openWorldAdventure: AdventureCardData = {
                ...mockAdventure,
                style: AdventureStyle.OpenWorld,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={openWorldAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Open World')).toBeInTheDocument();
        });

        it('should show adventure style badge with correct label for HackNSlash', () => {
            // Arrange
            const hackNSlashAdventure: AdventureCardData = {
                ...mockAdventure,
                style: AdventureStyle.HackNSlash,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={hackNSlashAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Hack-n-Slash')).toBeInTheDocument();
        });

        it('should show Published badge when adventure.isPublished is true', () => {
            // Arrange
            const publishedAdventure: AdventureCardData = {
                ...mockAdventure,
                isPublished: true,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={publishedAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Published')).toBeInTheDocument();
        });

        it('should not show Published badge when adventure.isPublished is false', () => {
            // Arrange
            const unpublishedAdventure: AdventureCardData = {
                ...mockAdventure,
                isPublished: false,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={unpublishedAdventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByText('Published')).not.toBeInTheDocument();
        });

        it('should show correct encounter count in metadata', () => {
            // Arrange
            const adventureWith5Encounters: AdventureCardData = {
                ...mockAdventure,
                encounterCount: 5,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventureWith5Encounters} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('5 encounters')).toBeInTheDocument();
        });

        it('should show singular encounter when count is 1', () => {
            // Arrange
            const adventureWith1Encounter: AdventureCardData = {
                ...mockAdventure,
                encounterCount: 1,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventureWith1Encounter} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('1 encounter')).toBeInTheDocument();
        });

        it('should show 0 encounters when encounterCount is 0', () => {
            // Arrange
            const adventureWithNoEncounters: AdventureCardData = {
                ...mockAdventure,
                encounterCount: 0,
            };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventureWithNoEncounters} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('0 encounters')).toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('should call onDuplicate when Clone button is clicked', () => {
            // Arrange
            const onDuplicate = vi.fn<(id: string) => void>();

            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} onDuplicate={onDuplicate} />
                </TestWrapper>,
            );

            // Act
            const cloneButton = screen.getByRole('button', { name: /clone/i });
            fireEvent.click(cloneButton);

            // Assert
            expect(onDuplicate).toHaveBeenCalledTimes(1);
            expect(onDuplicate).toHaveBeenCalledWith('adventure-1');
        });

        it('should call stopPropagation when Clone button is clicked', () => {
            // Arrange
            const onDuplicate = vi.fn<(id: string) => void>();
            const mockStopPropagation = vi.fn<() => void>();

            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} onDuplicate={onDuplicate} />
                </TestWrapper>,
            );

            // Act
            const cloneButton = screen.getByRole('button', { name: /clone/i });
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'stopPropagation', { value: mockStopPropagation });
            cloneButton.dispatchEvent(clickEvent);

            // Assert
            expect(mockStopPropagation).toHaveBeenCalled();
        });

        it('should call onDelete when Delete button is clicked', () => {
            // Arrange
            const onDelete = vi.fn<(id: string) => void>();

            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} onDelete={onDelete} />
                </TestWrapper>,
            );

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            fireEvent.click(deleteButton);

            // Assert
            expect(onDelete).toHaveBeenCalledTimes(1);
            expect(onDelete).toHaveBeenCalledWith('adventure-1');
        });

        it('should call stopPropagation when Delete button is clicked', () => {
            // Arrange
            const onDelete = vi.fn<(id: string) => void>();
            const mockStopPropagation = vi.fn<() => void>();

            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} onDelete={onDelete} />
                </TestWrapper>,
            );

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'stopPropagation', { value: mockStopPropagation });
            deleteButton.dispatchEvent(clickEvent);

            // Assert
            expect(mockStopPropagation).toHaveBeenCalled();
        });

        it('should call onOpen when card is clicked', () => {
            // Arrange
            const onOpen = vi.fn<(id: string) => void>();

            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} onOpen={onOpen} />
                </TestWrapper>,
            );

            // Act
            const openCardButton = screen.getByRole('button', { name: /open card/i });
            fireEvent.click(openCardButton);

            // Assert
            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onOpen).toHaveBeenCalledWith('adventure-1');
        });
    });

    describe('adventure style labels', () => {
        it('should show Generic label for Generic style', () => {
            // Arrange
            const adventure: AdventureCardData = { ...mockAdventure, style: AdventureStyle.Generic };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Generic')).toBeInTheDocument();
        });

        it('should show Survival label for Survival style', () => {
            // Arrange
            const adventure: AdventureCardData = { ...mockAdventure, style: AdventureStyle.Survival };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Survival')).toBeInTheDocument();
        });

        it('should show Goal Driven label for GoalDriven style', () => {
            // Arrange
            const adventure: AdventureCardData = { ...mockAdventure, style: AdventureStyle.GoalDriven };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Goal Driven')).toBeInTheDocument();
        });

        it('should show Randomly Generated label for RandomlyGenerated style', () => {
            // Arrange
            const adventure: AdventureCardData = { ...mockAdventure, style: AdventureStyle.RandomlyGenerated };

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Randomly Generated')).toBeInTheDocument();
        });

        it('should not show style badge when style is null (defensive behavior)', () => {
            // Arrange - testing defensive behavior for potentially malformed data
            const adventure = { ...mockAdventure, style: null } as unknown as AdventureCardData;

            // Act
            render(
                <TestWrapper>
                    <AdventureCard {...defaultProps} adventure={adventure} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByText('Generic')).not.toBeInTheDocument();
            expect(screen.queryByText('Open World')).not.toBeInTheDocument();
            expect(screen.queryByText('Dungeon Crawl')).not.toBeInTheDocument();
        });
    });

    describe('theme support', () => {
        it('should render correctly in dark mode', () => {
            // Arrange
            const darkTheme = createTheme({ palette: { mode: 'dark' } });

            // Act
            render(
                <ThemeProvider theme={darkTheme}>
                    <AdventureCard {...defaultProps} />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText('Dragon Lair Adventure')).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            // Act
            render(
                <ThemeProvider theme={lightTheme}>
                    <AdventureCard {...defaultProps} />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText('Dragon Lair Adventure')).toBeInTheDocument();
        });
    });
});
