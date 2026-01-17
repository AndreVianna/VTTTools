import { ThemeProvider, createTheme } from '@mui/material';
import { render } from '@testing-library/react';
import { Stage, Layer } from 'react-konva';
import { describe, expect, it } from 'vitest';
import { MarqueeRect } from './MarqueeRect';

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

describe('MarqueeRect', () => {
    it('should render without crashing', () => {
        const rect = { x: 10, y: 20, width: 100, height: 50 };
        expect(() => renderWithKonva(<MarqueeRect rect={rect} />)).not.toThrow();
    });

    it('should accept custom stroke color', () => {
        const rect = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<MarqueeRect rect={rect} strokeColor="#ff0000" />),
        ).not.toThrow();
    });

    it('should accept custom fill color', () => {
        const rect = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<MarqueeRect rect={rect} fillColor="#00ff00" />),
        ).not.toThrow();
    });

    it('should accept custom fill opacity', () => {
        const rect = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<MarqueeRect rect={rect} fillOpacity={0.5} />),
        ).not.toThrow();
    });

    it('should accept custom stroke width', () => {
        const rect = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<MarqueeRect rect={rect} strokeWidth={3} />),
        ).not.toThrow();
    });

    it('should accept custom dash pattern', () => {
        const rect = { x: 10, y: 20, width: 100, height: 50 };
        expect(() =>
            renderWithKonva(<MarqueeRect rect={rect} dash={[10, 5]} />),
        ).not.toThrow();
    });

    it('should render with zero-size rect', () => {
        const rect = { x: 0, y: 0, width: 0, height: 0 };
        expect(() => renderWithKonva(<MarqueeRect rect={rect} />)).not.toThrow();
    });
});
