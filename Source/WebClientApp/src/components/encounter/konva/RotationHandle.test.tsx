import { ThemeProvider, createTheme } from '@mui/material';
import { render } from '@testing-library/react';
import type Konva from 'konva';
import React from 'react';
import { Stage, Layer } from 'react-konva';
import { describe, expect, it, vi } from 'vitest';
import { RotationHandle } from './RotationHandle';

const theme = createTheme();

const renderWithKonva = (ui: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            <Stage width={300} height={300}>
                <Layer>{ui}</Layer>
            </Stage>
        </ThemeProvider>,
    );
};

describe('RotationHandle', () => {
    const defaultProps = {
        center: { x: 100, y: 100 },
        rotation: 0,
        assetSize: { width: 64, height: 64 },
        scale: 1,
        onMouseDown: vi.fn<(e: Konva.KonvaEventObject<MouseEvent>) => void>(),
    };

    it('should render without crashing', () => {
        expect(() => renderWithKonva(<RotationHandle {...defaultProps} />)).not.toThrow();
    });

    it('should render with various rotation angles', () => {
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} rotation={90} />),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} rotation={180} />),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} rotation={270} />),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} rotation={-45} />),
        ).not.toThrow();
    });

    it('should render with different asset sizes', () => {
        expect(() =>
            renderWithKonva(
                <RotationHandle {...defaultProps} assetSize={{ width: 128, height: 64 }} />,
            ),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(
                <RotationHandle {...defaultProps} assetSize={{ width: 32, height: 32 }} />,
            ),
        ).not.toThrow();
    });

    it('should render with different scales', () => {
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} scale={0.5} />),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} scale={2} />),
        ).not.toThrow();
    });

    it('should render with isRotating flag', () => {
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} isRotating={true} />),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} isRotating={false} />),
        ).not.toThrow();
    });

    it('should render at different center positions', () => {
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} center={{ x: 0, y: 0 }} />),
        ).not.toThrow();
        expect(() =>
            renderWithKonva(<RotationHandle {...defaultProps} center={{ x: -50, y: -50 }} />),
        ).not.toThrow();
    });
});
