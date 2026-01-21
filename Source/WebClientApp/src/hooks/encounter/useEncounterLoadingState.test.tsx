/**
 * useEncounterLoadingState Hook Tests
 * Tests loading/error state rendering for encounter pages
 */

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEncounterLoadingState, EncounterLoadingState } from './useEncounterLoadingState';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('EncounterLoadingState Component', () => {
    describe('Loading state', () => {
        it('should render loading spinner when isLoading is true', () => {
            // Arrange & Act
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={true}
                    isError={false}
                    hasNoData={false}
                />
            );

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByText('Loading encounter...')).toBeInTheDocument();
        });

        it('should render custom loading message when provided', () => {
            // Arrange & Act
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={true}
                    isError={false}
                    hasNoData={false}
                    loadingMessage="Custom loading message"
                />
            );

            // Assert
            expect(screen.getByText('Custom loading message')).toBeInTheDocument();
        });
    });

    describe('Error state', () => {
        it('should render error message when isError is true', () => {
            // Arrange & Act
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={false}
                    isError={true}
                    hasNoData={false}
                    error={{ message: 'Test error message' }}
                />
            );

            // Assert
            expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
            expect(screen.getByText('Test error message')).toBeInTheDocument();
        });

        it('should render error message when hasNoData is true', () => {
            // Arrange & Act
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={false}
                    isError={false}
                    hasNoData={true}
                />
            );

            // Assert
            expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
            expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
        });

        it('should render custom error message when provided', () => {
            // Arrange & Act
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={false}
                    isError={true}
                    hasNoData={false}
                    errorMessage="Custom error message"
                />
            );

            // Assert
            expect(screen.getByText('Custom error message')).toBeInTheDocument();
        });

        it('should render Go Back button when onGoBack is provided', () => {
            // Arrange
            const onGoBack = vi.fn();
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={false}
                    isError={true}
                    hasNoData={false}
                    onGoBack={onGoBack}
                />
            );

            // Act
            const button = screen.getByRole('button', { name: /go back/i });
            fireEvent.click(button);

            // Assert
            expect(onGoBack).toHaveBeenCalledTimes(1);
        });

        it('should not render Go Back button when onGoBack is not provided', () => {
            // Arrange & Act
            renderWithTheme(
                <EncounterLoadingState
                    isLoading={false}
                    isError={true}
                    hasNoData={false}
                />
            );

            // Assert
            expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
        });
    });

    describe('Ready state', () => {
        it('should render nothing when data is ready', () => {
            // Arrange & Act
            const { container } = renderWithTheme(
                <EncounterLoadingState
                    isLoading={false}
                    isError={false}
                    hasNoData={false}
                />
            );

            // Assert
            expect(container.firstChild).toBeNull();
        });
    });
});

describe('useEncounterLoadingState Hook', () => {
    const TestComponent: React.FC<{
        isLoading: boolean;
        isError: boolean;
        hasNoData: boolean;
        error?: unknown;
        onGoBack?: () => void;
    }> = (props) => {
        const loadingState = useEncounterLoadingState(props);

        if (loadingState) {
            return <>{loadingState}</>;
        }

        return <div data-testid="content">Ready content</div>;
    };

    it('should return loading state component when isLoading is true', () => {
        // Arrange & Act
        renderWithTheme(
            <TestComponent
                isLoading={true}
                isError={false}
                hasNoData={false}
            />
        );

        // Assert
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('should return error state component when isError is true', () => {
        // Arrange & Act
        renderWithTheme(
            <TestComponent
                isLoading={false}
                isError={true}
                hasNoData={false}
            />
        );

        // Assert
        expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('should return error state component when hasNoData is true', () => {
        // Arrange & Act
        renderWithTheme(
            <TestComponent
                isLoading={false}
                isError={false}
                hasNoData={true}
            />
        );

        // Assert
        expect(screen.getByText('Failed to load encounter')).toBeInTheDocument();
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('should return null when data is ready', () => {
        // Arrange & Act
        renderWithTheme(
            <TestComponent
                isLoading={false}
                isError={false}
                hasNoData={false}
            />
        );

        // Assert
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByText('Failed to load encounter')).not.toBeInTheDocument();
        expect(screen.getByTestId('content')).toBeInTheDocument();
    });
});
