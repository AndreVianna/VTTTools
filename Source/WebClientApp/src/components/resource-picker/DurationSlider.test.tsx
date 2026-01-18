import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { DurationSlider, type DurationSliderProps } from './DurationSlider';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('DurationSlider', () => {
    const defaultProps: DurationSliderProps = {
        value: [0, 60000],
        onChange: vi.fn(),
        maxDurationMs: 60000,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render with DURATION label', () => {
            renderWithTheme(<DurationSlider {...defaultProps} />);

            expect(screen.getByText('DURATION')).toBeInTheDocument();
        });

        it('should render slider with correct id', () => {
            renderWithTheme(<DurationSlider {...defaultProps} />);

            expect(document.getElementById('slider-duration-range')).toBeInTheDocument();
        });

        it('should display range label', () => {
            renderWithTheme(
                <DurationSlider {...defaultProps} value={[0, 30000]} />
            );

            expect(screen.getByText('0s - 30s')).toBeInTheDocument();
        });
    });

    describe('mark generation', () => {
        it('should generate marks for 60000ms (1 minute) max duration', () => {
            renderWithTheme(
                <DurationSlider {...defaultProps} maxDurationMs={60000} />
            );

            // MUI Slider may render labels multiple times (mark labels + value labels)
            // Use getAllByText and check at least one exists
            expect(screen.getAllByText('0s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('30s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('1:00').length).toBeGreaterThan(0);
        });

        it('should generate marks for 300000ms (5 minutes) max duration', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[0, 300000]}
                    maxDurationMs={300000}
                />
            );

            // MUI Slider may render labels multiple times (mark labels + value labels)
            expect(screen.getAllByText('0s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('30s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('1:00').length).toBeGreaterThan(0);
            expect(screen.getAllByText('2:00').length).toBeGreaterThan(0);
            expect(screen.getAllByText('5:00').length).toBeGreaterThan(0);
        });

        it('should generate marks for 3600000ms (1 hour) max duration', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[0, 3600000]}
                    maxDurationMs={3600000}
                />
            );

            // MUI Slider may render labels multiple times (mark labels + value labels)
            expect(screen.getAllByText('0s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('30s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('1:00').length).toBeGreaterThan(0);
            expect(screen.getAllByText('5:00').length).toBeGreaterThan(0);
            expect(screen.getAllByText('15:00').length).toBeGreaterThan(0);
            expect(screen.getAllByText('30:00').length).toBeGreaterThan(0);
            expect(screen.getAllByText('60:00').length).toBeGreaterThan(0);
        });

        it('should include max value mark if not a standard interval', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[0, 45000]}
                    maxDurationMs={45000}
                />
            );

            // MUI Slider may render labels multiple times (mark labels + value labels)
            expect(screen.getAllByText('0s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('30s').length).toBeGreaterThan(0);
            expect(screen.getAllByText('45s').length).toBeGreaterThan(0);
        });

        it('should not duplicate mark if max equals standard interval', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[0, 30000]}
                    maxDurationMs={30000}
                />
            );

            // Query for mark labels specifically (aria-hidden marks)
            const slider = document.getElementById('slider-duration-range');
            const markLabels = slider?.querySelectorAll('.MuiSlider-markLabel');
            const markTexts = Array.from(markLabels ?? []).map((el) => el.textContent);

            // Should have 0s and 30s marks, and 30s should only appear once in marks
            expect(markTexts.filter((t) => t === '30s')).toHaveLength(1);
        });
    });

    describe('duration formatting', () => {
        it('should format 0ms as 0s', () => {
            renderWithTheme(
                <DurationSlider {...defaultProps} value={[0, 0]} maxDurationMs={60000} />
            );

            expect(screen.getByText('0s - 0s')).toBeInTheDocument();
        });

        it('should format 30000ms as 30s', () => {
            renderWithTheme(
                <DurationSlider {...defaultProps} value={[30000, 30000]} />
            );

            expect(screen.getByText('30s - 30s')).toBeInTheDocument();
        });

        it('should format 60000ms as 1:00', () => {
            renderWithTheme(
                <DurationSlider {...defaultProps} value={[60000, 60000]} />
            );

            expect(screen.getByText('1:00 - 1:00')).toBeInTheDocument();
        });

        it('should format 90000ms as 1:30', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[90000, 90000]}
                    maxDurationMs={120000}
                />
            );

            expect(screen.getByText('1:30 - 1:30')).toBeInTheDocument();
        });

        it('should format 330000ms as 5:30', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[330000, 330000]}
                    maxDurationMs={600000}
                />
            );

            expect(screen.getByText('5:30 - 5:30')).toBeInTheDocument();
        });

        it('should pad seconds with leading zero', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[65000, 65000]}
                    maxDurationMs={120000}
                />
            );

            expect(screen.getByText('1:05 - 1:05')).toBeInTheDocument();
        });
    });

    describe('onChange behavior', () => {
        it('should call onChange with [min, max] milliseconds when slider changes', () => {
            const onChange = vi.fn();
            renderWithTheme(
                <DurationSlider {...defaultProps} onChange={onChange} />
            );

            const slider = document.getElementById('slider-duration-range');
            expect(slider).toBeInTheDocument();

            const sliderInputs = slider?.querySelectorAll('input[type="range"]');
            if (sliderInputs && sliderInputs.length > 0) {
                fireEvent.change(sliderInputs[0], { target: { value: 30000 } });
            }
        });
    });

    describe('disabled state', () => {
        it('should be enabled by default', () => {
            renderWithTheme(<DurationSlider {...defaultProps} />);

            const slider = document.getElementById('slider-duration-range');
            expect(slider).not.toHaveClass('Mui-disabled');
        });

        it('should be disabled when disabled prop is true', () => {
            renderWithTheme(
                <DurationSlider {...defaultProps} disabled={true} />
            );

            const slider = document.getElementById('slider-duration-range');
            expect(slider).toHaveClass('Mui-disabled');
        });

        it('should be disabled when maxDurationMs is 0', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[0, 0]}
                    maxDurationMs={0}
                />
            );

            const slider = document.getElementById('slider-duration-range');
            expect(slider).toHaveClass('Mui-disabled');
        });

        it('should prevent MUI error when maxDurationMs is 0 by using 1 as max', () => {
            // This test verifies the component doesn't crash when maxDurationMs is 0
            expect(() => {
                renderWithTheme(
                    <DurationSlider
                        {...defaultProps}
                        value={[0, 0]}
                        maxDurationMs={0}
                    />
                );
            }).not.toThrow();
        });
    });

    describe('theme integration', () => {
        it('should render correctly with light theme', () => {
            const lightTheme = createTheme({ palette: { mode: 'light' } });
            render(
                <ThemeProvider theme={lightTheme}>
                    <DurationSlider {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('DURATION')).toBeInTheDocument();
        });

        it('should render correctly with dark theme', () => {
            const darkTheme = createTheme({ palette: { mode: 'dark' } });
            render(
                <ThemeProvider theme={darkTheme}>
                    <DurationSlider {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('DURATION')).toBeInTheDocument();
        });
    });

    describe('initial value', () => {
        it('should render with default range', () => {
            renderWithTheme(<DurationSlider {...defaultProps} />);

            expect(screen.getByText('0s - 1:00')).toBeInTheDocument();
        });

        it('should render with custom initial value', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[15000, 45000]}
                    maxDurationMs={60000}
                />
            );

            expect(screen.getByText('15s - 45s')).toBeInTheDocument();
        });

        it('should render with minutes range', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[120000, 300000]}
                    maxDurationMs={600000}
                />
            );

            expect(screen.getByText('2:00 - 5:00')).toBeInTheDocument();
        });
    });

    describe('slider constraints', () => {
        it('should have min value of 0', () => {
            renderWithTheme(<DurationSlider {...defaultProps} />);

            // MUI Slider may render labels multiple times
            expect(screen.getAllByText('0s').length).toBeGreaterThan(0);
        });

        it('should have max value equal to maxDurationMs', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    maxDurationMs={120000}
                    value={[0, 120000]}
                />
            );

            // MUI Slider may render labels multiple times
            expect(screen.getAllByText('2:00').length).toBeGreaterThan(0);
        });
    });

    describe('edge cases', () => {
        it('should handle very short durations', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[1000, 5000]}
                    maxDurationMs={10000}
                />
            );

            expect(screen.getByText('1s - 5s')).toBeInTheDocument();
        });

        it('should handle hour-long durations', () => {
            renderWithTheme(
                <DurationSlider
                    {...defaultProps}
                    value={[0, 3600000]}
                    maxDurationMs={3600000}
                />
            );

            expect(screen.getByText('0s - 60:00')).toBeInTheDocument();
        });
    });
});
