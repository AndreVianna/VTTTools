import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { WallsPanel } from './WallsPanel';
import { WALL_PRESETS } from './wallsPanelTypes';
import { WallVisibility, type Barrier, type SceneBarrier } from '@/types/domain';

const theme = createTheme();

const mockBarrier: Barrier = {
    id: 'barrier-1',
    ownerId: 'user-1',
    name: 'Stone Wall',
    description: 'A solid stone wall',
    poles: [
        { x: 0, y: 0, h: 2.0 },
        { x: 100, y: 0, h: 2.0 }
    ],
    visibility: WallVisibility.Normal,
    isClosed: false,
    material: 'Stone',
    createdAt: new Date().toISOString()
};

const mockSceneBarrier: SceneBarrier = {
    id: 'scene-barrier-1',
    sceneId: 'scene-1',
    barrierId: 'barrier-1',
    poles: [
        { x: 0, y: 0, h: 2.0 },
        { x: 100, y: 0, h: 2.0 }
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
    it('renders 3 wall type preset icons', () => {
        renderComponent();

        expect(screen.getByText('Wall Type Presets')).toBeInTheDocument();
        const presetButtons = screen.getAllByRole('button').filter(b => b.getAttribute('aria-label')?.includes('Normal') || b.getAttribute('aria-label')?.includes('Fence') || b.getAttribute('aria-label')?.includes('Invisible'));
        expect(presetButtons.length).toBeGreaterThanOrEqual(3);
    });

    it('renders wall property controls', () => {
        renderComponent();

        expect(screen.getByLabelText(/Closed/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Material/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Default Height/i)).toBeInTheDocument();
    });

    it('calls onPresetSelect when preset is clicked', () => {
        const onPresetSelect = vi.fn();
        renderComponent({ onPresetSelect });

        const presetButtons = screen.getAllByRole('button');
        const firstPreset = presetButtons[0];
        fireEvent.click(firstPreset);

        expect(onPresetSelect).toHaveBeenCalledWith(expect.objectContaining({
            visibility: expect.any(String),
            isClosed: expect.any(Boolean)
        }));
    });

    it('calls onPlaceWall when Place Wall button is clicked', () => {
        const onPlaceWall = vi.fn();
        renderComponent({ onPlaceWall });

        const placeButton = screen.getByText('Place Wall');
        fireEvent.click(placeButton);

        expect(onPlaceWall).toHaveBeenCalledWith(
            expect.objectContaining({
                visibility: WallVisibility.Normal,
                isClosed: false,
                defaultHeight: 10.0,
                material: 'Stone'
            })
        );
    });

    it('displays placed walls list with pole count', () => {
        renderComponent({
            barriers: [mockBarrier],
            sceneBarriers: [mockSceneBarrier]
        });

        expect(screen.getByText('Stone Wall')).toBeInTheDocument();
        expect(screen.getByText('Stone - 2 poles')).toBeInTheDocument();
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
