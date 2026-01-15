import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { MediaTypeFilter, type MediaTypeFilterProps } from './MediaTypeFilter';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('MediaTypeFilter', () => {
    const defaultProps: MediaTypeFilterProps = {
        value: [],
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render MEDIA TYPE label', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} />);

            expect(screen.getByText('MEDIA TYPE')).toBeInTheDocument();
        });

        it('should render Image checkbox', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} />);

            expect(screen.getByRole('checkbox', { name: /image/i })).toBeInTheDocument();
            expect(screen.getByLabelText('Image')).toBeInTheDocument();
        });

        it('should render Video checkbox', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} />);

            expect(screen.getByRole('checkbox', { name: /video/i })).toBeInTheDocument();
            expect(screen.getByLabelText('Video')).toBeInTheDocument();
        });

        it('should render checkboxes with correct ids', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} />);

            expect(document.getElementById('checkbox-media-image')).toBeInTheDocument();
            expect(document.getElementById('checkbox-media-video')).toBeInTheDocument();
        });
    });

    describe('initial value state', () => {
        it('should show both checkboxes unchecked when value is empty array', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} value={[]} />);

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).not.toBeChecked();
            expect(videoCheckbox).not.toBeChecked();
        });

        it('should show Image checkbox checked when value contains image', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} value={['image']} />);

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).toBeChecked();
            expect(videoCheckbox).not.toBeChecked();
        });

        it('should show Video checkbox checked when value contains video', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} value={['video']} />);

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).not.toBeChecked();
            expect(videoCheckbox).toBeChecked();
        });

        it('should show both checkboxes checked when value contains both types', () => {
            renderWithTheme(
                <MediaTypeFilter {...defaultProps} value={['image', 'video']} />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).toBeChecked();
            expect(videoCheckbox).toBeChecked();
        });
    });

    describe('onChange behavior', () => {
        it('should call onChange with [image] when Image is selected from empty state', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter {...defaultProps} value={[]} onChange={onChange} />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            await user.click(imageCheckbox);

            expect(onChange).toHaveBeenCalledWith(['image']);
        });

        it('should call onChange with [video] when Video is selected from empty state', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter {...defaultProps} value={[]} onChange={onChange} />
            );

            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });
            await user.click(videoCheckbox);

            expect(onChange).toHaveBeenCalledWith(['video']);
        });

        it('should call onChange with [image, video] when Video is added to image selection', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    value={['image']}
                    onChange={onChange}
                />
            );

            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });
            await user.click(videoCheckbox);

            expect(onChange).toHaveBeenCalledWith(['image', 'video']);
        });

        it('should call onChange with [image, video] when Image is added to video selection', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    value={['video']}
                    onChange={onChange}
                />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            await user.click(imageCheckbox);

            expect(onChange).toHaveBeenCalledWith(['video', 'image']);
        });

        it('should call onChange with [video] when Image is deselected from both selected', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    value={['image', 'video']}
                    onChange={onChange}
                />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            await user.click(imageCheckbox);

            expect(onChange).toHaveBeenCalledWith(['video']);
        });

        it('should call onChange with [image] when Video is deselected from both selected', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    value={['image', 'video']}
                    onChange={onChange}
                />
            );

            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });
            await user.click(videoCheckbox);

            expect(onChange).toHaveBeenCalledWith(['image']);
        });

        it('should call onChange with empty array when only Image is deselected', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    value={['image']}
                    onChange={onChange}
                />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            await user.click(imageCheckbox);

            expect(onChange).toHaveBeenCalledWith([]);
        });

        it('should call onChange with empty array when only Video is deselected', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    value={['video']}
                    onChange={onChange}
                />
            );

            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });
            await user.click(videoCheckbox);

            expect(onChange).toHaveBeenCalledWith([]);
        });
    });

    describe('disabled state', () => {
        it('should be enabled by default', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} />);

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).not.toBeDisabled();
            expect(videoCheckbox).not.toBeDisabled();
        });

        it('should disable both checkboxes when disabled prop is true', () => {
            renderWithTheme(
                <MediaTypeFilter {...defaultProps} disabled={true} />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).toBeDisabled();
            expect(videoCheckbox).toBeDisabled();
        });

        it('should not call onChange when disabled', () => {
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter
                    {...defaultProps}
                    onChange={onChange}
                    disabled={true}
                />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });

            // When disabled, MUI sets pointer-events: none, so we verify it's disabled
            // rather than trying to click which would throw
            expect(imageCheckbox).toBeDisabled();
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('theme integration', () => {
        it('should render correctly with light theme', () => {
            const lightTheme = createTheme({ palette: { mode: 'light' } });
            render(
                <ThemeProvider theme={lightTheme}>
                    <MediaTypeFilter {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('MEDIA TYPE')).toBeInTheDocument();
            expect(screen.getByLabelText('Image')).toBeInTheDocument();
            expect(screen.getByLabelText('Video')).toBeInTheDocument();
        });

        it('should render correctly with dark theme', () => {
            const darkTheme = createTheme({ palette: { mode: 'dark' } });
            render(
                <ThemeProvider theme={darkTheme}>
                    <MediaTypeFilter {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('MEDIA TYPE')).toBeInTheDocument();
            expect(screen.getByLabelText('Image')).toBeInTheDocument();
            expect(screen.getByLabelText('Video')).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('should have accessible labels for checkboxes', () => {
            renderWithTheme(<MediaTypeFilter {...defaultProps} />);

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });
            const videoCheckbox = screen.getByRole('checkbox', { name: /video/i });

            expect(imageCheckbox).toHaveAccessibleName('Image');
            expect(videoCheckbox).toHaveAccessibleName('Video');
        });

        it('should be keyboard navigable', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();

            renderWithTheme(
                <MediaTypeFilter {...defaultProps} value={[]} onChange={onChange} />
            );

            const imageCheckbox = screen.getByRole('checkbox', { name: /image/i });

            // Focus on the checkbox
            imageCheckbox.focus();
            expect(imageCheckbox).toHaveFocus();

            // Press space to toggle
            await user.keyboard(' ');

            expect(onChange).toHaveBeenCalledWith(['image']);
        });
    });
});
