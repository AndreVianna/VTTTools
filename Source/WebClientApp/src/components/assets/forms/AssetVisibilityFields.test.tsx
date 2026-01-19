import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetVisibilityFields, type AssetVisibilityFieldsProps } from './AssetVisibilityFields';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetVisibilityFields', () => {
  const defaultProps: AssetVisibilityFieldsProps = {
    isPublic: true,
    isPublished: true,
    onIsPublicChange: vi.fn<(value: boolean) => void>(),
    onIsPublishedChange: vi.fn<(value: boolean) => void>(),
    readOnly: false,
    inline: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering in standard mode', () => {
    it('should render visibility section header', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Visibility')).toBeInTheDocument();
    });

    it('should render Private checkbox with full label', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /private \(only visible to you\)/i })).toBeInTheDocument();
    });

    it('should render Draft checkbox with full label', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /draft \(not approved for use\)/i })).toBeInTheDocument();
    });

    it('should show info alert when draft and public', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={false} isPublic={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Draft assets can still be shared publicly')).toBeInTheDocument();
    });

    it('should not show info alert when published', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={true} isPublic={true} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Draft assets can still be shared publicly')).not.toBeInTheDocument();
    });

    it('should not show info alert when draft and private', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={false} isPublic={false} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Draft assets can still be shared publicly')).not.toBeInTheDocument();
    });
  });

  describe('rendering in inline mode', () => {
    it('should render compact checkboxes in inline mode', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} inline={true} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox', { name: /private/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /draft/i })).toBeInTheDocument();
    });

    it('should not render visibility header in inline mode', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} inline={true} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Visibility')).not.toBeInTheDocument();
    });

    it('should not show info alert in inline mode', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} inline={true} isPublished={false} isPublic={true} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Draft assets can still be shared publicly')).not.toBeInTheDocument();
    });
  });

  describe('rendering in read-only mode', () => {
    it('should not render checkboxes in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should display visibility header in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Visibility')).toBeInTheDocument();
    });

    it('should display Public chip when isPublic is true', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} readOnly={true} isPublic={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('should display Private chip when isPublic is false', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} readOnly={true} isPublic={false} />
        </TestWrapper>,
      );

      expect(screen.getByText('Private')).toBeInTheDocument();
    });

    it('should display Published chip when isPublished is true', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} readOnly={true} isPublished={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should display Draft chip when isPublished is false', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} readOnly={true} isPublished={false} />
        </TestWrapper>,
      );

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('checkbox state in standard mode', () => {
    it('should show Private checkbox unchecked when isPublic is true', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublic={true} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      expect(privateCheckbox).not.toBeChecked();
    });

    it('should show Private checkbox checked when isPublic is false', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublic={false} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      expect(privateCheckbox).toBeChecked();
    });

    it('should show Draft checkbox unchecked when isPublished is true', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={true} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      expect(draftCheckbox).not.toBeChecked();
    });

    it('should show Draft checkbox checked when isPublished is false', () => {
      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={false} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      expect(draftCheckbox).toBeChecked();
    });
  });

  describe('user interactions in standard mode', () => {
    it('should call onIsPublicChange with false when Private checkbox is checked', async () => {
      const user = userEvent.setup();
      const onIsPublicChange = vi.fn<(value: boolean) => void>();

      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublic={true} onIsPublicChange={onIsPublicChange} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      await user.click(privateCheckbox);

      expect(onIsPublicChange).toHaveBeenCalledWith(false);
    });

    it('should call onIsPublicChange with true when Private checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const onIsPublicChange = vi.fn<(value: boolean) => void>();

      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublic={false} onIsPublicChange={onIsPublicChange} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      await user.click(privateCheckbox);

      expect(onIsPublicChange).toHaveBeenCalledWith(true);
    });

    it('should call onIsPublishedChange with false when Draft checkbox is checked', async () => {
      const user = userEvent.setup();
      const onIsPublishedChange = vi.fn<(value: boolean) => void>();

      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={true} onIsPublishedChange={onIsPublishedChange} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      await user.click(draftCheckbox);

      expect(onIsPublishedChange).toHaveBeenCalledWith(false);
    });

    it('should call onIsPublishedChange with true when Draft checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const onIsPublishedChange = vi.fn<(value: boolean) => void>();

      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} isPublished={false} onIsPublishedChange={onIsPublishedChange} />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      await user.click(draftCheckbox);

      expect(onIsPublishedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('user interactions in inline mode', () => {
    it('should call onIsPublicChange in inline mode', async () => {
      const user = userEvent.setup();
      const onIsPublicChange = vi.fn<(value: boolean) => void>();

      render(
        <TestWrapper>
          <AssetVisibilityFields {...defaultProps} inline={true} isPublic={true} onIsPublicChange={onIsPublicChange} />
        </TestWrapper>,
      );

      const privateCheckbox = screen.getByRole('checkbox', { name: /private/i });
      await user.click(privateCheckbox);

      expect(onIsPublicChange).toHaveBeenCalledWith(false);
    });

    it('should call onIsPublishedChange in inline mode', async () => {
      const user = userEvent.setup();
      const onIsPublishedChange = vi.fn<(value: boolean) => void>();

      render(
        <TestWrapper>
          <AssetVisibilityFields
            {...defaultProps}
            inline={true}
            isPublished={true}
            onIsPublishedChange={onIsPublishedChange}
          />
        </TestWrapper>,
      );

      const draftCheckbox = screen.getByRole('checkbox', { name: /draft/i });
      await user.click(draftCheckbox);

      expect(onIsPublishedChange).toHaveBeenCalledWith(false);
    });
  });
});
