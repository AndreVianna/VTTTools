import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EditableTitle } from './EditableTitle';

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('EditableTitle', () => {
    describe('View Mode', () => {
        it('should render value as button', () => {
            // Arrange
            const onSave = vi.fn();

            // Act
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);

            // Assert
            const button = screen.getByRole('button', { name: /edit title/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('Test Title');
        });

        it('should render placeholder when value is empty', () => {
            // Arrange
            const onSave = vi.fn();

            // Act
            renderWithTheme(<EditableTitle value='' onSave={onSave} placeholder='Enter title' />);

            // Assert
            const button = screen.getByRole('button', { name: /edit title/i });
            expect(button).toHaveTextContent('Enter title');
        });

        it('should be clickable when not disabled', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Assert
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should not be clickable when disabled', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} disabled={true} />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Assert
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });

        it('should enter edit mode on Enter key', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            const button = screen.getByRole('button', { name: /edit title/i });

            // Act
            button.focus();
            await user.keyboard('{Enter}');

            // Assert
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should enter edit mode on Space key', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            const button = screen.getByRole('button', { name: /edit title/i });

            // Act
            button.focus();
            await user.keyboard(' ');

            // Assert
            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
    });

    describe('Edit Mode', () => {
        it('should show text field when editing', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Assert
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
            expect(input).toHaveValue('Test Title');
        });

        it('should focus and select text when entering edit mode', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Assert
            const input = screen.getByRole('textbox') as HTMLInputElement;
            expect(input).toHaveFocus();
            expect(input.selectionStart).toBe(0);
            expect(input.selectionEnd).toBe('Test Title'.length);
        });

        it('should call onSave when Enter is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockResolvedValue(undefined);
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'New Title{Enter}');

            // Assert
            await waitFor(() => {
                expect(onSave).toHaveBeenCalledWith('New Title');
            });
        });

        it('should cancel and restore value when Escape is pressed', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn();
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Modified Title{Escape}');

            // Assert
            expect(onSave).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: /edit title/i })).toHaveTextContent('Test Title');
        });

        it('should show error when value is empty', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockResolvedValue(undefined);
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.keyboard('{Enter}');

            // Assert
            expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
            expect(onSave).not.toHaveBeenCalled();
        });

        it('should show loading spinner during save', async () => {
            // Arrange
            const user = userEvent.setup();
            let resolvePromise: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            const onSave = vi.fn().mockReturnValue(savePromise);
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'New Title{Enter}');

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            // Cleanup
            resolvePromise!();
            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });

        it('should display error message on save failure', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockRejectedValue(new Error('Network error'));
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'New Title{Enter}');

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        it('should display generic error message on non-Error failure', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockRejectedValue('Unknown error');
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'New Title{Enter}');

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to save')).toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should trim whitespace before saving', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockResolvedValue(undefined);
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), '  New Title  {Enter}');

            // Assert
            await waitFor(() => {
                expect(onSave).toHaveBeenCalledWith('New Title');
            });
        });

        it('should not save if value unchanged', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockResolvedValue(undefined);
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.keyboard('{Enter}');

            // Assert
            expect(onSave).not.toHaveBeenCalled();
            expect(screen.getByRole('button', { name: /edit title/i })).toBeInTheDocument();
        });

        it('should save on blur', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockResolvedValue(undefined);
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Act
            await user.clear(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'New Title');
            await user.tab();

            // Assert
            await waitFor(() => {
                expect(onSave).toHaveBeenCalledWith('New Title');
            });
        });

        it('should respect maxLength prop', async () => {
            // Arrange
            const user = userEvent.setup();
            const onSave = vi.fn().mockResolvedValue(undefined);
            renderWithTheme(<EditableTitle value='Test' onSave={onSave} maxLength={10} />);
            await user.click(screen.getByRole('button', { name: /edit title/i }));

            // Assert
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('maxLength', '10');
        });

        it('should use custom aria-label', () => {
            // Arrange
            const onSave = vi.fn();

            // Act
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} aria-label='Custom label' />);

            // Assert
            const button = screen.getByRole('button', { name: 'Custom label' });
            expect(button).toBeInTheDocument();
        });

        it('should apply custom id', () => {
            // Arrange
            const onSave = vi.fn();

            // Act
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} id='custom-title' />);

            // Assert
            const button = screen.getByRole('button', { name: /edit title/i });
            expect(button).toHaveAttribute('id', 'custom-title');
        });

        it('should update editValue when value prop changes', async () => {
            // Arrange
            const onSave = vi.fn();
            const { rerender } = renderWithTheme(<EditableTitle value='Initial Title' onSave={onSave} />);

            // Act
            rerender(
                <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
                    <EditableTitle value='Updated Title' onSave={onSave} />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByRole('button', { name: /edit title/i })).toHaveTextContent('Updated Title');
        });
    });

    describe('Theme Support', () => {
        it('should adapt to light theme', () => {
            // Arrange
            const onSave = vi.fn();

            // Act
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />, 'light');

            // Assert
            expect(screen.getByRole('button', { name: /edit title/i })).toBeInTheDocument();
        });

        it('should adapt to dark theme', () => {
            // Arrange
            const onSave = vi.fn();

            // Act
            renderWithTheme(<EditableTitle value='Test Title' onSave={onSave} />, 'dark');

            // Assert
            expect(screen.getByRole('button', { name: /edit title/i })).toBeInTheDocument();
        });
    });
});
