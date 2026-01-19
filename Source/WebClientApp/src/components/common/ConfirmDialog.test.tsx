import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const DarkThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'dark' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const defaultProps: ConfirmDialogProps = {
    open: true,
    onClose: vi.fn<() => void>(),
    onConfirm: vi.fn<() => void>(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
};

const renderDialog = (props: Partial<ConfirmDialogProps> = {}, wrapper = TestWrapper) => {
    return render(
        <ConfirmDialog {...defaultProps} {...props} />,
        { wrapper }
    );
};

describe('ConfirmDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render dialog when open is true', () => {
            // Arrange & Act
            renderDialog({ open: true });

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should not render dialog when open is false', () => {
            // Arrange & Act
            renderDialog({ open: false });

            // Assert
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should render title correctly', () => {
            // Arrange
            const title = 'Delete Item';

            // Act
            renderDialog({ title });

            // Assert
            expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
        });

        it('should render message correctly', () => {
            // Arrange
            const message = 'This action cannot be undone.';

            // Act
            renderDialog({ message });

            // Assert
            expect(screen.getByText(message)).toBeInTheDocument();
        });

        it('should render default button text when not provided', () => {
            // Arrange & Act
            renderDialog();

            // Assert
            expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        });

        it('should render custom button text when provided', () => {
            // Arrange
            const confirmText = 'Delete';
            const cancelText = 'Keep';

            // Act
            renderDialog({ confirmText, cancelText });

            // Assert
            expect(screen.getByRole('button', { name: confirmText })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: cancelText })).toBeInTheDocument();
        });
    });

    describe('Severity variants', () => {
        it('should apply warning color to confirm button by default', () => {
            // Arrange & Act
            renderDialog();

            // Assert
            const confirmButton = screen.getByRole('button', { name: 'Confirm' });
            expect(confirmButton).toHaveClass('MuiButton-containedWarning');
        });

        it('should apply error color to confirm button when severity is error', () => {
            // Arrange & Act
            renderDialog({ severity: 'error' });

            // Assert
            const confirmButton = screen.getByRole('button', { name: 'Confirm' });
            expect(confirmButton).toHaveClass('MuiButton-containedError');
        });

        it('should apply info color to confirm button when severity is info', () => {
            // Arrange & Act
            renderDialog({ severity: 'info' });

            // Assert
            const confirmButton = screen.getByRole('button', { name: 'Confirm' });
            expect(confirmButton).toHaveClass('MuiButton-containedInfo');
        });
    });

    describe('User interactions', () => {
        it('should call onConfirm when confirm button is clicked', async () => {
            // Arrange
            const onConfirm = vi.fn<() => void>();
            const user = userEvent.setup();
            renderDialog({ onConfirm });

            // Act
            await user.click(screen.getByRole('button', { name: 'Confirm' }));

            // Assert
            expect(onConfirm).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when cancel button is clicked', async () => {
            // Arrange
            const onClose = vi.fn<() => void>();
            const user = userEvent.setup();
            renderDialog({ onClose });

            // Act
            await user.click(screen.getByRole('button', { name: 'Cancel' }));

            // Assert
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when escape key is pressed', async () => {
            // Arrange
            const onClose = vi.fn<() => void>();
            const user = userEvent.setup();
            renderDialog({ onClose });

            // Act
            await user.keyboard('{Escape}');

            // Assert
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should not call onClose when backdrop is clicked', async () => {
            // Arrange
            const onClose = vi.fn<() => void>();
            const user = userEvent.setup();
            renderDialog({ onClose });

            // Act
            const backdrop = document.querySelector('.MuiBackdrop-root');
            if (backdrop) {
                await user.click(backdrop);
            }

            // Assert
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Loading state', () => {
        it('should show loading spinner when isLoading is true', () => {
            // Arrange & Act
            renderDialog({ isLoading: true });

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should disable confirm button when isLoading is true', () => {
            // Arrange & Act
            renderDialog({ isLoading: true });

            // Assert
            expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
        });

        it('should disable cancel button when isLoading is true', () => {
            // Arrange & Act
            renderDialog({ isLoading: true });

            // Assert
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        });

        it('should not call onClose when escape is pressed during loading', async () => {
            // Arrange
            const onClose = vi.fn<() => void>();
            const user = userEvent.setup();
            renderDialog({ onClose, isLoading: true });

            // Act
            await user.keyboard('{Escape}');

            // Assert
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('should have aria-labelledby pointing to title', () => {
            // Arrange & Act
            renderDialog();

            // Assert
            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
        });

        it('should have aria-describedby pointing to description', () => {
            // Arrange & Act
            renderDialog();

            // Assert
            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-description');
        });
    });

    describe('Theme support', () => {
        it('should render correctly in light theme', () => {
            // Arrange & Act
            renderDialog({}, TestWrapper);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        });

        it('should render correctly in dark theme', () => {
            // Arrange & Act
            renderDialog({}, DarkThemeWrapper);

            // Assert
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        });
    });
});
