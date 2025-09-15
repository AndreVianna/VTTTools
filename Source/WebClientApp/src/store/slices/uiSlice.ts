import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  // Layout state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // Loading states for different features
  loading: {
    global: boolean;
    auth: boolean;
    assets: boolean;
    adventures: boolean;
    scenes: boolean;
    sessions: boolean;
  };

  // Modal and dialog state
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };

  // Toast notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    timestamp: number;
  }>;

  // Theme and appearance
  theme: 'light' | 'dark';

  // Help system
  helpVisible: boolean;
  helpTopic?: string;
  tooltipsEnabled: boolean;
}

const initialState: UIState = {
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  loading: {
    global: false,
    auth: false,
    assets: false,
    adventures: false,
    scenes: false,
    sessions: false,
  },
  modals: {},
  notifications: [],
  theme: 'light',
  helpVisible: false,
  tooltipsEnabled: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar controls
    toggleLeftSidebar: (state) => {
      state.leftSidebarOpen = !state.leftSidebarOpen;
    },

    toggleRightSidebar: (state) => {
      state.rightSidebarOpen = !state.rightSidebarOpen;
    },

    setLeftSidebar: (state, action: PayloadAction<boolean>) => {
      state.leftSidebarOpen = action.payload;
    },

    setRightSidebar: (state, action: PayloadAction<boolean>) => {
      state.rightSidebarOpen = action.payload;
    },

    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    setFeatureLoading: (state, action: PayloadAction<{
      feature: keyof UIState['loading'];
      loading: boolean;
    }>) => {
      state.loading[action.payload.feature] = action.payload.loading;
    },

    // Modal management
    openModal: (state, action: PayloadAction<{
      id: string;
      data?: any;
    }>) => {
      state.modals[action.payload.id] = {
        open: true,
        data: action.payload.data,
      };
    },

    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].open = false;
      }
    },

    clearModal: (state, action: PayloadAction<string>) => {
      delete state.modals[action.payload];
    },

    // Notification management
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        duration: 5000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Theme management
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Help system
    showHelp: (state, action: PayloadAction<string | undefined>) => {
      state.helpVisible = true;
      state.helpTopic = action.payload;
    },

    hideHelp: (state) => {
      state.helpVisible = false;
      state.helpTopic = undefined;
    },

    toggleTooltips: (state) => {
      state.tooltipsEnabled = !state.tooltipsEnabled;
    },
  },
});

export const {
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
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectSidebars = (state: { ui: UIState }) => ({
  left: state.ui.leftSidebarOpen,
  right: state.ui.rightSidebarOpen,
});
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectHelp = (state: { ui: UIState }) => ({
  visible: state.ui.helpVisible,
  topic: state.ui.helpTopic,
  tooltipsEnabled: state.ui.tooltipsEnabled,
});