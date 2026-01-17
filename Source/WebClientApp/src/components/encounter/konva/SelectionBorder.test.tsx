import { ThemeProvider, createTheme } from '@mui/material';
import { render } from '@testing-library/react';
import { Stage, Layer } from 'react-konva';
import { describe, expect, it } from 'vitest';
import { SelectionBorder } from './SelectionBorder';

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

describe('SelectionBorder', () => {
    it('should render without crashing', () => {
        const bounds = { x: 10, y: 20, width: 100, height: 50 };
        expect(() => renderWithKonva(<SelectionBorder bounds={bounds} />)).not.toThrow();
    });

    it('should accept custom stroke color', () => {
        const bounds = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<SelectionBorder bounds={bounds} strokeColor="#ff0000" />),
        ).not.toThrow();
    });

    it('should accept custom stroke width', () => {
        const bounds = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<SelectionBorder bounds={bounds} strokeWidth={4} />),
        ).not.toThrow();
    });

    it('should render with zero-size bounds', () => {
        const bounds = { x: 0, y: 0, width: 0, height: 0 };
        expect(() => renderWithKonva(<SelectionBorder bounds={bounds} />)).not.toThrow();
    });

    it('should render at negative coordinates', () => {
        const bounds = { x: -50, y: -50, width: 100, height: 100 };
        expect(() => renderWithKonva(<SelectionBorder bounds={bounds} />)).not.toThrow();
    });
});
