import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackgroundPanel, type BackgroundPanelProps } from './BackgroundPanel';

// Mock MUI icons to avoid file handle exhaustion in tests
vi.mock('@mui/icons-material', () => ({
  Pause: () => <span data-testid="pause-icon">PauseIcon</span>,
  PhotoCamera: () => <span data-testid="photo-camera-icon">PhotoCameraIcon</span>,
  PlayArrow: () => <span data-testid="play-arrow-icon">PlayArrowIcon</span>,
  Videocam: () => <span data-testid="videocam-icon">VideocamIcon</span>,
  VolumeOff: () => <span data-testid="volume-off-icon">VolumeOffIcon</span>,
  VolumeUp: () => <span data-testid="volume-up-icon">VolumeUpIcon</span>,
}));

// Mock video element methods
beforeEach(() => {
  window.HTMLMediaElement.prototype.play = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn<() => void>();
});

const TestWrapper: React.FC<{ children: React.ReactNode; mode?: 'light' | 'dark' }> = ({
  children,
  mode = 'light',
}) => {
  const theme = createTheme({ palette: { mode } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('BackgroundPanel', () => {
  let mockOnBackgroundUpload: ReturnType<typeof vi.fn<(file: File) => void>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnBackgroundUpload = vi.fn<(file: File) => void>();
  });

  const renderComponent = (props: Partial<BackgroundPanelProps> = {}) => {
    const defaultProps: BackgroundPanelProps = {
      onBackgroundUpload: mockOnBackgroundUpload,
    };

    return render(
      <TestWrapper>
        <BackgroundPanel {...defaultProps} {...props} />
      </TestWrapper>,
    );
  };

  describe('rendering with no background', () => {
    it('should render Background Image label when no background is set', () => {
      renderComponent();

      expect(screen.getByText('Background Image')).toBeInTheDocument();
    });

    it('should display DEFAULT badge when no background URL is provided', () => {
      renderComponent({ backgroundUrl: undefined });

      expect(screen.getByText('DEFAULT')).toBeInTheDocument();
    });

    it('should render change background button', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /change background/i })).toBeInTheDocument();
    });
  });

  describe('rendering with background image', () => {
    it('should not display DEFAULT badge when background URL is provided', () => {
      renderComponent({ backgroundUrl: '/custom/background.png' });

      expect(screen.queryByText('DEFAULT')).not.toBeInTheDocument();
    });

    it('should render Background Image label for image content type', () => {
      renderComponent({
        backgroundUrl: '/custom/background.png',
        backgroundContentType: 'image/png',
      });

      expect(screen.getByText('Background Image')).toBeInTheDocument();
    });

    it('should render change background button when image is set', () => {
      renderComponent({ backgroundUrl: '/custom/background.png' });

      expect(screen.getByRole('button', { name: /change background/i })).toBeInTheDocument();
    });
  });

  describe('rendering with video background', () => {
    it('should render Background Video label for video content type', () => {
      renderComponent({
        backgroundUrl: '/custom/background.mp4',
        backgroundContentType: 'video/mp4',
      });

      expect(screen.getByText('Background Video')).toBeInTheDocument();
    });

    it('should display VIDEO badge for video content', () => {
      renderComponent({
        backgroundUrl: '/custom/background.mp4',
        backgroundContentType: 'video/mp4',
      });

      expect(screen.getByText('VIDEO')).toBeInTheDocument();
    });

    it('should render video play/pause button for video background', () => {
      renderComponent({
        backgroundUrl: '/custom/background.mp4',
        backgroundContentType: 'video/mp4',
      });

      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    });

    it('should render mute/unmute button for video background', () => {
      renderComponent({
        backgroundUrl: '/custom/background.mp4',
        backgroundContentType: 'video/mp4',
      });

      expect(screen.getByRole('button', { name: /unmute/i })).toBeInTheDocument();
    });

    it('should not render video controls for image background', () => {
      renderComponent({
        backgroundUrl: '/custom/background.png',
        backgroundContentType: 'image/png',
      });

      expect(screen.queryByRole('button', { name: /play/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /unmute/i })).not.toBeInTheDocument();
    });
  });

  describe('background upload', () => {
    it('should call onBackgroundUpload when file is selected', async () => {
      renderComponent();

      const file = new File(['test'], 'background.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      expect(mockOnBackgroundUpload).toHaveBeenCalledWith(file);
    });

    it('should not call onBackgroundUpload when no file is selected', () => {
      renderComponent();

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [] } });

      expect(mockOnBackgroundUpload).not.toHaveBeenCalled();
    });

    it('should accept image and video file types', () => {
      renderComponent();

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      expect(input.accept).toBe('image/*,video/mp4,video/webm,video/ogg');
    });

    it('should clear input value after file selection', () => {
      renderComponent();

      const file = new File(['test'], 'background.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      expect(input.value).toBe('');
    });
  });

  describe('upload loading state', () => {
    it('should show loading indicator when uploading', () => {
      renderComponent({ isUploadingBackground: true });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should not show loading indicator when not uploading', () => {
      renderComponent({ isUploadingBackground: false });

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should disable change background button when uploading', () => {
      renderComponent({ isUploadingBackground: true });

      const changeButton = screen.getByRole('button', { name: /change background/i });
      expect(changeButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('video controls', () => {
    it('should toggle play/pause button text when clicked', async () => {
      const user = userEvent.setup();

      renderComponent({
        backgroundUrl: '/custom/background.mp4',
        backgroundContentType: 'video/mp4',
      });

      const playButton = screen.getByRole('button', { name: /play/i });
      await user.click(playButton);

      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('should toggle mute/unmute button text when clicked', async () => {
      const user = userEvent.setup();

      renderComponent({
        backgroundUrl: '/custom/background.mp4',
        backgroundContentType: 'video/mp4',
      });

      const muteButton = screen.getByRole('button', { name: /unmute/i });
      await user.click(muteButton);

      expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      render(
        <TestWrapper mode='dark'>
          <BackgroundPanel onBackgroundUpload={mockOnBackgroundUpload} />
        </TestWrapper>,
      );

      expect(screen.getByText('Background Image')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /change background/i })).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      render(
        <TestWrapper mode='light'>
          <BackgroundPanel onBackgroundUpload={mockOnBackgroundUpload} />
        </TestWrapper>,
      );

      expect(screen.getByText('Background Image')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /change background/i })).toBeInTheDocument();
    });
  });
});
