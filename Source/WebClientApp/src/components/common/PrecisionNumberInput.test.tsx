import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrecisionNumberInput, type PrecisionNumberInputProps } from './PrecisionNumberInput';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const DarkThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'dark' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const defaultProps: PrecisionNumberInputProps = {
    id: 'test-input',
    label: 'Test Value',
    value: 5,
    onChange: vi.fn<(value: number) => void>(),
};

const renderComponent = (props: Partial<PrecisionNumberInputProps> = {}, darkMode = false) => {
    const Wrapper = darkMode ? DarkThemeWrapper : TestWrapper;
    return render(
        <Wrapper>
            <PrecisionNumberInput {...defaultProps} {...props} />
        </Wrapper>,
    );
};

describe('PrecisionNumberInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // =========================================================================
    // Rendering Tests
    // =========================================================================
    describe('Rendering', () => {
        it('should render with label', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByLabelText('Test Value')).toBeInTheDocument();
        });

        it('should render with correct initial value', () => {
            // Arrange & Act
            renderComponent({ value: 42 });

            // Assert
            expect(screen.getByRole('spinbutton')).toHaveValue(42);
        });

        it('should render with correct id', () => {
            // Arrange & Act
            renderComponent({ id: 'custom-id' });

            // Assert
            expect(screen.getByRole('spinbutton')).toHaveAttribute('id', 'custom-id');
        });

        it('should render disabled when disabled prop is true', () => {
            // Arrange & Act
            renderComponent({ disabled: true });

            // Assert
            expect(screen.getByRole('spinbutton')).toBeDisabled();
        });
    });

    // =========================================================================
    // User Input Handling Tests
    // =========================================================================
    describe('User Input Handling', () => {
        it('should update input value on user typing', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();
            const input = screen.getByRole('spinbutton');

            // Act
            await user.clear(input);
            await user.type(input, '123');

            // Assert
            expect(input).toHaveValue(123);
        });

        it('should call onChange with parsed value on blur', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.clear(input);
            await user.type(input, '25');
            await user.tab();

            // Assert
            expect(onChange).toHaveBeenCalledWith(25);
        });

        it('should revert to original value on blur when input is invalid', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 10 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.clear(input);
            await user.type(input, 'abc');
            await user.tab();

            // Assert
            expect(onChange).not.toHaveBeenCalled();
            expect(input).toHaveValue(10);
        });

        it('should not call onChange on blur when value is unchanged', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.tab();

            // Assert
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    // =========================================================================
    // Precision/Step Behavior Tests
    // =========================================================================
    describe('Precision/Step Behavior', () => {
        it('should increment by 1 with ArrowUp key', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{ArrowUp}');

            // Assert
            expect(onChange).toHaveBeenCalledWith(6);
        });

        it('should decrement by 1 with ArrowDown key', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{ArrowDown}');

            // Assert
            expect(onChange).toHaveBeenCalledWith(4);
        });

        it('should increment by 10 with Shift+ArrowUp', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{Shift>}{ArrowUp}{/Shift}');

            // Assert
            expect(onChange).toHaveBeenCalledWith(15);
        });

        it('should increment by 0.1 with Ctrl+ArrowUp', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{Control>}{ArrowUp}{/Control}');

            // Assert
            expect(onChange).toHaveBeenCalledWith(5.1);
        });

        it('should increment by 0.01 with Alt+ArrowUp', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{Alt>}{ArrowUp}{/Alt}');

            // Assert
            expect(onChange).toHaveBeenCalledWith(5.01);
        });

        it('should increment by 0.001 with Ctrl+Alt+ArrowUp', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{Control>}{Alt>}{ArrowUp}{/Alt}{/Control}');

            // Assert
            expect(onChange).toHaveBeenCalledWith(5.001);
        });
    });

    // =========================================================================
    // Min/Max Constraint Tests
    // =========================================================================
    describe('Min/Max Constraints', () => {
        it('should clamp value to min on ArrowDown', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 1, min: 0 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{ArrowDown}');
            await user.keyboard('{ArrowDown}');

            // Assert
            expect(onChange).toHaveBeenLastCalledWith(0);
        });

        it('should clamp value to max on ArrowUp', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 9, max: 10 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.click(input);
            await user.keyboard('{ArrowUp}');
            await user.keyboard('{ArrowUp}');

            // Assert
            expect(onChange).toHaveBeenLastCalledWith(10);
        });

        it('should clamp typed value to min on blur', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5, min: 0 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.clear(input);
            await user.type(input, '-10');
            await user.tab();

            // Assert
            expect(onChange).toHaveBeenCalledWith(0);
        });

        it('should clamp typed value to max on blur', async () => {
            // Arrange
            const onChange = vi.fn<(value: number) => void>();
            const user = userEvent.setup();
            renderComponent({ onChange, value: 5, max: 100 });
            const input = screen.getByRole('spinbutton');

            // Act
            await user.clear(input);
            await user.type(input, '150');
            await user.tab();

            // Assert
            expect(onChange).toHaveBeenCalledWith(100);
        });
    });

    // =========================================================================
    // Theme Support Tests
    // =========================================================================
    describe('Theme Support', () => {
        it('should render in light theme without errors', () => {
            // Arrange & Act
            renderComponent({}, false);

            // Assert
            expect(screen.getByRole('spinbutton')).toBeInTheDocument();
        });

        it('should render in dark theme without errors', () => {
            // Arrange & Act
            renderComponent({}, true);

            // Assert
            expect(screen.getByRole('spinbutton')).toBeInTheDocument();
        });
    });
});
