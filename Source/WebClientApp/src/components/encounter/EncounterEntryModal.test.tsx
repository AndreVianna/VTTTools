import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EncounterEntryModal, type EncounterEntryModalProps } from './EncounterEntryModal';

describe('EncounterEntryModal', () => {
    const defaultProps: EncounterEntryModalProps = {
        open: true,
        encounterName: 'Dragon\'s Lair',
        onEnter: vi.fn(),
        onHelpClick: vi.fn(),
    };

    const renderWithTheme = (props: Partial<EncounterEntryModalProps> = {}) => {
        const theme = createTheme();
        return render(
            <ThemeProvider theme={theme}>
                <EncounterEntryModal {...defaultProps} {...props} />
            </ThemeProvider>
        );
    };

    describe('rendering', () => {
        it('should render the modal when open is true', () => {
            renderWithTheme();

            expect(screen.getByRole('presentation')).toBeInTheDocument();
        });

        it('should not render content when open is false', () => {
            renderWithTheme({ open: false });

            expect(screen.queryByText('Dragon\'s Lair')).not.toBeInTheDocument();
        });

        it('should display the encounter name', () => {
            renderWithTheme();

            expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        });

        it('should display the intro text', () => {
            renderWithTheme();

            expect(screen.getByText('Your character is being sent to a new scene')).toBeInTheDocument();
        });

        it('should display the OK button', () => {
            renderWithTheme();

            expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
        });

        it('should have button with correct id for BDD testing', () => {
            renderWithTheme();

            expect(screen.getByRole('button', { name: /ok/i })).toHaveAttribute('id', 'btn-enter-encounter');
        });

        it('should display the help link', () => {
            renderWithTheme();

            expect(screen.getByText(/click here to learn how to enable auto-play/i)).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should call onEnter when OK button is clicked', () => {
            const onEnter = vi.fn();
            renderWithTheme({ onEnter });

            fireEvent.click(screen.getByRole('button', { name: /ok/i }));

            expect(onEnter).toHaveBeenCalledTimes(1);
        });

        it('should call onHelpClick when help link is clicked', () => {
            const onHelpClick = vi.fn();
            renderWithTheme({ onHelpClick });

            fireEvent.click(screen.getByText(/click here to learn how to enable auto-play/i));

            expect(onHelpClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('accessibility', () => {
        it('should have the encounter name as a heading', () => {
            renderWithTheme();

            expect(screen.getByRole('heading', { name: 'Dragon\'s Lair' })).toBeInTheDocument();
        });
    });

    describe('different encounter names', () => {
        it('should display different encounter names correctly', () => {
            renderWithTheme({ encounterName: 'Tavern Brawl' });

            expect(screen.getByText('Tavern Brawl')).toBeInTheDocument();
        });

        it('should handle long encounter names', () => {
            const longName = 'The Ancient Temple of the Lost Civilization Deep Underground';
            renderWithTheme({ encounterName: longName });

            expect(screen.getByText(longName)).toBeInTheDocument();
        });

        it('should handle special characters in encounter names', () => {
            renderWithTheme({ encounterName: 'Bob\'s "Special" Place & Bar' });

            expect(screen.getByText('Bob\'s "Special" Place & Bar')).toBeInTheDocument();
        });
    });

    describe('theme support', () => {
        it('should render correctly in light mode', () => {
            const theme = createTheme({ palette: { mode: 'light' } });
            render(
                <ThemeProvider theme={theme}>
                    <EncounterEntryModal {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        });

        it('should render correctly in dark mode', () => {
            const theme = createTheme({ palette: { mode: 'dark' } });
            render(
                <ThemeProvider theme={theme}>
                    <EncounterEntryModal {...defaultProps} />
                </ThemeProvider>
            );

            expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        });
    });
});
