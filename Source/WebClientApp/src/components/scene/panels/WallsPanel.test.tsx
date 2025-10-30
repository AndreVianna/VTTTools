import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { WallsPanel } from './WallsPanel';
import { WALL_PRESETS } from './wallsPanelTypes';
import type { Barrier, SceneBarrier } from '@/types/domain';

const theme = createTheme();

const mockBarrier: Barrier = {
    id: 'barrier-1',
    ownerId: 'user-1',
    name: 'Stone Wall',
    description: 'A solid stone wall',
    isOpaque: true,
    isSolid: true,
    isSecret: false,
    isOpenable: false,
    isLocked: false,
    material: 'Stone',
    height: 2.0,
    createdAt: new Date().toISOString()
};

const mockSceneBarrier: SceneBarrier = {
    id: 'scene-barrier-1',
    sceneId: 'scene-1',
    barrierId: 'barrier-1',
    vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 }
    ]
};

const renderComponent = (props = {}) => {
    return render(
        <ThemeProvider theme={theme}>
            <WallsPanel {...props} />
        </ThemeProvider>
    );
};

describe('WallsPanel', () => {
    it('renders wall type presets', () => {
        renderComponent();

        expect(screen.getByText('Normal Solid')).toBeInTheDocument();
        expect(screen.getByText('Invisible')).toBeInTheDocument();
        expect(screen.getByText('Secret')).toBeInTheDocument();
        expect(screen.getByText('Virtual')).toBeInTheDocument();
    });

    it('renders wall property checkboxes', () => {
        renderComponent();

        expect(screen.getByLabelText('Opaque')).toBeInTheDocument();
        expect(screen.getByLabelText('Solid')).toBeInTheDocument();
        expect(screen.getByLabelText('Secret')).toBeInTheDocument();
        expect(screen.getByLabelText('Openable')).toBeInTheDocument();
        expect(screen.getByLabelText('Locked')).toBeInTheDocument();
    });

    it('calls onPresetSelect when preset is clicked', () => {
        const onPresetSelect = vi.fn();
        renderComponent({ onPresetSelect });

        const normalSolidButton = screen.getByText('Normal Solid').closest('button');
        fireEvent.click(normalSolidButton!);

        expect(onPresetSelect).toHaveBeenCalledWith(WALL_PRESETS[0]);
    });

    it('calls onPlaceWall when Place Wall button is clicked', () => {
        const onPlaceWall = vi.fn();
        renderComponent({ onPlaceWall });

        const placeButton = screen.getByText('Place Wall');
        fireEvent.click(placeButton);

        expect(onPlaceWall).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpaque: true,
                isSolid: true,
                isSecret: false,
                isOpenable: false,
                isLocked: false
            })
        );
    });

    it('displays placed walls list', () => {
        renderComponent({
            barriers: [mockBarrier],
            sceneBarriers: [mockSceneBarrier]
        });

        expect(screen.getByText('Stone Wall')).toBeInTheDocument();
        expect(screen.getByText('Stone - 2u')).toBeInTheDocument();
    });

    it('displays "No walls placed" when empty', () => {
        renderComponent({
            barriers: [],
            sceneBarriers: []
        });

        expect(screen.getByText('No walls placed')).toBeInTheDocument();
    });

    it('shows selected wall editor when barrier is selected', () => {
        renderComponent({
            barriers: [mockBarrier],
            sceneBarriers: [mockSceneBarrier],
            selectedBarrierId: mockSceneBarrier.id
        });

        expect(screen.getByText('Selected Wall')).toBeInTheDocument();
        expect(screen.getByText('Edit Vertices')).toBeInTheDocument();
    });

    it('disables Locked checkbox when Openable is unchecked', () => {
        renderComponent();

        const lockedCheckbox = screen.getByLabelText('Locked') as HTMLInputElement;
        expect(lockedCheckbox).toBeDisabled();

        const openableCheckbox = screen.getByLabelText('Openable') as HTMLInputElement;
        fireEvent.click(openableCheckbox);

        expect(lockedCheckbox).not.toBeDisabled();
    });

    it('calls onBarrierSelect when wall is clicked in list', () => {
        const onBarrierSelect = vi.fn();
        renderComponent({
            barriers: [mockBarrier],
            sceneBarriers: [mockSceneBarrier],
            onBarrierSelect
        });

        const wallListItem = screen.getByText('Stone Wall').closest('button');
        fireEvent.click(wallListItem!);

        expect(onBarrierSelect).toHaveBeenCalledWith(mockSceneBarrier.id);
    });
});
