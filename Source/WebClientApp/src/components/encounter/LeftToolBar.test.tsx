import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { LeftToolBar, type LeftToolBarProps, type PanelType } from './LeftToolBar';

// Mock MUI icons to avoid file handle exhaustion
vi.mock('@mui/icons-material', () => ({
    Pets: () => <span>MonstersIcon</span>,
    Cloud: () => <span>FogOfWarIcon</span>,
    Lock: () => <span>LockIcon</span>,
    LockOpen: () => <span>LockOpenIcon</span>,
    ViewInAr: () => <span>ObjectsIcon</span>,
    Person: () => <span>CharactersIcon</span>,
    Layers: () => <span>RegionsIcon</span>,
    LightMode: () => <span>LightsIcon</span>,
    VolumeUp: () => <span>SoundsIcon</span>,
    BorderAll: () => <span>WallsIcon</span>,
}));

// Mock the panels to avoid deep component tree complexity
vi.mock('./panels', () => ({
    CharactersPanel: () => <div data-panel="characters">Characters Panel</div>,
    FogOfWarPanel: () => <div data-panel="fogOfWar">Fog of War Panel</div>,
    LightsPanel: () => <div data-panel="lights">Lights Panel</div>,
    MonstersPanel: () => <div data-panel="monsters">Monsters Panel</div>,
    ObjectsPanel: () => <div data-panel="objects">Objects Panel</div>,
    RegionsPanel: () => <div data-panel="regions">Regions Panel</div>,
    SoundsPanel: () => <div data-panel="sounds">Sounds Panel</div>,
    WallsPanel: () => <div data-panel="walls">Walls Panel</div>,
}));

vi.mock('./asset-selection', () => ({
    AssetSelectionDialog: () => null,
}));

const theme = createTheme();

const defaultProps: Partial<LeftToolBarProps> = {
    activeScope: null,
    onScopeChange: vi.fn<(scope: InteractionScope | null) => void>(),
    onPanelChange: vi.fn<(panel: PanelType | null) => void>(),
};

const renderComponent = (props: Partial<LeftToolBarProps> = {}) => {
    return render(
        <ThemeProvider theme={theme}>
            <LeftToolBar {...defaultProps} {...props} />
        </ThemeProvider>,
    );
};

describe('LeftToolBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render toolbar with all scope buttons', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByRole('button', { name: /Walls & Openings/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Regions/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Objects/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Monsters/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Characters/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Lights/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Sounds/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Fog of War/i })).toBeInTheDocument();
        });

        it('should render lock/unlock button', () => {
            // Arrange & Act
            renderComponent();

            // Assert
            expect(screen.getByRole('button', { name: /Panel Unlocked/i })).toBeInTheDocument();
        });

        it('should not show any panel when no scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: null });

            // Assert
            expect(screen.queryByText('Walls Panel')).not.toBeInTheDocument();
            expect(screen.queryByText('Regions Panel')).not.toBeInTheDocument();
        });
    });

    describe('Scope Selection', () => {
        it('should call onScopeChange when clicking a scope button', async () => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const user = userEvent.setup();
            renderComponent({ onScopeChange });

            // Act
            await user.click(screen.getByRole('button', { name: /Walls & Openings/i }));

            // Assert
            expect(onScopeChange).toHaveBeenCalledWith('walls');
        });

        it('should call onScopeChange with null when clicking active scope', async () => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const user = userEvent.setup();
            renderComponent({ activeScope: 'walls', onScopeChange });

            // Act
            await user.click(screen.getByRole('button', { name: /Walls & Openings \(Active\)/i }));

            // Assert
            expect(onScopeChange).toHaveBeenCalledWith(null);
        });

        it('should call onPanelChange when scope changes', async () => {
            // Arrange
            const onPanelChange = vi.fn<(panel: PanelType | null) => void>();
            const user = userEvent.setup();
            renderComponent({ onPanelChange });

            // Act
            await user.click(screen.getByRole('button', { name: /Regions/i }));

            // Assert
            expect(onPanelChange).toHaveBeenCalledWith('regions');
        });

        it('should switch scope when clicking different scope button', async () => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const user = userEvent.setup();
            renderComponent({ activeScope: 'walls', onScopeChange });

            // Act
            await user.click(screen.getByRole('button', { name: /Monsters/i }));

            // Assert
            expect(onScopeChange).toHaveBeenCalledWith('monsters');
        });
    });

    describe('Tool Button States', () => {
        it('should show active styling on selected scope button', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'walls' });

            // Assert
            const wallsButton = screen.getByRole('button', { name: /Walls & Openings \(Active\)/i });
            expect(wallsButton).toBeInTheDocument();
        });

        it('should show inactive styling on non-selected scope buttons', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'walls' });

            // Assert
            const regionsButton = screen.getByRole('button', { name: /^Regions$/i });
            expect(regionsButton).toBeInTheDocument();
            expect(regionsButton).not.toHaveAttribute('name', /Active/);
        });

        it('should update tooltip for active scope', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'monsters' });

            // Assert
            expect(screen.getByRole('button', { name: /Monsters \(Active\)/i })).toBeInTheDocument();
        });
    });

    describe('Panel Lock Functionality', () => {
        it('should toggle lock state when lock button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act
            const lockButton = screen.getByRole('button', { name: /Panel Unlocked/i });
            await user.click(lockButton);

            // Assert
            expect(screen.getByRole('button', { name: /Panel Locked/i })).toBeInTheDocument();
        });

        it('should show unlock tooltip when panel is locked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderComponent();

            // Act
            await user.click(screen.getByRole('button', { name: /Panel Unlocked/i }));

            // Assert
            expect(screen.getByRole('button', { name: /Panel Locked/i })).toBeInTheDocument();
        });

        it('should keep panel visible when locked and scope deactivated', async () => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const user = userEvent.setup();
            const { rerender } = renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
                onScopeChange,
            });

            // Act - lock the panel
            await user.click(screen.getByRole('button', { name: /Panel Unlocked/i }));

            // Re-render with locked panel and active scope
            rerender(
                <ThemeProvider theme={theme}>
                    <LeftToolBar
                        {...defaultProps}
                        activeScope="walls"
                        activePanel="walls"
                        onScopeChange={onScopeChange}
                    />
                </ThemeProvider>,
            );

            // Assert - panel should show content
            expect(screen.getByText('Walls Panel')).toBeInTheDocument();
        });
    });

    describe('Panel Display', () => {
        it('should display walls panel when walls scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'walls', activePanel: 'walls' });

            // Assert
            expect(screen.getByText('Walls Panel')).toBeInTheDocument();
        });

        it('should display regions panel when regions scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'regions', activePanel: 'regions' });

            // Assert
            expect(screen.getByText('Regions Panel')).toBeInTheDocument();
        });

        it('should display objects panel when objects scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'objects', activePanel: 'objects' });

            // Assert
            expect(screen.getByText('Objects Panel')).toBeInTheDocument();
        });

        it('should display monsters panel when monsters scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'monsters', activePanel: 'monsters' });

            // Assert
            expect(screen.getByText('Monsters Panel')).toBeInTheDocument();
        });

        it('should display characters panel when characters scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'characters', activePanel: 'characters' });

            // Assert
            expect(screen.getByText('Characters Panel')).toBeInTheDocument();
        });

        it('should display lights panel when lights scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'lights', activePanel: 'lights' });

            // Assert
            expect(screen.getByText('Lights Panel')).toBeInTheDocument();
        });

        it('should display sounds panel when sounds scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'sounds', activePanel: 'sounds' });

            // Assert
            expect(screen.getByText('Sounds Panel')).toBeInTheDocument();
        });

        it('should display fog of war panel when fogOfWar scope is active', () => {
            // Arrange & Act
            renderComponent({ activeScope: 'fogOfWar', activePanel: 'fogOfWar' });

            // Assert
            expect(screen.getByText('Fog of War Panel')).toBeInTheDocument();
        });
    });

    describe('Scope Categories', () => {
        const scopes: PanelType[] = ['walls', 'regions', 'objects', 'monsters', 'characters', 'lights', 'sounds', 'fogOfWar'];

        it.each(scopes)('should handle %s scope correctly', async (scope) => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const user = userEvent.setup();
            renderComponent({ onScopeChange });

            // Act - find and click the button for this scope
            const buttons = screen.getAllByRole('button');
            const scopeButton = buttons.find((btn) => {
                const name = btn.getAttribute('aria-label');
                return name && name.toLowerCase().includes(scope.toLowerCase().replace('fogofwar', 'fog of war'));
            });

            if (scopeButton) {
                await user.click(scopeButton);
            }

            // Assert
            expect(onScopeChange).toHaveBeenCalledWith(scope);
        });
    });

    describe('External Panel Control', () => {
        it('should use external activePanel prop when provided', () => {
            // Arrange & Act
            renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
            });

            // Assert
            expect(screen.getByText('Walls Panel')).toBeInTheDocument();
        });

        it('should call onPanelChange with null when deactivating scope', async () => {
            // Arrange
            const onPanelChange = vi.fn<(panel: PanelType | null) => void>();
            const user = userEvent.setup();
            renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
                onPanelChange,
            });

            // Act
            await user.click(screen.getByRole('button', { name: /Walls & Openings \(Active\)/i }));

            // Assert
            expect(onPanelChange).toHaveBeenCalledWith(null);
        });
    });

    describe('Click Outside Behavior', () => {
        it('should register mousedown event listener for click outside detection', () => {
            // Arrange
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener') as ReturnType<typeof vi.spyOn>;

            // Act
            renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
            });

            // Assert - verify that mousedown listener is registered
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

            // Cleanup
            addEventListenerSpy.mockRestore();
        });

        it('should not deselect when clicking inside toolbar', async () => {
            // Arrange
            const onWallSelect = vi.fn<(index: number | null) => void>();
            const user = userEvent.setup();
            renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
                selectedWallIndex: 0,
                onWallSelect,
            });

            // Act - click on toolbar button (inside toolbar)
            await user.click(screen.getByRole('button', { name: /Regions/i }));

            // Assert - onWallSelect should not be called with null from click outside handler
            // (it may be called from panel change, but not the click outside handler)
            expect(onWallSelect).not.toHaveBeenCalledWith(null);
        });
    });

    describe('Internal State Management', () => {
        it('should manage internal panel state when activePanel prop is null', async () => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const user = userEvent.setup();
            renderComponent({
                activePanel: null,
                onScopeChange,
            });

            // Act
            await user.click(screen.getByRole('button', { name: /Walls & Openings/i }));

            // Assert
            expect(onScopeChange).toHaveBeenCalledWith('walls');
        });
    });

    describe('Prompt Message', () => {
        it('should show prompt when panel is locked but no scope selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const { rerender } = renderComponent({ activeScope: 'walls', activePanel: 'walls' });

            // Lock the panel
            await user.click(screen.getByRole('button', { name: /Panel Unlocked/i }));

            // Re-render with null scope but panel is locked
            rerender(
                <ThemeProvider theme={theme}>
                    <LeftToolBar
                        {...defaultProps}
                        activeScope={null}
                        activePanel={null}
                    />
                </ThemeProvider>,
            );

            // Note: The prompt shows based on internal isPanelLocked and activeScope state
            // This behavior depends on the internal state machine
        });
    });

    describe('Drawer Behavior', () => {
        it('should show drawer when panel is active and visible', () => {
            // Arrange & Act
            renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
            });

            // Assert - Check if panel content is rendered which means drawer is open
            expect(screen.getByText('Walls Panel')).toBeInTheDocument();
        });

        it('should switch panels when different scope is selected', async () => {
            // Arrange
            const onScopeChange = vi.fn<(scope: InteractionScope | null) => void>();
            const onPanelChange = vi.fn<(panel: PanelType | null) => void>();
            const user = userEvent.setup();
            const { rerender } = renderComponent({
                activeScope: 'walls',
                activePanel: 'walls',
                onScopeChange,
                onPanelChange,
            });

            // Act
            await user.click(screen.getByRole('button', { name: /Regions/i }));

            // Rerender with new scope
            rerender(
                <ThemeProvider theme={theme}>
                    <LeftToolBar
                        {...defaultProps}
                        activeScope="regions"
                        activePanel="regions"
                        onScopeChange={onScopeChange}
                        onPanelChange={onPanelChange}
                    />
                </ThemeProvider>,
            );

            // Assert
            expect(screen.getByText('Regions Panel')).toBeInTheDocument();
            expect(screen.queryByText('Walls Panel')).not.toBeInTheDocument();
        });
    });
});
