import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { EditableEncounterName } from './EditableEncounterName';

const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
  const theme = createTheme({ palette: { mode } });
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('EditableEncounterName', () => {
  it('should display encounter name in view mode by default', () => {
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    expect(screen.getByText('Test Encounter')).toBeInTheDocument();
  });

  it('should show edit icon on hover when not disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    const container = screen.getByText('Test Encounter').closest('div');
    expect(container).toBeInTheDocument();

    if (container) {
      await user.hover(container);
    }

    expect(screen.getByLabelText('Edit encounter name')).toBeInTheDocument();
  });

  it('should enter edit mode when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    const textElement = screen.getByText('Test Encounter');
    await user.click(textElement);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Encounter');
  });

  it('should auto-select text when entering edit mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    await user.click(screen.getByText('Test Encounter'));

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe('Test Encounter'.length);
  });

  it('should call onChange when saving with Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    await user.click(screen.getByText('Test Encounter'));
    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'New Encounter Name{Enter}');

    expect(onChange).toHaveBeenCalledWith('New Encounter Name');
  });

  it('should call onChange when saving on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    const onBlur = vi.fn<() => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} onBlur={onBlur} />);

    await user.click(screen.getByText('Test Encounter'));
    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'New Encounter Name');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith('New Encounter Name');
    expect(onBlur).toHaveBeenCalled();
  });

  it('should revert changes when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    await user.click(screen.getByText('Test Encounter'));
    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, 'Modified Name{Escape}');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Test Encounter')).toBeInTheDocument();
  });

  it('should not call onChange if value has not changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    await user.click(screen.getByText('Test Encounter'));

    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should trim whitespace when saving', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />);

    await user.click(screen.getByText('Test Encounter'));

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '  New Encounter  {Enter}');

    expect(onChange).toHaveBeenCalledWith('New Encounter');
  });

  it('should not enter edit mode when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} disabled={true} />);

    const textElement = screen.getByText('Test Encounter');
    await user.click(textElement);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not show edit icon when disabled', () => {
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} disabled={true} />);

    expect(screen.queryByLabelText('Edit encounter name')).not.toBeInTheDocument();
  });

  it('should adapt to light theme', () => {
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />, 'light');

    const text = screen.getByText('Test Encounter');
    expect(text).toBeInTheDocument();
  });

  it('should adapt to dark theme', () => {
    const onChange = vi.fn<(name: string) => void>();
    renderWithTheme(<EditableEncounterName value='Test Encounter' onChange={onChange} />, 'dark');

    const text = screen.getByText('Test Encounter');
    expect(text).toBeInTheDocument();
  });
});
