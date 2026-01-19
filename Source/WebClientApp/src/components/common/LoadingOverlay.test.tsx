import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadingOverlay } from './LoadingOverlay';

const LightThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'light' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const DarkThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme({ palette: { mode: 'dark' } });
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('LoadingOverlay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render with display flex when open is true', () => {
            // Arrange
            const open = true;

            // Act
            const { container } = render(
                <LightThemeWrapper>
                    <LoadingOverlay open={open} />
                </LightThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toBeInTheDocument();
            expect(overlay).toHaveStyle({ display: 'flex' });
        });

        it('should render with display none when open is false', () => {
            // Arrange
            const open = false;

            // Act
            const { container } = render(
                <LightThemeWrapper>
                    <LoadingOverlay open={open} />
                </LightThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toBeInTheDocument();
            expect(overlay).toHaveStyle({ display: 'none' });
        });
    });

    describe('Loading Indicator', () => {
        it('should render circular progress indicator when open', () => {
            // Arrange
            const open = true;

            // Act
            render(
                <LightThemeWrapper>
                    <LoadingOverlay open={open} />
                </LightThemeWrapper>
            );

            // Assert
            const progressIndicator = screen.getByRole('progressbar');
            expect(progressIndicator).toBeInTheDocument();
        });

        it('should render progress indicator with default size', () => {
            // Arrange & Act
            render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} />
                </LightThemeWrapper>
            );

            // Assert
            const progressIndicator = screen.getByRole('progressbar');
            expect(progressIndicator).toBeInTheDocument();
            expect(progressIndicator).toHaveClass('MuiCircularProgress-root');
        });

        it('should accept custom size prop', () => {
            // Arrange
            const customSize = 60;

            // Act
            render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} size={customSize} />
                </LightThemeWrapper>
            );

            // Assert
            const progressIndicator = screen.getByRole('progressbar');
            expect(progressIndicator).toBeInTheDocument();
        });
    });

    describe('Message Display', () => {
        it('should display message when provided', () => {
            // Arrange
            const message = 'Loading user data...';

            // Act
            render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} message={message} />
                </LightThemeWrapper>
            );

            // Assert
            expect(screen.getByText(message)).toBeInTheDocument();
        });

        it('should not render message element when message is not provided', () => {
            // Arrange & Act
            render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} />
                </LightThemeWrapper>
            );

            // Assert
            const typography = screen.queryByRole('paragraph');
            expect(typography).not.toBeInTheDocument();
        });
    });

    describe('Theme Support', () => {
        it('should apply light theme backdrop color', () => {
            // Arrange
            const backdropOpacity = 0.7;

            // Act
            const { container } = render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} backdropOpacity={backdropOpacity} />
                </LightThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toHaveStyle({ backgroundColor: `rgba(255, 255, 255, ${backdropOpacity})` });
        });

        it('should apply dark theme backdrop color', () => {
            // Arrange
            const backdropOpacity = 0.7;

            // Act
            const { container } = render(
                <DarkThemeWrapper>
                    <LoadingOverlay open={true} backdropOpacity={backdropOpacity} />
                </DarkThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toHaveStyle({ backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` });
        });

        it('should apply custom backdrop opacity', () => {
            // Arrange
            const customOpacity = 0.5;

            // Act
            const { container } = render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} backdropOpacity={customOpacity} />
                </LightThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toHaveStyle({ backgroundColor: `rgba(255, 255, 255, ${customOpacity})` });
        });
    });

    describe('Accessibility', () => {
        it('should have progressbar role for loading indicator', () => {
            // Arrange & Act
            render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} />
                </LightThemeWrapper>
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should block pointer events when open', () => {
            // Arrange & Act
            const { container } = render(
                <LightThemeWrapper>
                    <LoadingOverlay open={true} />
                </LightThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toHaveStyle({ pointerEvents: 'auto' });
        });

        it('should not block pointer events when closed', () => {
            // Arrange & Act
            const { container } = render(
                <LightThemeWrapper>
                    <LoadingOverlay open={false} />
                </LightThemeWrapper>
            );

            // Assert
            const overlay = container.querySelector('[class*="MuiBox-root"]');
            expect(overlay).toHaveStyle({ pointerEvents: 'none' });
        });
    });
});
