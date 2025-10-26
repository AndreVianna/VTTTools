import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { EditableSceneName } from './EditableSceneName';

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('EditableSceneName', () => {
    it('should display scene name in view mode by default', () => {
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        expect(screen.getByText('Test Scene')).toBeInTheDocument();
    });

    it('should show edit icon on hover when not disabled', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        const container = screen.getByText('Test Scene').closest('div');
        expect(container).toBeInTheDocument();

        if (container) {
            await user.hover(container);
        }

        expect(screen.getByLabelText('Edit scene name')).toBeInTheDocument();
    });

    it('should enter edit mode when clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        const textElement = screen.getByText('Test Scene');
        await user.click(textElement);

        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('Test Scene');
    });

    it('should auto-select text when entering edit mode', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        await user.click(screen.getByText('Test Scene'));

        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe('Test Scene'.length);
    });

    it('should call onChange when saving with Enter key', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        await user.click(screen.getByText('Test Scene'));
        const input = screen.getByRole('textbox');

        await user.clear(input);
        await user.type(input, 'New Scene Name{Enter}');

        expect(onChange).toHaveBeenCalledWith('New Scene Name');
    });

    it('should call onChange when saving on blur', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onBlur = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} onBlur={onBlur} />);

        await user.click(screen.getByText('Test Scene'));
        const input = screen.getByRole('textbox');

        await user.clear(input);
        await user.type(input, 'New Scene Name');
        await user.tab();

        expect(onChange).toHaveBeenCalledWith('New Scene Name');
        expect(onBlur).toHaveBeenCalled();
    });

    it('should revert changes when Escape is pressed', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        await user.click(screen.getByText('Test Scene'));
        const input = screen.getByRole('textbox');

        await user.clear(input);
        await user.type(input, 'Modified Name{Escape}');

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByText('Test Scene')).toBeInTheDocument();
    });

    it('should not call onChange if value has not changed', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        await user.click(screen.getByText('Test Scene'));

        expect(screen.getByRole('textbox')).toBeInTheDocument();

        await user.tab();

        expect(onChange).not.toHaveBeenCalled();
    });

    it('should trim whitespace when saving', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />);

        await user.click(screen.getByText('Test Scene'));

        await user.clear(screen.getByRole('textbox'));
        await user.type(screen.getByRole('textbox'), '  New Scene  {Enter}');

        expect(onChange).toHaveBeenCalledWith('New Scene');
    });

    it('should not enter edit mode when disabled', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} disabled={true} />);

        const textElement = screen.getByText('Test Scene');
        await user.click(textElement);

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('should not show edit icon when disabled', () => {
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} disabled={true} />);

        expect(screen.queryByLabelText('Edit scene name')).not.toBeInTheDocument();
    });

    it('should adapt to light theme', () => {
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />, 'light');

        const text = screen.getByText('Test Scene');
        expect(text).toBeInTheDocument();
    });

    it('should adapt to dark theme', () => {
        const onChange = vi.fn();
        renderWithTheme(<EditableSceneName value="Test Scene" onChange={onChange} />, 'dark');

        const text = screen.getByText('Test Scene');
        expect(text).toBeInTheDocument();
    });
});
