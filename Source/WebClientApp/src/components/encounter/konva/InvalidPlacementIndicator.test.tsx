import { render } from '@testing-library/react';
import { Stage, Layer } from 'react-konva';
import { describe, expect, it } from 'vitest';
import { InvalidPlacementIndicator } from './InvalidPlacementIndicator';

const renderWithKonva = (ui: React.ReactElement) => {
    return render(
        <Stage width={300} height={300}>
            <Layer>{ui}</Layer>
        </Stage>,
    );
};

describe('InvalidPlacementIndicator', () => {
    it('should render without crashing', () => {
        const position = { x: 50, y: 50 };
        expect(() =>
            renderWithKonva(<InvalidPlacementIndicator position={position} />),
        ).not.toThrow();
    });

    it('should render at origin', () => {
        const position = { x: 0, y: 0 };
        expect(() =>
            renderWithKonva(<InvalidPlacementIndicator position={position} />),
        ).not.toThrow();
    });

    it('should render at negative coordinates', () => {
        const position = { x: -100, y: -100 };
        expect(() =>
            renderWithKonva(<InvalidPlacementIndicator position={position} />),
        ).not.toThrow();
    });

    it('should render at large coordinates', () => {
        const position = { x: 5000, y: 5000 };
        expect(() =>
            renderWithKonva(<InvalidPlacementIndicator position={position} />),
        ).not.toThrow();
    });
});
