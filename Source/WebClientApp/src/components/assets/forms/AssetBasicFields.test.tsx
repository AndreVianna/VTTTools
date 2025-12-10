import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetBasicFields, type AssetBasicFieldsProps } from './AssetBasicFields';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetBasicFields', () => {
  const defaultProps: AssetBasicFieldsProps = {
    name: 'Test Asset',
    description: 'Test description',
    onNameChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    isPublic: true,
    isPublished: true,
    onIsPublicChange: vi.fn(),
    onIsPublishedChange: vi.fn(),
    readOnly: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering in edit mode', () => {
    it('should render name and description text fields', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    });

    it('should display current name and description values', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Test Asset');
      expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('Test description');
    });

    it('should show name field as required', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} />
        </TestWrapper>,
      );

      const nameField = screen.getByRole('textbox', { name: /name/i });
      expect(nameField).toHaveAttribute('required');
    });

    it('should display helper text for name field', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Required - minimum 3 characters')).toBeInTheDocument();
    });

    it('should display helper text for description field', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Brief description of this asset')).toBeInTheDocument();
    });

    it('should render visibility fields inline', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /private/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /draft/i })).toBeInTheDocument();
    });
  });

  describe('name field validation', () => {
    it('should show error state when name is less than 3 characters', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} name='ab' />
        </TestWrapper>,
      );

      const nameField = screen.getByRole('textbox', { name: /name/i });
      expect(nameField).toHaveAttribute('aria-invalid', 'true');
    });

    it('should not show error state when name is empty', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} name='' />
        </TestWrapper>,
      );

      const nameField = screen.getByRole('textbox', { name: /name/i });
      expect(nameField).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('should not show error state when name is 3 or more characters', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} name='abc' />
        </TestWrapper>,
      );

      const nameField = screen.getByRole('textbox', { name: /name/i });
      expect(nameField).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('user interactions in edit mode', () => {
    it('should call onNameChange when name field is edited', async () => {
      const user = userEvent.setup();
      const onNameChange = vi.fn();

      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} name='' onNameChange={onNameChange} />
        </TestWrapper>,
      );

      const nameField = screen.getByRole('textbox', { name: /name/i });
      await user.type(nameField, 'abc');

      expect(onNameChange).toHaveBeenCalled();
      expect(onNameChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should call onDescriptionChange when description field is edited', async () => {
      const user = userEvent.setup();
      const onDescriptionChange = vi.fn();

      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} description='' onDescriptionChange={onDescriptionChange} />
        </TestWrapper>,
      );

      const descriptionField = screen.getByRole('textbox', { name: /description/i });
      await user.type(descriptionField, 'abc');

      expect(onDescriptionChange).toHaveBeenCalled();
      expect(onDescriptionChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should call onIsPublicChange when private checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onIsPublicChange = vi.fn();

      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} isPublic={true} onIsPublicChange={onIsPublicChange} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      await user.click(privateCheckbox);

      expect(onIsPublicChange).toHaveBeenCalledWith(false);
    });

    it('should call onIsPublishedChange when draft checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onIsPublishedChange = vi.fn();

      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} isPublished={true} onIsPublishedChange={onIsPublishedChange} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      await user.click(draftCheckbox);

      expect(onIsPublishedChange).toHaveBeenCalledWith(false);
    });
  });

  describe('rendering in read-only mode', () => {
    it('should not render text fields in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /description/i })).not.toBeInTheDocument();
    });

    it('should display name as static text in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });

    it('should display description as static text in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render visibility fields in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Visibility')).toBeInTheDocument();
    });
  });

  describe('visibility field integration', () => {
    it('should pass correct isPublic value to visibility fields', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} isPublic={false} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      expect(privateCheckbox).toBeChecked();
    });

    it('should pass correct isPublished value to visibility fields', () => {
      render(
        <TestWrapper>
          <AssetBasicFields {...defaultProps} isPublished={false} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      expect(draftCheckbox).toBeChecked();
    });
  });
});
