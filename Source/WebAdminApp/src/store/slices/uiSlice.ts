import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  theme: 'light' | 'dark';
  drawerOpen: boolean;
}

const THEME_STORAGE_KEY = 'vtttools-admin-theme';

const loadThemeFromStorage = (): 'light' | 'dark' => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (_error) {
    console.warn('Failed to load theme from localStorage:', _error);
  }
  return 'light';
};

const saveThemeToStorage = (theme: 'light' | 'dark') => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_error) {
    console.warn('Failed to save theme to localStorage:', _error);
  }
};

const initialState: UIState = {
  theme: loadThemeFromStorage(),
  drawerOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      saveThemeToStorage(action.payload);
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      saveThemeToStorage(state.theme);
    },

    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload;
    },

    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setDrawerOpen,
  toggleDrawer,
} = uiSlice.actions;

export default uiSlice.reducer;

export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectDrawerOpen = (state: { ui: UIState }) => state.ui.drawerOpen;
