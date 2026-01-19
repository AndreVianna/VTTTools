/**
 * AssetStudioPage Component Tests
 * Tests asset creation, editing, and form interactions
 * Coverage: Loading, error, new asset, edit mode, form interactions, save, navigation
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind, type Asset } from '@/types/domain';
import { AssetStudioPage } from './AssetStudioPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
}));

// Mock RTK Query hooks
const mockUseGetAssetQuery = vi.fn();
const mockCreateAsset = vi.fn();
const mockUpdateAsset = vi.fn();
const mockDeleteAsset = vi.fn();

vi.mock('@/services/assetsApi', () => ({
    useGetAssetQuery: (id: string, options?: { skip: boolean }) => mockUseGetAssetQuery(id, options),
    useCreateAssetMutation: () => [mockCreateAsset, { isLoading: false }],
    useUpdateAssetMutation: () => [mockUpdateAsset, { isLoading: false }],
    useDeleteAssetMutation: () => [mockDeleteAsset],
}));

// Mock studio components
vi.mock('@/components/assets/studio', () => ({
    AssetStudioLayout: vi.fn(({ toolbar, visualPanel, dataPanel, metadataPanel }) => (
        <div data-mock="layout">
            <div data-mock="toolbar">{toolbar}</div>
            <div data-mock="visual-panel">{visualPanel}</div>
            <div data-mock="data-panel">{dataPanel}</div>
            <div data-mock="metadata-panel">{metadataPanel}</div>
        </div>
    )),
    StudioToolbar: vi.fn(({ title, isNew, isDirty, onBack, onSave, onDelete }) => (
        <div data-mock="studio-toolbar">
            <h1>{title}</h1>
            {isNew && <span>New Asset</span>}
            {isDirty && <span>Unsaved Changes</span>}
            <button onClick={onBack} aria-label="Back">Back</button>
            <button onClick={onSave} aria-label="Save">Save</button>
            {onDelete && <button onClick={onDelete} aria-label="Delete">Delete</button>}
        </div>
    )),
    VisualIdentityPanel: vi.fn(() => <div data-mock="visual-identity-panel" />),
    DataPanel: vi.fn(() => <div data-mock="data-panel-content" />),
    MetadataPanel: vi.fn(({ name, onNameChange }) => (
        <div data-mock="metadata-panel-content">
            <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                aria-label="Asset name"
            />
        </div>
    )),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetStudioPage', () => {
    const mockExistingAsset: Asset = {
        id: 'asset-123',
        name: 'Test Dragon',
        description: 'A fearsome dragon',
        classification: {
            kind: AssetKind.Creature,
            category: 'Monster',
            type: 'Dragon',
            subtype: 'Red Dragon',
        },
        thumbnail: null,
        portrait: null,
        size: { width: 2, height: 2 },
        tokens: [],
        statBlocks: { 0: {} },
        tags: [],
        ownerId: 'user-123',
        isPublished: false,
        isPublic: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        mockUseParams.mockReturnValue({});
        mockUseGetAssetQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: undefined,
        });
        mockCreateAsset.mockResolvedValue({ data: { id: 'new-asset-id' } });
        mockUpdateAsset.mockResolvedValue({ data: undefined });
        mockDeleteAsset.mockResolvedValue({ data: undefined });

        // Mock window.confirm
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    describe('loading state', () => {
        it('should show loading spinner when loading existing asset', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'asset-123' });
            mockUseGetAssetQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: undefined,
            });

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should show error alert when asset fails to load', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'asset-123' });
            mockUseGetAssetQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { status: 404, data: 'Not found' },
            });

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/failed to load asset/i)).toBeInTheDocument();
        });
    });

    describe('new asset mode', () => {
        it('should render with default form state for new asset', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'new' });

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /untitled/i })).toBeInTheDocument();
            expect(screen.getByText('New Asset')).toBeInTheDocument();
        });

        it('should show "Untitled" as title for new asset', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'new' });

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /untitled/i })).toBeInTheDocument();
        });

        it('should not show Delete button for new asset', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'new' });

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
        });

        it('should render with default form state when no id parameter', () => {
            // Arrange
            mockUseParams.mockReturnValue({});

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByText('New Asset')).toBeInTheDocument();
        });
    });

    describe('edit mode (existing asset)', () => {
        beforeEach(() => {
            mockUseParams.mockReturnValue({ id: 'asset-123' });
        });

        it('should populate form with existing asset data', async () => {
            // Arrange - Simulate RTK Query behavior: undefined first, then data
            let callCount = 0;
            mockUseGetAssetQuery.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return { data: undefined, isLoading: true, error: undefined };
                }
                return { data: mockExistingAsset, isLoading: false, error: undefined };
            });

            // Act
            const { rerender } = render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Rerender to trigger data loaded state
            rerender(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert - wait for useEffect to populate form state
            await waitFor(() => {
                expect(screen.getByRole('heading', { name: /test dragon/i })).toBeInTheDocument();
            });
        });

        it('should show Delete button for existing asset', () => {
            // Arrange
            mockUseGetAssetQuery.mockReturnValue({
                data: mockExistingAsset,
                isLoading: false,
                error: undefined,
            });

            // Act
            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        });

        it('should show asset name as title', async () => {
            // Arrange - Simulate RTK Query behavior: undefined first, then data
            let callCount = 0;
            mockUseGetAssetQuery.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return { data: undefined, isLoading: true, error: undefined };
                }
                return { data: mockExistingAsset, isLoading: false, error: undefined };
            });

            // Act
            const { rerender } = render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Rerender to trigger data loaded state
            rerender(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Assert - wait for useEffect to populate form state
            await waitFor(() => {
                expect(screen.getByRole('heading', { name: /test dragon/i })).toBeInTheDocument();
            });
            expect(screen.queryByText('New Asset')).not.toBeInTheDocument();
        });
    });

    describe('form interactions', () => {
        it('should set isDirty when form field changes', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'new' });

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Verify not dirty initially
            expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument();

            // Act
            const nameInput = screen.getByLabelText(/asset name/i);
            await user.type(nameInput, 'New Asset Name');

            // Assert
            expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
        });
    });

    describe('save functionality', () => {
        it('should call createAsset mutation for new asset', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'new' });
            mockCreateAsset.mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({ id: 'new-asset-id' }),
            });

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Act
            const saveButton = screen.getByRole('button', { name: /save/i });
            await user.click(saveButton);

            // Assert
            await waitFor(() => {
                expect(mockCreateAsset).toHaveBeenCalled();
            });
        });

        it('should call updateAsset mutation for existing asset', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'asset-123' });
            mockUseGetAssetQuery.mockReturnValue({
                data: mockExistingAsset,
                isLoading: false,
                error: undefined,
            });
            mockUpdateAsset.mockReturnValue({
                unwrap: vi.fn().mockResolvedValue(undefined),
            });

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Act
            const saveButton = screen.getByRole('button', { name: /save/i });
            await user.click(saveButton);

            // Assert
            await waitFor(() => {
                expect(mockUpdateAsset).toHaveBeenCalled();
            });
        });

        it('should navigate to edit page after successful create', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'new' });
            mockCreateAsset.mockReturnValue({
                unwrap: vi.fn().mockResolvedValue({ id: 'new-asset-id' }),
            });

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Act
            const saveButton = screen.getByRole('button', { name: /save/i });
            await user.click(saveButton);

            // Assert
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/assets/new-asset-id/edit', { replace: true });
            });
        });
    });

    describe('navigation', () => {
        it('should navigate back to /assets on back button click', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'new' });

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Act
            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/assets');
        });

        it('should prompt for unsaved changes confirmation on back', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'new' });
            const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Make the form dirty
            const nameInput = screen.getByLabelText(/asset name/i);
            await user.type(nameInput, 'New Asset Name');

            // Act
            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            // Assert
            expect(confirmSpy).toHaveBeenCalledWith('You have unsaved changes. Discard them?');
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should navigate when user confirms discarding changes', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'new' });
            vi.spyOn(window, 'confirm').mockReturnValue(true);

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Make the form dirty
            const nameInput = screen.getByLabelText(/asset name/i);
            await user.type(nameInput, 'New Asset Name');

            // Act
            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/assets');
        });
    });

    describe('delete functionality', () => {
        it('should call deleteAsset and navigate on delete confirmation', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'asset-123' });
            mockUseGetAssetQuery.mockReturnValue({
                data: mockExistingAsset,
                isLoading: false,
                error: undefined,
            });
            vi.spyOn(window, 'confirm').mockReturnValue(true);

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            // Assert
            await waitFor(() => {
                expect(mockDeleteAsset).toHaveBeenCalledWith('asset-123');
                expect(mockNavigate).toHaveBeenCalledWith('/assets');
            });
        });

        it('should not delete when user cancels confirmation', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseParams.mockReturnValue({ id: 'asset-123' });
            mockUseGetAssetQuery.mockReturnValue({
                data: mockExistingAsset,
                isLoading: false,
                error: undefined,
            });
            vi.spyOn(window, 'confirm').mockReturnValue(false);

            render(
                <TestWrapper>
                    <AssetStudioPage />
                </TestWrapper>,
            );

            // Act
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            await user.click(deleteButton);

            // Assert
            expect(mockDeleteAsset).not.toHaveBeenCalled();
        });
    });

    describe('theme support', () => {
        it('should render correctly in dark mode', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'new' });
            const darkTheme = createTheme({ palette: { mode: 'dark' } });

            // Act
            render(
                <ThemeProvider theme={darkTheme}>
                    <AssetStudioPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /untitled/i })).toBeInTheDocument();
        });

        it('should render correctly in light mode', () => {
            // Arrange
            mockUseParams.mockReturnValue({ id: 'new' });
            const lightTheme = createTheme({ palette: { mode: 'light' } });

            // Act
            render(
                <ThemeProvider theme={lightTheme}>
                    <AssetStudioPage />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('heading', { name: /untitled/i })).toBeInTheDocument();
        });
    });
});
