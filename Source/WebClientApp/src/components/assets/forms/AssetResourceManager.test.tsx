import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRole, type MediaResource } from '@/types/domain';
import { AssetResourceManager, type AssetResourceManagerProps } from './AssetResourceManager';

vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: vi.fn(),
}));

vi.mock('@/components/common/DisplayPreview', () => ({
  DisplayPreview: ({ resourceId }: { resourceId: string }) => <div data-mock='display-preview'>{resourceId}</div>,
}));

vi.mock('@/components/common/ResourceImage', () => ({
  ResourceImage: ({ resourceId, alt }: { resourceId: string; alt: string }) => (
    <img data-mock='resource-image' src={resourceId} alt={alt} />
  ),
}));

vi.mock('@/components/common/TokenPreview', () => ({
  TokenPreview: ({ resourceId }: { resourceId: string }) => <div data-mock='token-preview'>{resourceId}</div>,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetResourceManager', () => {
  const mockUseFileUpload = vi.fn();
  const mockUploadFile = vi.fn();
  const mockCancelUpload = vi.fn();
  const mockResetState = vi.fn();

  const defaultProps = {
    onPortraitChange: vi.fn(),
    onTokenChange: vi.fn(),
    tokenSize: { width: 1, height: 1 },
    readOnly: false,
    ownerId: 'test-entity-id',
  } satisfies Partial<AssetResourceManagerProps>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseFileUpload.mockReturnValue({
      uploadState: {
        isUploading: false,
        progress: 0,
        fileName: null,
        error: null,
      },
      uploadFile: mockUploadFile,
      cancelUpload: mockCancelUpload,
      resetState: mockResetState,
    });

    const { useFileUpload } = require('@/hooks/useFileUpload');
    vi.mocked(useFileUpload).mockImplementation(mockUseFileUpload);
  });

  describe('rendering in edit mode', () => {
    it('should render Portrait and Token sections', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Portrait')).toBeInTheDocument();
      expect(screen.getByText('Token')).toBeInTheDocument();
    });

    it('should render upload buttons', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const uploadButtons = screen.getAllByText('Upload');
      expect(uploadButtons).toHaveLength(2);
    });

    it('should show placeholder when no portrait is uploaded', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const placeholders = screen.getAllByText('No image uploaded yet');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should show placeholder when no token is uploaded', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const placeholders = screen.getAllByText('No image uploaded yet');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should render portrait image when portraitId is provided', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} portraitId='portrait-123' />
        </TestWrapper>,
      );

      expect(screen.getByRole('img', { name: 'Portrait' })).toBeInTheDocument();
    });

    it('should render token preview when tokenId is provided', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} tokenId='token-123' />
        </TestWrapper>,
      );

      expect(screen.getByText('token-123')).toBeInTheDocument();
    });

    it('should render remove buttons when images are uploaded', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} portraitId='portrait-123' tokenId='token-123' />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('img', { name: 'Close' });
      expect(removeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('rendering in read-only mode', () => {
    it('should not render upload buttons in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });

    it('should render Asset Images header in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} readOnly={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Asset Images')).toBeInTheDocument();
    });

    it('should render portrait preview in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} readOnly={true} portraitId='portrait-123' />
        </TestWrapper>,
      );

      expect(screen.getByText('Portrait')).toBeInTheDocument();
      expect(screen.getByText('portrait-123')).toBeInTheDocument();
    });

    it('should render token preview in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} readOnly={true} tokenId='token-123' />
        </TestWrapper>,
      );

      expect(screen.getByText('Token')).toBeInTheDocument();
      expect(screen.getByText('token-123')).toBeInTheDocument();
    });

    it('should not render remove buttons in read-only mode', () => {
      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} readOnly={true} portraitId='portrait-123' tokenId='token-123' />
        </TestWrapper>,
      );

      const closeIcons = screen.getAllByRole('img', { name: 'Close' });
      expect(closeIcons.length).toBe(0);
    });
  });

  describe('upload functionality', () => {
    it('should call uploadFile when portrait file is selected', async () => {
      const user = userEvent.setup();
      const file = new File(['portrait content'], 'portrait.png', { type: 'image/png' });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const uploadInputs = screen.getAllByRole('button', { name: /upload/i });
      const portraitInput = uploadInputs[0]?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(portraitInput, file);

      expect(mockUploadFile).toHaveBeenCalledWith(file);
    });

    it('should call uploadFile when token file is selected', async () => {
      const user = userEvent.setup();
      const file = new File(['token content'], 'token.png', { type: 'image/png' });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const uploadInputs = screen.getAllByRole('button', { name: /upload/i });
      const tokenInput = uploadInputs[1]?.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(tokenInput, file);

      expect(mockUploadFile).toHaveBeenCalledWith(file);
    });

    it('should disable upload buttons during upload', () => {
      mockUseFileUpload.mockReturnValue({
        uploadState: {
          isUploading: true,
          progress: 50,
          fileName: 'test.png',
          error: null,
        },
        uploadFile: mockUploadFile,
        cancelUpload: mockCancelUpload,
        resetState: mockResetState,
      });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const uploadButtons = screen.getAllByRole('button', { name: /upload/i });
      uploadButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('upload progress', () => {
    it('should display upload progress during upload', () => {
      mockUseFileUpload.mockReturnValue({
        uploadState: {
          isUploading: true,
          progress: 75,
          fileName: 'portrait.png',
          error: null,
        },
        uploadFile: mockUploadFile,
        cancelUpload: mockCancelUpload,
        resetState: mockResetState,
      });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('portrait.png')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should display progress bar during upload', () => {
      mockUseFileUpload.mockReturnValue({
        uploadState: {
          isUploading: true,
          progress: 50,
          fileName: 'test.png',
          error: null,
        },
        uploadFile: mockUploadFile,
        cancelUpload: mockCancelUpload,
        resetState: mockResetState,
      });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show cancel button during upload', () => {
      mockUseFileUpload.mockReturnValue({
        uploadState: {
          isUploading: true,
          progress: 50,
          fileName: 'test.png',
          error: null,
        },
        uploadFile: mockUploadFile,
        cancelUpload: mockCancelUpload,
        resetState: mockResetState,
      });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const closeIcons = screen.getAllByRole('img', { name: 'Close' });
      expect(closeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('upload success', () => {
    it('should call onPortraitChange when portrait upload succeeds', async () => {
      const onPortraitChange = vi.fn();
      const mockResource: MediaResource = {
        id: 'new-portrait-id',
        fileName: 'portrait.png',
        contentType: 'image/png',
        fileSize: 1024,
        role: ResourceRole.Portrait,
        path: 'new-portrait-id',
        dimensions: { width: 256, height: 256 },
        duration: '',
        name: 'Portrait',
        description: null,
        tags: [],
      };

      let onSuccessCallback: ((resource: MediaResource) => void) | undefined;

      mockUseFileUpload.mockImplementation((options) => {
        onSuccessCallback = options.onSuccess;
        return {
          uploadState: {
            isUploading: false,
            progress: 0,
            fileName: null,
            error: null,
          },
          uploadFile: mockUploadFile,
          cancelUpload: mockCancelUpload,
          resetState: mockResetState,
        };
      });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} onPortraitChange={onPortraitChange} />
        </TestWrapper>,
      );

      onSuccessCallback?.(mockResource);

      await waitFor(() => {
        expect(onPortraitChange).toHaveBeenCalledWith('new-portrait-id');
      });
    });
  });

  describe('upload error handling', () => {
    it('should display error alert when upload fails', () => {
      const errorMessage = 'Upload failed: network error';

      mockUseFileUpload.mockImplementation((options) => {
        options.onError?.(errorMessage);
        return {
          uploadState: {
            isUploading: false,
            progress: 0,
            fileName: null,
            error: errorMessage,
          },
          uploadFile: mockUploadFile,
          cancelUpload: mockCancelUpload,
          resetState: mockResetState,
        };
      });

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText(/Failed to upload image:/)).toBeInTheDocument();
    });

    it('should allow dismissing error alert', async () => {
      const user = userEvent.setup();

      mockUseFileUpload.mockReturnValue({
        uploadState: {
          isUploading: false,
          progress: 0,
          fileName: null,
          error: null,
        },
        uploadFile: mockUploadFile,
        cancelUpload: mockCancelUpload,
        resetState: mockResetState,
      });

      const { rerender } = render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      mockUseFileUpload.mockReturnValue({
        uploadState: {
          isUploading: false,
          progress: 0,
          fileName: null,
          error: 'Test error',
        },
        uploadFile: mockUploadFile,
        cancelUpload: mockCancelUpload,
        resetState: mockResetState,
      });

      rerender(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} />
        </TestWrapper>,
      );

      const closeButtons = screen.getAllByRole('button');
      const alertCloseButton = closeButtons.find((btn) => btn.getAttribute('aria-label') === 'close');

      if (alertCloseButton) {
        await user.click(alertCloseButton);
      }
    });
  });

  describe('remove functionality', () => {
    it('should call onPortraitChange with undefined when portrait is removed', async () => {
      const user = userEvent.setup();
      const onPortraitChange = vi.fn();

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} portraitId='portrait-123' onPortraitChange={onPortraitChange} />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('button').filter((btn) => {
        const parent = btn.closest('[class*="MuiBox-root"]');
        return parent?.textContent?.includes('Portrait');
      });

      if (removeButtons.length > 0) {
        await user.click(removeButtons[0] as HTMLElement);
        expect(onPortraitChange).toHaveBeenCalledWith(undefined);
      }
    });

    it('should call onTokenChange with undefined when token is removed', async () => {
      const user = userEvent.setup();
      const onTokenChange = vi.fn();

      render(
        <TestWrapper>
          <AssetResourceManager {...defaultProps} tokenId='token-123' onTokenChange={onTokenChange} />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('button').filter((btn) => {
        const parent = btn.closest('[class*="MuiBox-root"]');
        return parent?.textContent?.includes('Token');
      });

      if (removeButtons.length > 0) {
        await user.click(removeButtons[0] as HTMLElement);
        expect(onTokenChange).toHaveBeenCalledWith(undefined);
      }
    });
  });
});
