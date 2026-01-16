import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ResourcePickerFilters } from './ResourcePickerFilters';
import { ResourceRole } from '@/types/domain';

// Mock MUI icons to avoid file handle exhaustion
vi.mock('@mui/icons-material', () => ({
    CloudUpload: () => <span data-testid="upload-icon">UploadIcon</span>,
    Search: () => <span data-testid="search-icon">SearchIcon</span>,
}));

// Mock the useFileUpload hook
vi.mock('@/hooks/useFileUpload', () => ({
    useFileUpload: vi.fn(() => ({
        uploadState: {
            isUploading: false,
            progress: 0,
            fileName: null,
            error: null,
        },
        uploadFile: vi.fn(),
        cancelUpload: vi.fn(),
        resetState: vi.fn(),
    })),
}));

const theme = createTheme();

const mockStore = configureStore({
    reducer: {
        auth: () => ({ isAuthenticated: true, user: null }),
    },
});

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <Provider store={mockStore}>
            <ThemeProvider theme={theme}>{ui}</ThemeProvider>
        </Provider>
    );
};

describe('ResourcePickerFilters', () => {
    const defaultProps = {
        searchQuery: '',
        onSearchChange: vi.fn(),
        ownershipFilter: 'mine' as const,
        onOwnershipChange: vi.fn(),
        onUploadComplete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render search field', () => {
        renderWithProviders(<ResourcePickerFilters {...defaultProps} />);

        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should render ownership toggle buttons', () => {
        renderWithProviders(<ResourcePickerFilters {...defaultProps} />);

        expect(screen.getByRole('button', { name: /mine/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    });

    it('should render upload button', () => {
        renderWithProviders(<ResourcePickerFilters {...defaultProps} />);

        expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument();
    });

    it('should call onSearchChange with debounce', async () => {
        const user = userEvent.setup();
        const onSearchChange = vi.fn();

        renderWithProviders(
            <ResourcePickerFilters {...defaultProps} onSearchChange={onSearchChange} />
        );

        const searchInput = screen.getByPlaceholderText('Search...');
        await user.type(searchInput, 'test');

        // Wait for debounce
        await waitFor(
            () => {
                expect(onSearchChange).toHaveBeenCalledWith('test');
            },
            { timeout: 500 }
        );
    });

    it('should call onOwnershipChange when toggling ownership filter', async () => {
        const user = userEvent.setup();
        const onOwnershipChange = vi.fn();

        renderWithProviders(
            <ResourcePickerFilters {...defaultProps} onOwnershipChange={onOwnershipChange} />
        );

        const allButton = screen.getByRole('button', { name: /all/i });
        await user.click(allButton);

        expect(onOwnershipChange).toHaveBeenCalledWith('all');
    });

    it('should show "Mine" button as selected when ownershipFilter is mine', () => {
        renderWithProviders(
            <ResourcePickerFilters {...defaultProps} ownershipFilter="mine" />
        );

        const mineButton = screen.getByRole('button', { name: /mine/i });
        expect(mineButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show "All" button as selected when ownershipFilter is all', () => {
        renderWithProviders(
            <ResourcePickerFilters {...defaultProps} ownershipFilter="all" />
        );

        const allButton = screen.getByRole('button', { name: /all/i });
        expect(allButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should display initial search query value', () => {
        renderWithProviders(
            <ResourcePickerFilters {...defaultProps} searchQuery="initial query" />
        );

        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toHaveValue('initial query');
    });

    it('should render accepted file types on upload input', () => {
        renderWithProviders(
            <ResourcePickerFilters
                {...defaultProps}
                acceptedFileTypes="image/*,video/mp4"
            />
        );

        const fileInput = document.querySelector('input[type="file"]');
        expect(fileInput).toHaveAttribute('accept', 'image/*,video/mp4');
    });

    it('should render with default upload role', () => {
        renderWithProviders(
            <ResourcePickerFilters
                {...defaultProps}
                defaultUploadRole={ResourceRole.Background}
            />
        );

        expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument();
    });
});

describe('ResourcePickerFilters upload states', () => {
    const defaultProps = {
        searchQuery: '',
        onSearchChange: vi.fn(),
        ownershipFilter: 'mine' as const,
        onOwnershipChange: vi.fn(),
        onUploadComplete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show uploading state when upload is in progress', async () => {
        const { useFileUpload } = await import('@/hooks/useFileUpload');
        vi.mocked(useFileUpload).mockReturnValue({
            uploadState: {
                isUploading: true,
                progress: 50,
                fileName: 'test-file.png',
                error: null,
            },
            uploadFile: vi.fn(),
            cancelUpload: vi.fn(),
            resetState: vi.fn(),
        });

        renderWithProviders(<ResourcePickerFilters {...defaultProps} />);

        expect(screen.getByText(/uploading.../i)).toBeInTheDocument();
        expect(screen.getByText(/test-file.png/)).toBeInTheDocument();
        expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    it('should show error message when upload fails', async () => {
        const { useFileUpload } = await import('@/hooks/useFileUpload');
        vi.mocked(useFileUpload).mockReturnValue({
            uploadState: {
                isUploading: false,
                progress: 0,
                fileName: 'test-file.png',
                error: 'Upload failed: file too large',
            },
            uploadFile: vi.fn(),
            cancelUpload: vi.fn(),
            resetState: vi.fn(),
        });

        renderWithProviders(<ResourcePickerFilters {...defaultProps} />);

        expect(screen.getByText(/upload failed: file too large/i)).toBeInTheDocument();
    });

    it('should disable upload button during upload', async () => {
        const { useFileUpload } = await import('@/hooks/useFileUpload');
        vi.mocked(useFileUpload).mockReturnValue({
            uploadState: {
                isUploading: true,
                progress: 25,
                fileName: 'uploading.png',
                error: null,
            },
            uploadFile: vi.fn(),
            cancelUpload: vi.fn(),
            resetState: vi.fn(),
        });

        renderWithProviders(<ResourcePickerFilters {...defaultProps} />);

        const uploadButton = screen.getByRole('button', { name: /uploading/i });
        // MUI Button with component="label" uses aria-disabled instead of disabled attribute
        expect(uploadButton).toHaveAttribute('aria-disabled', 'true');
    });
});
