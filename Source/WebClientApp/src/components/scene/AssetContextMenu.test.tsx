import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssetContextMenu } from './AssetContextMenu';
import { DisplayName, LabelPosition } from '../../types/domain';

describe('AssetContextMenu', () => {
    const mockAsset = {
        id: '123',
        name: 'Test Asset',
        displayName: DisplayName.Default,
        labelPosition: LabelPosition.Default,
    } as any;

    it('renders menu when open', () => {
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={vi.fn()}
            />
        );

        expect(screen.getByText('Rename')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={false}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={vi.fn()}
            />
        );

        expect(screen.queryByText('Rename')).not.toBeInTheDocument();
    });

    it('shows rename input when rename is clicked', () => {
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Rename'));

        expect(screen.getByPlaceholderText('Asset name')).toBeInTheDocument();
    });

    it('validates empty name', async () => {
        const onRename = vi.fn();
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={onRename}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Rename'));

        const input = screen.getByPlaceholderText('Asset name');
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
        });
        expect(onRename).not.toHaveBeenCalled();
    });

    it('validates max length (128 characters)', async () => {
        const onRename = vi.fn();
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={onRename}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Rename'));

        const input = screen.getByPlaceholderText('Asset name');
        const longName = 'a'.repeat(129);
        fireEvent.change(input, { target: { value: longName } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(screen.getByText(/too long/i)).toBeInTheDocument();
        });
        expect(onRename).not.toHaveBeenCalled();
    });

    it('calls onRename with valid name', async () => {
        const onRename = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={onClose}
                asset={mockAsset}
                onRename={onRename}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Rename'));

        const input = screen.getByPlaceholderText('Asset name');
        fireEvent.change(input, { target: { value: 'New Name' } });
        fireEvent.blur(input);

        await waitFor(() => {
            expect(onRename).toHaveBeenCalledWith('123', 'New Name');
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('shows display name submenu', () => {
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Display Label'));

        expect(screen.getByText('Always')).toBeInTheDocument();
        expect(screen.getByText('OnHover')).toBeInTheDocument();
        expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('shows label position submenu', () => {
        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Label Position'));

        expect(screen.getByText('Top')).toBeInTheDocument();
        expect(screen.getByText('Middle')).toBeInTheDocument();
        expect(screen.getByText('Bottom')).toBeInTheDocument();
    });

    it('shows checkmark for current display name', () => {
        const assetWithDisplay = {
            ...mockAsset,
            displayName: DisplayName.Always,
        };

        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={vi.fn()}
                asset={assetWithDisplay}
                onRename={vi.fn()}
                onUpdateDisplay={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Display Label'));

        const alwaysItem = screen.getByText('Always').closest('li');
        expect(alwaysItem?.querySelector('svg')).toBeInTheDocument();
    });

    it('calls onUpdateDisplay when display name is changed', async () => {
        const onUpdateDisplay = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();

        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={onClose}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={onUpdateDisplay}
            />
        );

        fireEvent.click(screen.getByText('Display Label'));
        fireEvent.click(screen.getByText('Always'));

        await waitFor(() => {
            expect(onUpdateDisplay).toHaveBeenCalledWith('123', DisplayName.Always, undefined);
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onUpdateDisplay when label position is changed', async () => {
        const onUpdateDisplay = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();

        render(
            <AssetContextMenu
                anchorPosition={{ left: 100, top: 100 }}
                open={true}
                onClose={onClose}
                asset={mockAsset}
                onRename={vi.fn()}
                onUpdateDisplay={onUpdateDisplay}
            />
        );

        fireEvent.click(screen.getByText('Label Position'));
        fireEvent.click(screen.getByText('Top'));

        await waitFor(() => {
            expect(onUpdateDisplay).toHaveBeenCalledWith('123', undefined, LabelPosition.Top);
        });
        expect(onClose).toHaveBeenCalled();
    });
});
