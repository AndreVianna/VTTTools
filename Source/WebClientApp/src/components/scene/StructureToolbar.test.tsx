import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StructureToolbar } from './StructureToolbar';

describe('StructureToolbar', () => {
    it('should render all structure buttons', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        expect(screen.getByLabelText('Draw Wall')).toBeInTheDocument();
        expect(screen.getByLabelText('Draw Region')).toBeInTheDocument();
        expect(screen.getByLabelText('Place Light Source')).toBeInTheDocument();
        expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
    });

    it('should highlight active drawing mode button', () => {
        const onModeChange = vi.fn();
        const { rerender } = render(
            <StructureToolbar drawingMode="Wall" onModeChange={onModeChange} />
        );

        const WallButton = screen.getByLabelText('Draw Wall');
        expect(WallButton).toHaveAttribute('color', 'primary');

        rerender(<StructureToolbar drawingMode="region" onModeChange={onModeChange} />);
        const regionButton = screen.getByLabelText('Draw Region');
        expect(regionButton).toHaveAttribute('color', 'primary');
    });

    it('should call onModeChange when Wall button clicked', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        fireEvent.click(screen.getByLabelText('Draw Wall'));

        expect(onModeChange).toHaveBeenCalledWith('Wall');
    });

    it('should call onModeChange when region button clicked', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        fireEvent.click(screen.getByLabelText('Draw Region'));

        expect(onModeChange).toHaveBeenCalledWith('region');
    });

    it('should call onModeChange when source button clicked', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        fireEvent.click(screen.getByLabelText('Place Light Source'));

        expect(onModeChange).toHaveBeenCalledWith('source');
    });

    it('should call onModeChange when cancel button clicked', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode="Wall" onModeChange={onModeChange} />);

        fireEvent.click(screen.getByLabelText('Cancel'));

        expect(onModeChange).toHaveBeenCalledWith(null);
    });

    it('should disable cancel button when no active mode', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        const cancelButton = screen.getByLabelText('Cancel');
        expect(cancelButton).toBeDisabled();
    });

    it('should activate Wall mode with W key', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        fireEvent.keyDown(window, { key: 'w' });

        expect(onModeChange).toHaveBeenCalledWith('Wall');
    });

    it('should activate region mode with R key', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        fireEvent.keyDown(window, { key: 'r' });

        expect(onModeChange).toHaveBeenCalledWith('region');
    });

    it('should activate source mode with L key', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} />);

        fireEvent.keyDown(window, { key: 'l' });

        expect(onModeChange).toHaveBeenCalledWith('source');
    });

    it('should cancel drawing mode with Escape key', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode="Wall" onModeChange={onModeChange} />);

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(onModeChange).toHaveBeenCalledWith(null);
    });

    it('should disable all buttons when disabled prop is true', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} disabled={true} />);

        expect(screen.getByLabelText('Draw Wall')).toBeDisabled();
        expect(screen.getByLabelText('Draw Region')).toBeDisabled();
        expect(screen.getByLabelText('Place Light Source')).toBeDisabled();
        expect(screen.getByLabelText('Cancel')).toBeDisabled();
    });

    it('should not respond to keyboard when disabled', () => {
        const onModeChange = vi.fn();
        render(<StructureToolbar drawingMode={null} onModeChange={onModeChange} disabled={true} />);

        fireEvent.keyDown(window, { key: 'w' });

        expect(onModeChange).not.toHaveBeenCalled();
    });
});
