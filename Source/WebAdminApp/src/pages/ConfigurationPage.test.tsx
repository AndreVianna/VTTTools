/**
 * ConfigurationPage Component Tests
 * Tests configuration viewer rendering, tab switching, and modal interaction
 * Coverage: Configuration management workflow for WebAdminApp
 *
 * NOTE: These tests may encounter "EMFILE: too many open files" on Windows
 * due to MUI icons-material loading. This is a known issue with MUI + Vitest on Windows.
 * Solutions:
 * 1. Increase system file handle limit (ulimit -n 4096 on Unix, or registry on Windows)
 * 2. Run tests in WSL/Linux environment
 * 3. Use --no-threads flag: npm test -- --no-threads
 *
 * Test Coverage:
 * - Page title rendering
 * - Read-only info alert display
 * - Service tabs rendering
 * - Loading skeletons display
 * - Config entries grouped by category
 * - Tab switching behavior
 * - Reveal modal opening for redacted values
 * - Error alert display on API failure
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigurationPage } from './ConfigurationPage';
import type { ConfigurationResponse } from '@services/configurationService';

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const ExpandMoreComponent = () => <span>ExpandMoreIcon</span>;
    const LockComponent = () => <span>LockIcon</span>;
    const ContentCopyComponent = () => <span>ContentCopyIcon</span>;
    return {
        ExpandMore: ExpandMoreComponent,
        Lock: LockComponent,
        ContentCopy: ContentCopyComponent,
    };
});

// Mock configurationService
const mockGetConfiguration = vi.fn();

// Import the actual enum type for proper typing
import type { ConfigSourceType as ConfigSourceTypeEnum } from '@services/configurationService';

// Define mock enum values that match the real ConfigSourceType
const MockConfigSourceType = {
    EnvironmentVariable: 'EnvironmentVariable' as ConfigSourceTypeEnum,
    JsonFile: 'JsonFile' as ConfigSourceTypeEnum,
    UserSecrets: 'UserSecrets' as ConfigSourceTypeEnum,
    AzureKeyVault: 'AzureKeyVault' as ConfigSourceTypeEnum,
    AzureAppConfiguration: 'AzureAppConfiguration' as ConfigSourceTypeEnum,
    CommandLine: 'CommandLine' as ConfigSourceTypeEnum,
    InMemory: 'InMemory' as ConfigSourceTypeEnum,
    FrontendEnvFile: 'FrontendEnvFile' as ConfigSourceTypeEnum,
    Unknown: 'Unknown' as ConfigSourceTypeEnum,
    NotFound: 'NotFound' as ConfigSourceTypeEnum,
};

vi.mock('@services/configurationService', () => ({
    configurationService: {
        getConfiguration: (serviceName: string) => mockGetConfiguration(serviceName),
    },
    ConfigSourceType: MockConfigSourceType,
}));

// Mock RevealValueModal component
vi.mock('@components/configuration/RevealValueModal', () => ({
    RevealValueModal: ({ open, configKey }: { open: boolean; configKey: string }) =>
        open ? <div role="dialog" aria-label="Reveal Value Modal">{configKey}</div> : null,
}));

describe('ConfigurationPage', () => {
    const createMockConfig = (overrides: Partial<ConfigurationResponse> = {}): ConfigurationResponse => ({
        serviceName: 'Admin',
        entries: [
            {
                key: 'ConnectionStrings:DefaultConnection',
                value: 'Server=localhost;Database=Test',
                isRedacted: false,
                category: 'Database',
                source: { type: MockConfigSourceType.JsonFile, path: 'appsettings.json' },
            },
            {
                key: 'JwtSettings:Secret',
                value: '',
                isRedacted: true,
                category: 'Security',
                source: { type: MockConfigSourceType.UserSecrets, path: null },
            },
            {
                key: 'Logging:LogLevel:Default',
                value: 'Information',
                isRedacted: false,
                category: 'Logging',
                source: { type: MockConfigSourceType.JsonFile, path: 'appsettings.json' },
            },
        ],
        ...overrides,
    });

    beforeEach(() => {
        vi.resetAllMocks();
        mockGetConfiguration.mockResolvedValue(createMockConfig());
    });

    describe('Rendering', () => {
        it('should render page title "Configuration Viewer"', async () => {
            // Arrange & Act
            render(<ConfigurationPage />);

            // Assert
            expect(screen.getByRole('heading', { name: /configuration viewer/i })).toBeInTheDocument();

            // Wait for loading to complete to prevent act() warnings
            await waitFor(() => {
                expect(mockGetConfiguration).toHaveBeenCalled();
            });
        });

        it('should display info alert about read-only config', async () => {
            // Arrange & Act
            render(<ConfigurationPage />);

            // Assert
            const infoAlert = screen.getByRole('alert');
            expect(infoAlert).toBeInTheDocument();
            expect(infoAlert).toHaveTextContent(/configuration is read-only/i);
            expect(infoAlert).toHaveTextContent(/edit appsettings\.json or environment variables/i);

            // Wait for loading to complete
            await waitFor(() => {
                expect(mockGetConfiguration).toHaveBeenCalled();
            });
        });

        it('should render service tabs', async () => {
            // Arrange & Act
            render(<ConfigurationPage />);

            // Assert - Check for all 8 service tabs
            expect(screen.getByRole('tab', { name: /admin app/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /^admin$/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /main app/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /library/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /assets/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /media/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /game/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /auth/i })).toBeInTheDocument();

            // Wait for loading to complete
            await waitFor(() => {
                expect(mockGetConfiguration).toHaveBeenCalled();
            });
        });

        it('should show loading skeletons while loading', async () => {
            // Arrange
            let resolveConfig: (value: ConfigurationResponse) => void = () => {};
            mockGetConfiguration.mockImplementation(() => new Promise((resolve) => {
                resolveConfig = resolve;
            }));

            // Act
            render(<ConfigurationPage />);

            // Assert - Skeletons should be visible during loading
            // MUI Skeleton components don't have accessible roles, so we check for the container Paper
            const loadingPaper = screen.getByText('Configuration Viewer').closest('div')?.parentElement;
            expect(loadingPaper).toBeInTheDocument();

            // The component shows Paper with Skeletons inside
            // We can verify loading state by checking there are no accordion elements yet
            expect(screen.queryByRole('button', { name: /database/i })).not.toBeInTheDocument();

            // Cleanup: resolve to prevent unhandled promise
            resolveConfig(createMockConfig());
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument();
            });
        });

        it('should display config entries grouped by category', async () => {
            // Arrange & Act
            render(<ConfigurationPage />);

            // Assert - Wait for data to load and check category accordions
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument();
            });

            // Check category headers (accordion summaries use button role)
            expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /logging/i })).toBeInTheDocument();

            // Check config entries in table
            expect(screen.getByText('ConnectionStrings:DefaultConnection')).toBeInTheDocument();
            expect(screen.getByText('Server=localhost;Database=Test')).toBeInTheDocument();
            expect(screen.getByText('JwtSettings:Secret')).toBeInTheDocument();

            // Check redacted value display
            expect(screen.getByText('***REDACTED***')).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should switch service when tab clicked', async () => {
            // Arrange
            const adminConfig = createMockConfig({ serviceName: 'WebAdminApp' });
            const libraryConfig = createMockConfig({
                serviceName: 'Library',
                entries: [
                    {
                        key: 'Library:CacheTimeout',
                        value: '3600',
                        isRedacted: false,
                        category: 'Cache',
                        source: { type: MockConfigSourceType.JsonFile, path: 'appsettings.json' },
                    },
                ],
            });

            mockGetConfiguration
                .mockResolvedValueOnce(adminConfig)
                .mockResolvedValueOnce(libraryConfig);

            // Act
            render(<ConfigurationPage />);

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getByText('ConnectionStrings:DefaultConnection')).toBeInTheDocument();
            });

            // Click on Library tab
            const libraryTab = screen.getByRole('tab', { name: /library/i });
            fireEvent.click(libraryTab);

            // Assert - Service should be called with Library
            await waitFor(() => {
                expect(mockGetConfiguration).toHaveBeenCalledWith('Library');
            });

            // New config should be displayed
            await waitFor(() => {
                expect(screen.getByText('Library:CacheTimeout')).toBeInTheDocument();
            });
        });

        it('should open reveal modal when Reveal button clicked for redacted value', async () => {
            // Arrange & Act
            render(<ConfigurationPage />);

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('JwtSettings:Secret')).toBeInTheDocument();
            });

            // Find and click the Reveal button
            const revealButton = screen.getByRole('button', { name: /reveal/i });
            fireEvent.click(revealButton);

            // Assert - Modal should be open with the config key
            await waitFor(() => {
                expect(screen.getByRole('dialog', { name: /reveal value modal/i })).toBeInTheDocument();
            });

            // Modal should display the config key
            const modal = screen.getByRole('dialog');
            expect(modal).toHaveTextContent('JwtSettings:Secret');
        });

        it('should display error alert on API failure', async () => {
            // Arrange
            mockGetConfiguration.mockRejectedValue(new Error('Network error'));

            // Act
            render(<ConfigurationPage />);

            // Assert - Error alert should appear
            await waitFor(() => {
                const alerts = screen.getAllByRole('alert');
                const errorAlert = alerts.find(alert => alert.className.includes('MuiAlert-standardError'));
                expect(errorAlert).toBeInTheDocument();
            });

            expect(screen.getByText('Failed to load configuration. Please try again.')).toBeInTheDocument();
        });
    });
});
