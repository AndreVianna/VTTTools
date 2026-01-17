import { ThemeProvider, createTheme } from '@mui/material';
import { render } from '@testing-library/react';
import { Stage, Layer } from 'react-konva';
import { describe, expect, it } from 'vitest';
import { InsertPreviewMarker } from './InsertPreviewMarker';

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

describe('InsertPreviewMarker', () => {
    it('should render without crashing', () => {
        const position = { x: 50, y: 50 };
        expect(() =>
            renderWithKonva(<InsertPreviewMarker position={position} />),
        ).not.toThrow();
    });

    it('should accept custom radius', () => {
        const position = { x: 50, y: 50 };
        expect(() =>
            renderWithKonva(<InsertPreviewMarker position={position} radius={10} />),
        ).not.toThrow();
    });

    it('should accept custom opacity', () => {
        const position = { x: 50, y: 50 };
        expect(() =>
            renderWithKonva(<InsertPreviewMarker position={position} opacity={0.5} />),
        ).not.toThrow();
    });

    it('should render at origin', () => {
        const position = { x: 0, y: 0 };
        expect(() =>
            renderWithKonva(<InsertPreviewMarker position={position} />),
        ).not.toThrow();
    });

    it('should render at negative coordinates', () => {
        const position = { x: -100, y: -100 };
        expect(() =>
            renderWithKonva(<InsertPreviewMarker position={position} />),
        ).not.toThrow();
    });
});
