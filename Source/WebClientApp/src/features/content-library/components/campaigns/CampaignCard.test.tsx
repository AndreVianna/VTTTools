import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CampaignCard as CampaignCardType } from '@/types/domain';
import { CampaignCard, type CampaignCardProps } from './CampaignCard';

vi.mock('../shared', () => ({
    ContentCard: vi.fn<(props: {
        item: { id: string; name: string };
        onClick: (id: string) => void;
        badges: React.ReactNode;
        metadata: React.ReactNode;
        actions: React.ReactNode;
    }) => React.ReactNode>(({ item, onClick, badges, metadata, actions }) => (
        <div
            data-item-id={item.id}
            data-item-name={item.name}
            onClick={() => onClick(item.id)}
            role="button"
            aria-label={`Open ${item.name}`}
        >
            <span>{item.name}</span>
            <div data-mock="badges">{badges}</div>
            <div data-mock="metadata">{metadata}</div>
            <div data-mock="actions">{actions}</div>
        </div>
    )),
    PublishedBadge: vi.fn<() => React.ReactNode>(() => <span>Published</span>),
}));

vi.mock('@/hooks/useAuthenticatedImageUrl', () => ({
    useAuthenticatedImageUrl: vi.fn<(url: string | null | undefined) => {
        blobUrl: string | null;
        isLoading: boolean;
        error: Error | null;
    }>(() => ({
        blobUrl: null,
        isLoading: false,
        error: null,
    })),
}));

vi.mock('@/config/development', () => ({
    getApiEndpoints: vi.fn<() => { media: string; auth: string; assets: string }>(() => ({
        media: '/api/media',
        auth: '/api/auth',
        assets: '/api/assets',
    })),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('CampaignCard', () => {
    const createMockCampaign = (overrides: Partial<CampaignCardType> = {}): CampaignCardType => ({
        id: 'campaign-1',
        name: 'Dragon Campaign',
        description: 'An epic adventure',
        isPublished: false,
        isPublic: false,
        adventureCount: 0,
        backgroundId: null,
        ...overrides,
    });

    const defaultProps: CampaignCardProps = {
        campaign: createMockCampaign(),
        onOpen: vi.fn<(id: string) => void>(),
        onDuplicate: vi.fn<(id: string) => void>(),
        onDelete: vi.fn<(id: string) => void>(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render campaign name', () => {
            // Arrange
            const campaign = createMockCampaign({ name: 'Dragon Campaign' });

            // Act
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Dragon Campaign')).toBeInTheDocument();
        });

        it('should show Published badge when campaign.isPublished is true', () => {
            // Arrange
            const campaign = createMockCampaign({ isPublished: true });

            // Act
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('Published')).toBeInTheDocument();
        });

        it('should not show Published badge when campaign.isPublished is false', () => {
            // Arrange
            const campaign = createMockCampaign({ isPublished: false });

            // Act
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByText('Published')).not.toBeInTheDocument();
        });
    });

    describe('metadata', () => {
        it('should show singular adventure count when campaign has 1 adventure', () => {
            // Arrange
            const campaign = createMockCampaign({ adventureCount: 1 });

            // Act
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('1 adventure')).toBeInTheDocument();
        });

        it('should show plural adventure count when campaign has multiple adventures', () => {
            // Arrange
            const campaign = createMockCampaign({ adventureCount: 3 });

            // Act
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('3 adventures')).toBeInTheDocument();
        });

        it('should show 0 adventures when campaign has no adventures', () => {
            // Arrange
            const campaign = createMockCampaign({ adventureCount: 0 });

            // Act
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('0 adventures')).toBeInTheDocument();
        });
    });

    describe('user interactions', () => {
        it('should call onOpen when card is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onOpen = vi.fn<(id: string) => void>();
            const campaign = createMockCampaign({ id: 'campaign-123' });

            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} campaign={campaign} onOpen={onOpen} />
                </TestWrapper>,
            );

            // Act
            const card = screen.getByRole('button', { name: /open dragon campaign/i });
            await user.click(card);

            // Assert
            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onOpen).toHaveBeenCalledWith('campaign-123');
        });

        it('should call onDuplicate with stopPropagation when Clone button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDuplicate = vi.fn<(id: string) => void>();
            const onOpen = vi.fn<(id: string) => void>();
            const campaign = createMockCampaign({ id: 'campaign-456' });

            render(
                <TestWrapper>
                    <CampaignCard
                        {...defaultProps}
                        campaign={campaign}
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
            expect(onDuplicate).toHaveBeenCalledWith('campaign-456');
            expect(onOpen).not.toHaveBeenCalled();
        });

        it('should call onDelete with stopPropagation when Delete button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onDelete = vi.fn<(id: string) => void>();
            const onOpen = vi.fn<(id: string) => void>();
            const campaign = createMockCampaign({ id: 'campaign-789' });

            render(
                <TestWrapper>
                    <CampaignCard
                        {...defaultProps}
                        campaign={campaign}
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
            expect(onDelete).toHaveBeenCalledWith('campaign-789');
            expect(onOpen).not.toHaveBeenCalled();
        });
    });

    describe('action buttons', () => {
        it('should render Clone button', () => {
            // Arrange
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /clone/i })).toBeInTheDocument();
        });

        it('should render Delete button', () => {
            // Arrange
            render(
                <TestWrapper>
                    <CampaignCard {...defaultProps} />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });
    });
});
