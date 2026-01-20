import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioToolbar } from './StudioToolbar';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('StudioToolbar', () => {
  type ActionFn = () => void;

  let mockOnBack: ReturnType<typeof vi.fn<ActionFn>>;
  let mockOnSave: ReturnType<typeof vi.fn<ActionFn>>;
  let mockOnDelete: ReturnType<typeof vi.fn<ActionFn>>;
  let mockOnPublish: ReturnType<typeof vi.fn<ActionFn>>;
  let mockOnUnpublish: ReturnType<typeof vi.fn<ActionFn>>;

  beforeEach(() => {
    mockOnBack = vi.fn<ActionFn>();
    mockOnSave = vi.fn<ActionFn>();
    mockOnDelete = vi.fn<ActionFn>();
    mockOnPublish = vi.fn<ActionFn>();
    mockOnUnpublish = vi.fn<ActionFn>();
  });

  describe('rendering', () => {
    it('should render back button', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /back to library/i })).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should render title for existing asset', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });

    it('should render "New Asset" title when isNew is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={true}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('New Asset')).toBeInTheDocument();
      expect(screen.queryByText('Test Asset')).not.toBeInTheDocument();
    });

    it('should show dirty indicator when isDirty is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should not show dirty indicator when isDirty is false', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('status chip', () => {
    it('should show Published chip when isPublished is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={true}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should show Draft chip when isPublished is false', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should not show status chip when isNew is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={true}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByText('Published')).not.toBeInTheDocument();
      expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    });
  });

  describe('button interactions', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const backButton = screen.getByRole('button', { name: /back to library/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete button', () => {
    it('should render delete button when onDelete is provided and not new', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={mockOnDelete}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /delete asset/i })).toBeInTheDocument();
    });

    it('should not render delete button when onDelete is null', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /delete asset/i })).not.toBeInTheDocument();
    });

    it('should not render delete button when isNew is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={true}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={mockOnDelete}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /delete asset/i })).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={mockOnDelete}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const deleteButton = screen.getByRole('button', { name: /delete asset/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('publish button', () => {
    it('should render publish button when onPublish is provided and asset is not published', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={mockOnPublish}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
    });

    it('should not render publish button when onPublish is null', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /^publish$/i })).not.toBeInTheDocument();
    });

    it('should not render publish button when isNew is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={true}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={mockOnPublish}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument();
    });

    it('should not render publish button when isPublished is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={true}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={mockOnPublish}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /^publish$/i })).not.toBeInTheDocument();
    });

    it('should call onPublish when publish button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={mockOnPublish}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);

      expect(mockOnPublish).toHaveBeenCalledTimes(1);
    });
  });

  describe('unpublish button', () => {
    it('should render unpublish button when onUnpublish is provided and asset is published', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={true}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={mockOnUnpublish}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /unpublish/i })).toBeInTheDocument();
    });

    it('should not render unpublish button when onUnpublish is null', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={true}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /unpublish/i })).not.toBeInTheDocument();
    });

    it('should not render unpublish button when isNew is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={true}
            isDirty={false}
            isPublished={true}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={mockOnUnpublish}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /unpublish/i })).not.toBeInTheDocument();
    });

    it('should not render unpublish button when isPublished is false', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={mockOnUnpublish}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /unpublish/i })).not.toBeInTheDocument();
    });

    it('should call onUnpublish when unpublish button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={true}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={mockOnUnpublish}
          />
        </TestWrapper>,
      );

      const unpublishButton = screen.getByRole('button', { name: /unpublish/i });
      await user.click(unpublishButton);

      expect(mockOnUnpublish).toHaveBeenCalledTimes(1);
    });
  });

  describe('save button states', () => {
    it('should disable save button when isDirty is false', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when isDirty is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should disable save button when isSaving is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={true}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      const saveButton = screen.getByRole('button', { name: /saving/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show "Saving..." text when isSaving is true', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={true}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show "Save" text when isSaving is false', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </ThemeProvider>,
      );

      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </ThemeProvider>,
      );

      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });
  });

  describe('combined states', () => {
    it('should handle all features enabled simultaneously', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={false}
            isDirty={true}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={mockOnDelete}
            onPublish={mockOnPublish}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /back to library/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete asset/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should handle minimal configuration', () => {
      render(
        <TestWrapper>
          <StudioToolbar
            title="Test Asset"
            isNew={true}
            isDirty={false}
            isPublished={false}
            isSaving={false}
            onBack={mockOnBack}
            onSave={mockOnSave}
            onDelete={null}
            onPublish={null}
            onUnpublish={null}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /back to library/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    });
  });
});
