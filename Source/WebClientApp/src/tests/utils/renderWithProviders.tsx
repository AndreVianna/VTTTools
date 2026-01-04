import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { createTestStore, type TestStore, type TestStoreOptions } from './createTestStore';
import type { RootState } from '@/store';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
    preloadedState?: Partial<RootState>;
    store?: TestStore;
    theme?: 'light' | 'dark';
    route?: string;
    useMemoryRouter?: boolean;
}

export const renderWithProviders = (
    ui: React.ReactElement,
    {
        preloadedState = {},
        store = createTestStore({ preloadedState } as TestStoreOptions),
        theme = 'light',
        route = '/',
        useMemoryRouter = false,
        ...renderOptions
    }: RenderWithProvidersOptions = {},
) => {
    const muiTheme = createTheme({
        palette: {
            mode: theme,
        },
    });

    const Router = useMemoryRouter ? MemoryRouter : BrowserRouter;
    const routerProps = useMemoryRouter ? { initialEntries: [route] } : {};

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <ThemeProvider theme={muiTheme}>
                <Router {...routerProps}>
                    {children}
                </Router>
            </ThemeProvider>
        </Provider>
    );

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
