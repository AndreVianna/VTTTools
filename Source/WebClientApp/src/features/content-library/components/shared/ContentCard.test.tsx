import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentCard, type ContentCardProps } from './ContentCard';
import { ContentType } from '../../types';

vi.mock('@/hooks/useAuthenticatedImageUrl', () => ({
    useAuthenticatedImageUrl: vi.fn(),
}));

import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

const mockUseAuthenticatedImageUrl = vi.mocked(useAuthenticatedImageUrl);

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('ContentCard', () => {
    const mockItem: ContentCardProps['item'] = {
        id: 'item-1',
        type: ContentType.Adventure,
        name: 'Dragon Quest',
        isPublished: true,
        thumbnailUrl: 'https://example.com/thumbnail.png',
        resourceUrl: '/api/resources/123',
    };

    const defaultProps: ContentCardProps = {
        item: mockItem,
        onClick: vi.fn<(id: string) => void>(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuthenticatedImageUrl.mockReturnValue({
            blobUrl: null,
            isLoading: false,
            error: null,
        });
    });

    describe('rendering', () => {
        it('should render item name', () => {
            // Arrange
            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
        });

        it('should render with thumbnail when available', () => {
            // Arrange
            mockUseAuthenticatedImageUrl.mockReturnValue({
                blobUrl: 'blob:http://localhost/thumbnail-blob',
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            const thumbnail = screen.getByRole('img', { name: /dragon quest thumbnail/i });
            expect(thumbnail).toBeInTheDocument();
            expect(thumbnail).toHaveAttribute('src', 'blob:http://localhost/thumbnail-blob');
        });

        it('should render placeholder when no thumbnail', () => {
            // Arrange
            const { thumbnailUrl: _, ...mockItemWithoutThumbnail } = mockItem;
            const itemWithoutThumbnail: ContentCardProps['item'] = {
                ...mockItemWithoutThumbnail,
                resourceUrl: null,
            };

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} item={itemWithoutThumbnail} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByRole('img')).not.toBeInTheDocument();
            expect(screen.getByText(String.fromCodePoint(0x1F5FA) + String.fromCodePoint(0xFE0F))).toBeInTheDocument();
        });

        it('should render loading indicator while image loads', () => {
            // Arrange
            const { thumbnailUrl: _, ...mockItemWithoutThumbnail } = mockItem;
            const itemWithResourceUrl: ContentCardProps['item'] = {
                ...mockItemWithoutThumbnail,
                resourceUrl: '/api/resources/123',
            };
            mockUseAuthenticatedImageUrl.mockReturnValue({
                blobUrl: null,
                isLoading: true,
                error: null,
            });

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} item={itemWithResourceUrl} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('should call onClick when card is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onClick = vi.fn();

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} onClick={onClick} />
                </TestWrapper>,
            );

            // Act
            const card = screen.getByRole('button', { name: /open dragon quest/i });
            await user.click(card);

            // Assert
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(onClick).toHaveBeenCalledWith('item-1');
        });

        it('should call onClick when Enter key is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onClick = vi.fn();

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} onClick={onClick} />
                </TestWrapper>,
            );

            // Act
            const card = screen.getByRole('button', { name: /open dragon quest/i });
            card.focus();
            await user.keyboard('{Enter}');

            // Assert
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(onClick).toHaveBeenCalledWith('item-1');
        });

        it('should call onClick when Space key is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onClick = vi.fn();

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} onClick={onClick} />
                </TestWrapper>,
            );

            // Act
            const card = screen.getByRole('button', { name: /open dragon quest/i });
            card.focus();
            await user.keyboard(' ');

            // Assert
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(onClick).toHaveBeenCalledWith('item-1');
        });
    });

    describe('optional content', () => {
        it('should render actions when provided', () => {
            // Arrange
            const actions = <button>Edit</button>;

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} actions={actions} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
        });

        it('should render badges when provided', () => {
            // Arrange
            const badges = <span>Featured</span>;

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} badges={badges} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Featured')).toBeInTheDocument();
        });

        it('should render metadata when provided', () => {
            // Arrange
            const metadata = <span>3 encounters</span>;

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} metadata={metadata} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('3 encounters')).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('should have correct aria-label', () => {
            // Arrange
            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            const card = screen.getByRole('button', { name: /open dragon quest/i });
            expect(card).toHaveAttribute('aria-label', 'Open Dragon Quest');
        });

        it('should be focusable', () => {
            // Arrange
            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            const card = screen.getByRole('button', { name: /open dragon quest/i });
            expect(card).toHaveAttribute('tabIndex', '0');
        });
    });

    describe('theme support', () => {
        it('should render correctly in dark mode', () => {
            // Arrange
            const darkTheme = createTheme({ palette: { mode: 'dark' } });

            render(
                <ThemeProvider theme={darkTheme}>
                    <ContentCard {...defaultProps} />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            render(
                <ThemeProvider theme={lightTheme}>
                    <ContentCard {...defaultProps} />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
        });
    });

    describe('thumbnail fallback behavior', () => {
        it('should use blobUrl when available over thumbnailUrl', () => {
            // Arrange
            mockUseAuthenticatedImageUrl.mockReturnValue({
                blobUrl: 'blob:http://localhost/authenticated-blob',
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            const thumbnail = screen.getByRole('img', { name: /dragon quest thumbnail/i });
            expect(thumbnail).toHaveAttribute('src', 'blob:http://localhost/authenticated-blob');
        });

        it('should use thumbnailUrl when blobUrl is not available', () => {
            // Arrange
            mockUseAuthenticatedImageUrl.mockReturnValue({
                blobUrl: null,
                isLoading: false,
                error: null,
            });

            render(
                <TestWrapper>
                    <ContentCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            const thumbnail = screen.getByRole('img', { name: /dragon quest thumbnail/i });
            expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.png');
        });
    });
});
