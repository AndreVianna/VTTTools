import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AutoplayHelpDialog, type AutoplayHelpDialogProps } from './AutoplayHelpDialog';

describe('AutoplayHelpDialog', () => {
    const defaultProps: AutoplayHelpDialogProps = {
        open: true,
        onClose: vi.fn(),
    };

    const renderWithTheme = (props: Partial<AutoplayHelpDialogProps> = {}) => {
        const theme = createTheme();
        return render(
            <ThemeProvider theme={theme}>
                <AutoplayHelpDialog {...defaultProps} {...props} />
            </ThemeProvider>
        );
    };

    describe('rendering', () => {
        it('should render the dialog when open is true', () => {
            renderWithTheme();

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should not render content when open is false', () => {
            renderWithTheme({ open: false });

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('should display the dialog title', () => {
            renderWithTheme();

            expect(screen.getByText('Enable Auto-Play in Your Browser')).toBeInTheDocument();
        });

        it('should display intro text explaining the purpose', () => {
            renderWithTheme();

            expect(screen.getByText(/to skip the entry screen and hear audio automatically/i)).toBeInTheDocument();
        });

        it('should display note about browser version variations', () => {
            renderWithTheme();

            expect(screen.getByText(/browser settings may vary slightly/i)).toBeInTheDocument();
        });

        it('should display a Close button', () => {
            renderWithTheme();

            expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
        });
    });

    describe('browser tabs', () => {
        it('should display tabs for all major browsers', () => {
            renderWithTheme();

            expect(screen.getByRole('tab', { name: /chrome/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /firefox/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /safari/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /edge/i })).toBeInTheDocument();
        });

        it('should have Chrome tab selected by default', () => {
            renderWithTheme();

            const chromeTab = screen.getByRole('tab', { name: /chrome/i });
            expect(chromeTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should display Chrome instructions by default', () => {
            renderWithTheme();

            expect(screen.getByText(/click the lock icon.*in the address bar/i)).toBeInTheDocument();
            expect(screen.getByText(/click "site settings"/i)).toBeInTheDocument();
        });

        it('should switch to Firefox instructions when Firefox tab is clicked', () => {
            renderWithTheme();

            fireEvent.click(screen.getByRole('tab', { name: /firefox/i }));

            // Firefox instructions
            expect(screen.getByText(/connection secure/i)).toBeInTheDocument();
            expect(screen.getByText(/allow audio and video/i)).toBeInTheDocument();
        });

        it('should switch to Safari instructions when Safari tab is clicked', () => {
            renderWithTheme();

            fireEvent.click(screen.getByRole('tab', { name: /safari/i }));

            // Safari instructions
            expect(screen.getByText(/click "safari" in the menu bar/i)).toBeInTheDocument();
            expect(screen.getByText(/allow all auto-play/i)).toBeInTheDocument();
        });

        it('should switch to Edge instructions when Edge tab is clicked', () => {
            renderWithTheme();

            fireEvent.click(screen.getByRole('tab', { name: /edge/i }));

            // Edge instructions
            expect(screen.getByText(/media autoplay/i)).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should call onClose when Close button is clicked', () => {
            const onClose = vi.fn();
            renderWithTheme({ onClose });

            fireEvent.click(screen.getByRole('button', { name: /close/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when pressing Escape key', () => {
            const onClose = vi.fn();
            renderWithTheme({ onClose });

            // Press Escape to close the dialog
            fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('accessibility', () => {
        it('should have proper dialog labeling', () => {
            renderWithTheme();

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-labelledby', 'autoplay-help-dialog-title');
        });

        it('should have proper tab panel associations', () => {
            renderWithTheme();

            const chromeTab = screen.getByRole('tab', { name: /chrome/i });
            expect(chromeTab).toHaveAttribute('aria-controls', 'autoplay-tabpanel-0');
        });

        it('should have proper tablist role', () => {
            renderWithTheme();

            expect(screen.getByRole('tablist')).toBeInTheDocument();
        });

        it('should render steps as ordered list', () => {
            renderWithTheme();

            const tabPanel = screen.getByRole('tabpanel');
            const list = within(tabPanel).getByRole('list');
            expect(list).toBeInTheDocument();
        });
    });

    describe('theme support', () => {
        it('should render correctly in light mode', () => {
            const theme = createTheme({ palette: { mode: 'light' } });
            render(
                <ThemeProvider theme={theme}>
                    <AutoplayHelpDialog {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should render correctly in dark mode', () => {
            const theme = createTheme({ palette: { mode: 'dark' } });
            render(
                <ThemeProvider theme={theme}>
                    <AutoplayHelpDialog {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
    });

    describe('instruction completeness', () => {
        it('should display all Chrome steps', () => {
            renderWithTheme();

            const tabPanel = screen.getByRole('tabpanel');
            const listItems = within(tabPanel).getAllByRole('listitem');
            expect(listItems.length).toBe(4);
            expect(listItems[0]).toHaveTextContent(/click the lock icon/i);
            expect(listItems[1]).toHaveTextContent(/site settings/i);
            expect(listItems[2]).toHaveTextContent(/find "sound"/i);
            expect(listItems[3]).toHaveTextContent(/refresh the page/i);
        });

        it('should display all Firefox steps', () => {
            renderWithTheme();
            fireEvent.click(screen.getByRole('tab', { name: /firefox/i }));

            const tabPanel = screen.getByRole('tabpanel');
            const listItems = within(tabPanel).getAllByRole('listitem');
            expect(listItems.length).toBe(7);
            expect(listItems[1]).toHaveTextContent(/connection secure/i);
            expect(listItems[2]).toHaveTextContent(/more information/i);
            expect(listItems[3]).toHaveTextContent(/permissions/i);
            expect(listItems[4]).toHaveTextContent(/autoplay/i);
        });

        it('should display all Safari steps', () => {
            renderWithTheme();
            fireEvent.click(screen.getByRole('tab', { name: /safari/i }));

            const tabPanel = screen.getByRole('tabpanel');
            const listItems = within(tabPanel).getAllByRole('listitem');
            expect(listItems.length).toBe(4);
            expect(listItems[0]).toHaveTextContent(/safari/i);
            expect(listItems[1]).toHaveTextContent(/settings for this website/i);
            expect(listItems[2]).toHaveTextContent(/auto-play/i);
        });

        it('should display all Edge steps', () => {
            renderWithTheme();
            fireEvent.click(screen.getByRole('tab', { name: /edge/i }));

            const tabPanel = screen.getByRole('tabpanel');
            const listItems = within(tabPanel).getAllByRole('listitem');
            expect(listItems.length).toBe(4);
            expect(listItems[1]).toHaveTextContent(/site permissions/i);
            expect(listItems[2]).toHaveTextContent(/media autoplay/i);
        });
    });
});
