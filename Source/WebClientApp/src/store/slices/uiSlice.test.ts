import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import uiReducer, {
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebar,
    setRightSidebar,
    setGlobalLoading,
    setFeatureLoading,
    openModal,
    closeModal,
    clearModal,
    addNotification,
    removeNotification,
    clearNotifications,
    setTheme,
    toggleTheme,
    showHelp,
    hideHelp,
    toggleTooltips,
    selectUI,
    selectSidebars,
    selectLoading,
    selectModals,
    selectNotifications,
    selectTheme,
    selectHelp,
    type UIState,
} from './uiSlice';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock console.warn to suppress expected warnings in tests
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('uiSlice', () => {
    const createInitialState = (): UIState => ({
        leftSidebarOpen: true,
        rightSidebarOpen: true,
        loading: {
            global: false,
            auth: false,
            assets: false,
            adventures: false,
            encounters: false,
            sessions: false,
        },
        modals: {},
        notifications: [],
        theme: 'light',
        helpVisible: false,
        tooltipsEnabled: true,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('sidebar controls', () => {
        it('should toggle left sidebar from open to closed', () => {
            // Arrange
            const state = createInitialState();
            state.leftSidebarOpen = true;

            // Act
            const result = uiReducer(state, toggleLeftSidebar());

            // Assert
            expect(result.leftSidebarOpen).toBe(false);
        });

        it('should toggle left sidebar from closed to open', () => {
            // Arrange
            const state = createInitialState();
            state.leftSidebarOpen = false;

            // Act
            const result = uiReducer(state, toggleLeftSidebar());

            // Assert
            expect(result.leftSidebarOpen).toBe(true);
        });

        it('should toggle right sidebar from open to closed', () => {
            // Arrange
            const state = createInitialState();
            state.rightSidebarOpen = true;

            // Act
            const result = uiReducer(state, toggleRightSidebar());

            // Assert
            expect(result.rightSidebarOpen).toBe(false);
        });

        it('should toggle right sidebar from closed to open', () => {
            // Arrange
            const state = createInitialState();
            state.rightSidebarOpen = false;

            // Act
            const result = uiReducer(state, toggleRightSidebar());

            // Assert
            expect(result.rightSidebarOpen).toBe(true);
        });

        it('should set left sidebar to specified value', () => {
            // Arrange
            const state = createInitialState();
            state.leftSidebarOpen = true;

            // Act
            const result = uiReducer(state, setLeftSidebar(false));

            // Assert
            expect(result.leftSidebarOpen).toBe(false);
        });

        it('should set right sidebar to specified value', () => {
            // Arrange
            const state = createInitialState();
            state.rightSidebarOpen = false;

            // Act
            const result = uiReducer(state, setRightSidebar(true));

            // Assert
            expect(result.rightSidebarOpen).toBe(true);
        });
    });

    describe('loading states', () => {
        it('should set global loading to true', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, setGlobalLoading(true));

            // Assert
            expect(result.loading.global).toBe(true);
        });

        it('should set global loading to false', () => {
            // Arrange
            const state = createInitialState();
            state.loading.global = true;

            // Act
            const result = uiReducer(state, setGlobalLoading(false));

            // Assert
            expect(result.loading.global).toBe(false);
        });

        it('should set feature loading for auth', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, setFeatureLoading({ feature: 'auth', loading: true }));

            // Assert
            expect(result.loading.auth).toBe(true);
        });

        it('should set feature loading for assets', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, setFeatureLoading({ feature: 'assets', loading: true }));

            // Assert
            expect(result.loading.assets).toBe(true);
        });

        it('should set feature loading for sessions', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, setFeatureLoading({ feature: 'sessions', loading: true }));

            // Assert
            expect(result.loading.sessions).toBe(true);
        });
    });

    describe('modal management', () => {
        it('should open modal with id', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, openModal({ id: 'confirmDelete' }));

            // Assert
            expect(result.modals['confirmDelete']).toEqual({ open: true, data: undefined });
        });

        it('should open modal with id and data', () => {
            // Arrange
            const state = createInitialState();
            const modalData = { assetId: '123', assetName: 'Test Asset' };

            // Act
            const result = uiReducer(state, openModal({ id: 'editAsset', data: modalData }));

            // Assert
            expect(result.modals['editAsset']).toEqual({ open: true, data: modalData });
        });

        it('should close modal by id', () => {
            // Arrange
            const state = createInitialState();
            state.modals['testModal'] = { open: true, data: { test: 'data' } };

            // Act
            const result = uiReducer(state, closeModal('testModal'));

            // Assert
            expect(result.modals['testModal'].open).toBe(false);
            expect(result.modals['testModal'].data).toEqual({ test: 'data' });
        });

        it('should handle closing non-existent modal gracefully', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, closeModal('nonExistent'));

            // Assert
            expect(result.modals['nonExistent']).toBeUndefined();
        });

        it('should clear modal completely', () => {
            // Arrange
            const state = createInitialState();
            state.modals['testModal'] = { open: false, data: { test: 'data' } };

            // Act
            const result = uiReducer(state, clearModal('testModal'));

            // Assert
            expect(result.modals['testModal']).toBeUndefined();
        });
    });

    describe('notification management', () => {
        it('should add notification with default duration', () => {
            // Arrange
            const state = createInitialState();
            vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

            // Act
            const result = uiReducer(state, addNotification({ type: 'success', message: 'Operation completed' }));

            // Assert
            expect(result.notifications).toHaveLength(1);
            expect(result.notifications[0]).toEqual({
                id: '1704110400000',
                type: 'success',
                message: 'Operation completed',
                duration: 5000,
                timestamp: 1704110400000,
            });
        });

        it('should add notification with custom duration', () => {
            // Arrange
            const state = createInitialState();
            vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

            // Act
            const result = uiReducer(state, addNotification({ type: 'error', message: 'Error occurred', duration: 10000 }));

            // Assert
            expect(result.notifications[0]?.duration).toBe(10000);
        });

        it('should add multiple notifications', () => {
            // Arrange
            let state = createInitialState();
            vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

            // Act
            state = uiReducer(state, addNotification({ type: 'success', message: 'First' }));
            vi.setSystemTime(new Date('2024-01-01T12:00:01Z'));
            state = uiReducer(state, addNotification({ type: 'info', message: 'Second' }));

            // Assert
            expect(state.notifications).toHaveLength(2);
            expect(state.notifications[0]?.message).toBe('First');
            expect(state.notifications[1]?.message).toBe('Second');
        });

        it('should remove notification by id', () => {
            // Arrange
            const state = createInitialState();
            state.notifications = [
                { id: '1', type: 'success', message: 'First', duration: 5000, timestamp: 1000 },
                { id: '2', type: 'error', message: 'Second', duration: 5000, timestamp: 2000 },
            ];

            // Act
            const result = uiReducer(state, removeNotification('1'));

            // Assert
            expect(result.notifications).toHaveLength(1);
            expect(result.notifications[0]?.id).toBe('2');
        });

        it('should clear all notifications', () => {
            // Arrange
            const state = createInitialState();
            state.notifications = [
                { id: '1', type: 'success', message: 'First', duration: 5000, timestamp: 1000 },
                { id: '2', type: 'error', message: 'Second', duration: 5000, timestamp: 2000 },
                { id: '3', type: 'warning', message: 'Third', duration: 5000, timestamp: 3000 },
            ];

            // Act
            const result = uiReducer(state, clearNotifications());

            // Assert
            expect(result.notifications).toHaveLength(0);
        });
    });

    describe('theme management', () => {
        it('should set theme to dark and persist to localStorage', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, setTheme('dark'));

            // Assert
            expect(result.theme).toBe('dark');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('vtttools-theme', 'dark');
        });

        it('should set theme to light and persist to localStorage', () => {
            // Arrange
            const state = createInitialState();
            state.theme = 'dark';

            // Act
            const result = uiReducer(state, setTheme('light'));

            // Assert
            expect(result.theme).toBe('light');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('vtttools-theme', 'light');
        });

        it('should toggle theme from light to dark', () => {
            // Arrange
            const state = createInitialState();
            state.theme = 'light';

            // Act
            const result = uiReducer(state, toggleTheme());

            // Assert
            expect(result.theme).toBe('dark');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('vtttools-theme', 'dark');
        });

        it('should toggle theme from dark to light', () => {
            // Arrange
            const state = createInitialState();
            state.theme = 'dark';

            // Act
            const result = uiReducer(state, toggleTheme());

            // Assert
            expect(result.theme).toBe('light');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('vtttools-theme', 'light');
        });
    });

    describe('help system', () => {
        it('should show help without topic', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, showHelp(undefined));

            // Assert
            expect(result.helpVisible).toBe(true);
            expect(result.helpTopic).toBeUndefined();
        });

        it('should show help with specific topic', () => {
            // Arrange
            const state = createInitialState();

            // Act
            const result = uiReducer(state, showHelp('getting-started'));

            // Assert
            expect(result.helpVisible).toBe(true);
            expect(result.helpTopic).toBe('getting-started');
        });

        it('should hide help and clear topic', () => {
            // Arrange
            const state = createInitialState();
            state.helpVisible = true;
            state.helpTopic = 'some-topic';

            // Act
            const result = uiReducer(state, hideHelp());

            // Assert
            expect(result.helpVisible).toBe(false);
            expect(result.helpTopic).toBeUndefined();
        });

        it('should toggle tooltips from enabled to disabled', () => {
            // Arrange
            const state = createInitialState();
            state.tooltipsEnabled = true;

            // Act
            const result = uiReducer(state, toggleTooltips());

            // Assert
            expect(result.tooltipsEnabled).toBe(false);
        });

        it('should toggle tooltips from disabled to enabled', () => {
            // Arrange
            const state = createInitialState();
            state.tooltipsEnabled = false;

            // Act
            const result = uiReducer(state, toggleTooltips());

            // Assert
            expect(result.tooltipsEnabled).toBe(true);
        });
    });

    describe('selectors', () => {
        it('should select entire UI state', () => {
            // Arrange
            const state = { ui: createInitialState() };

            // Act
            const result = selectUI(state);

            // Assert
            expect(result).toEqual(state.ui);
        });

        it('should select sidebars state', () => {
            // Arrange
            const state = { ui: createInitialState() };
            state.ui.leftSidebarOpen = false;
            state.ui.rightSidebarOpen = true;

            // Act
            const result = selectSidebars(state);

            // Assert
            expect(result).toEqual({ left: false, right: true });
        });

        it('should select loading state', () => {
            // Arrange
            const state = { ui: createInitialState() };
            state.ui.loading.auth = true;
            state.ui.loading.global = true;

            // Act
            const result = selectLoading(state);

            // Assert
            expect(result.auth).toBe(true);
            expect(result.global).toBe(true);
            expect(result.assets).toBe(false);
        });

        it('should select modals state', () => {
            // Arrange
            const state = { ui: createInitialState() };
            state.ui.modals['testModal'] = { open: true, data: { id: '123' } };

            // Act
            const result = selectModals(state);

            // Assert
            expect(result['testModal']).toEqual({ open: true, data: { id: '123' } });
        });

        it('should select notifications state', () => {
            // Arrange
            const state = { ui: createInitialState() };
            state.ui.notifications = [
                { id: '1', type: 'success', message: 'Test', duration: 5000, timestamp: 1000 },
            ];

            // Act
            const result = selectNotifications(state);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]?.message).toBe('Test');
        });

        it('should select theme state', () => {
            // Arrange
            const state = { ui: createInitialState() };
            state.ui.theme = 'dark';

            // Act
            const result = selectTheme(state);

            // Assert
            expect(result).toBe('dark');
        });

        it('should select help state', () => {
            // Arrange
            const state = { ui: createInitialState() };
            state.ui.helpVisible = true;
            state.ui.helpTopic = 'test-topic';
            state.ui.tooltipsEnabled = false;

            // Act
            const result = selectHelp(state);

            // Assert
            expect(result).toEqual({
                visible: true,
                topic: 'test-topic',
                tooltipsEnabled: false,
            });
        });
    });
});
