import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './msw/server';
import { resetEncounterMocks } from './msw/handlers/encounter';
import { resetStageMocks } from './msw/handlers/stage';

// Establish API mocking before all tests
beforeAll(() => {
    server.listen({
        onUnhandledRequest: 'warn', // Warn about unhandled requests, don't fail
    });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
    server.resetHandlers();
    // Reset in-memory mock stores
    resetEncounterMocks();
    resetStageMocks();
});

// Clean up after the tests are finished
afterAll(() => {
    server.close();
});

// Mock window.matchMedia for MUI components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver for components that use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver for lazy loading components
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock URL.createObjectURL for file/blob handling
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Suppress known console noise during tests
// Set VITEST_VERBOSE_CONSOLE=1 to see all console output for debugging
const originalError = console.error;
const originalWarn = console.warn;
const verboseConsole = process.env.VITEST_VERBOSE_CONSOLE === '1';

// Known error messages to suppress (won't affect test results)
const SUPPRESSED_ERRORS = [
    // React 18 createRoot migration - irrelevant for testing library
    'Warning: ReactDOM.render is no longer supported',
    // Common during state updates in async tests - testing library handles this
    'Warning: An update to',
    // Testing library act() warnings - handled automatically by testing library
    'act(...)',
    // MUI warnings about missing props in test environment
    'MUI:',
];

// Known warning messages to suppress
const SUPPRESSED_WARNINGS = [
    // React Router future flags - not relevant for unit tests
    'React Router',
    // MSW handler warnings we already configured separately
    '[MSW]',
];

const shouldSuppress = (message: unknown, patterns: string[]): boolean => {
    if (typeof message !== 'string') return false;
    return patterns.some(pattern => message.includes(pattern));
};

beforeAll(() => {
    if (!verboseConsole) {
        console.error = (...args: unknown[]) => {
            if (!shouldSuppress(args[0], SUPPRESSED_ERRORS)) {
                originalError.apply(console, args);
            }
        };
        console.warn = (...args: unknown[]) => {
            if (!shouldSuppress(args[0], SUPPRESSED_WARNINGS)) {
                originalWarn.apply(console, args);
            }
        };
    }
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});
