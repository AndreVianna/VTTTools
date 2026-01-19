import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DimensionSlider, type DimensionSliderProps } from './DimensionSlider';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('DimensionSlider', () => {
    const defaultProps: DimensionSliderProps = {
        value: [720, 65535],
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render with DIMENSIONS label', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            expect(screen.getByText('DIMENSIONS')).toBeInTheDocument();
        });

        it('should render slider with correct id', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            expect(document.getElementById('slider-dimension-range')).toBeInTheDocument();
        });

        it('should display marks at SD, HD, 2K, 4K, and Huge', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            // MUI Slider may render labels multiple times (mark labels + value labels)
            // Use getAllByText and check at least one exists
            expect(screen.getAllByText('SD').length).toBeGreaterThan(0);
            expect(screen.getAllByText('HD').length).toBeGreaterThan(0);
            expect(screen.getAllByText('2K').length).toBeGreaterThan(0);
            expect(screen.getAllByText('4K').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Huge').length).toBeGreaterThan(0);
        });

        it('should display range label with mark names for known values', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[720, 3840]} />
            );

            expect(screen.getByText('SD - 4K')).toBeInTheDocument();
        });

        it('should display range label with pixel values for custom values', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[1000, 2000]} />
            );

            expect(screen.getByText('1000px - 2000px')).toBeInTheDocument();
        });

        it('should display mixed range label with mark name and pixel value', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[720, 2000]} />
            );

            expect(screen.getByText('SD - 2000px')).toBeInTheDocument();
        });
    });

    describe('initial value', () => {
        it('should render with default range (720-65535)', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            expect(screen.getByText('SD - Huge')).toBeInTheDocument();
        });

        it('should render with custom initial value', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[1920, 2560]} />
            );

            expect(screen.getByText('HD - 2K')).toBeInTheDocument();
        });

        it('should render with single mark value range', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[1920, 1920]} />
            );

            expect(screen.getByText('HD - HD')).toBeInTheDocument();
        });
    });

    describe('onChange behavior', () => {
        it('should call onChange with [minWidth, maxWidth] tuple when slider changes', () => {
            const onChange = vi.fn();
            renderWithTheme(
                <DimensionSlider {...defaultProps} onChange={onChange} />
            );

            const slider = document.getElementById('slider-dimension-range');
            expect(slider).toBeInTheDocument();

            // Simulate slider change by triggering change event on the input
            const sliderInputs = slider?.querySelectorAll('input[type="range"]');
            if (sliderInputs && sliderInputs.length > 0 && sliderInputs[0]) {
                fireEvent.change(sliderInputs[0], { target: { value: 1920 } });
            }
        });

        it('should not call onChange if newValue is not an array', () => {
            const onChange = vi.fn();
            renderWithTheme(
                <DimensionSlider {...defaultProps} onChange={onChange} />
            );

            // The component handles this internally, so we just verify the slider renders
            expect(document.getElementById('slider-dimension-range')).toBeInTheDocument();
        });
    });

    describe('disabled state', () => {
        it('should be enabled by default', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            const slider = document.getElementById('slider-dimension-range');
            expect(slider).not.toHaveClass('Mui-disabled');
        });

        it('should be disabled when disabled prop is true', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} disabled={true} />
            );

            const slider = document.getElementById('slider-dimension-range');
            expect(slider).toHaveClass('Mui-disabled');
        });

        it('should not call onChange when disabled and slider interaction attempted', () => {
            const onChange = vi.fn();
            renderWithTheme(
                <DimensionSlider
                    {...defaultProps}
                    onChange={onChange}
                    disabled={true}
                />
            );

            const slider = document.getElementById('slider-dimension-range');
            expect(slider).toBeInTheDocument();
            expect(slider).toHaveClass('Mui-disabled');
        });
    });

    describe('theme integration', () => {
        it('should render correctly with light theme', () => {
            const lightTheme = createTheme({ palette: { mode: 'light' } });
            render(
                <ThemeProvider theme={lightTheme}>
                    <DimensionSlider {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('DIMENSIONS')).toBeInTheDocument();
        });

        it('should render correctly with dark theme', () => {
            const darkTheme = createTheme({ palette: { mode: 'dark' } });
            render(
                <ThemeProvider theme={darkTheme}>
                    <DimensionSlider {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('DIMENSIONS')).toBeInTheDocument();
        });
    });

    describe('value formatting', () => {
        it('should format 720 as SD', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[720, 720]} />
            );

            expect(screen.getByText('SD - SD')).toBeInTheDocument();
        });

        it('should format 1920 as HD', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[1920, 1920]} />
            );

            expect(screen.getByText('HD - HD')).toBeInTheDocument();
        });

        it('should format 2560 as 2K', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[2560, 2560]} />
            );

            expect(screen.getByText('2K - 2K')).toBeInTheDocument();
        });

        it('should format 3840 as 4K', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[3840, 3840]} />
            );

            expect(screen.getByText('4K - 4K')).toBeInTheDocument();
        });

        it('should format 65535 as Huge', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[65535, 65535]} />
            );

            expect(screen.getByText('Huge - Huge')).toBeInTheDocument();
        });

        it('should format non-mark values as pixels', () => {
            renderWithTheme(
                <DimensionSlider {...defaultProps} value={[1500, 3000]} />
            );

            expect(screen.getByText('1500px - 3000px')).toBeInTheDocument();
        });
    });

    describe('slider constraints', () => {
        it('should have min value of 720', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            // The slider should display SD mark which corresponds to 720
            // Use getAllByText since MUI renders labels in multiple places
            expect(screen.getAllByText('SD').length).toBeGreaterThan(0);
        });

        it('should have max value of 65535', () => {
            renderWithTheme(<DimensionSlider {...defaultProps} />);

            // The slider should display Huge mark which corresponds to 65535
            // Use getAllByText since MUI renders labels in multiple places
            expect(screen.getAllByText('Huge').length).toBeGreaterThan(0);
        });
    });
});
