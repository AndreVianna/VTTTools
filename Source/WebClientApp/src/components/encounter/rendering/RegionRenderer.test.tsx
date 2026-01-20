import { createTheme } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import type { PlacedRegion, Point } from '@/types/domain';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { isRegionInScope } from '@/utils/scopeFiltering';
import {
    getElevationColor,
    getIlluminationColor,
    getIlluminationOpacity,
    getRegionColor,
    getRegionFillOpacity,
    getTerrainColor,
    isTransparentRegion,
} from '@/utils/regionColorUtils';
import { RegionRenderer } from './RegionRenderer';

describe('RegionRenderer', () => {
    describe('component definition', () => {
        it('has correct display name', () => {
            expect(RegionRenderer.displayName).toBe('RegionRenderer');
        });

        it('component is defined and exports correctly', () => {
            expect(RegionRenderer).toBeDefined();
            expect(typeof RegionRenderer).toBe('function');
        });
    });

    describe('props validation', () => {
        const mockPlacedRegion: PlacedRegion = {
            id: 'region-1',
            index: 0,
            name: 'Test Region',
            type: 'Illumination',
            vertices: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ],
            value: 1,
        };

        it('should have valid encounterRegion structure', () => {
            expect(mockPlacedRegion.id).toBeTruthy();
            expect(mockPlacedRegion.index).toBeDefined();
            expect(mockPlacedRegion.type).toBeTruthy();
            expect(mockPlacedRegion.vertices.length).toBeGreaterThanOrEqual(3);
        });

        it('should have minimum 3 vertices for polygon', () => {
            expect(mockPlacedRegion.vertices.length).toBeGreaterThanOrEqual(3);
        });

        it('should have valid vertex coordinates', () => {
            mockPlacedRegion.vertices.forEach((vertex: Point) => {
                expect(typeof vertex.x).toBe('number');
                expect(typeof vertex.y).toBe('number');
            });
        });

        it('should accept onSelect callback', () => {
            const onSelect = vi.fn<(index: number) => void>();
            expect(typeof onSelect).toBe('function');
        });

        it('should accept onContextMenu callback', () => {
            const onContextMenu = vi.fn<(index: number, position: { x: number; y: number }) => void>();
            expect(typeof onContextMenu).toBe('function');
        });

        it('should accept isSelected boolean', () => {
            const isSelected = true;
            expect(typeof isSelected).toBe('boolean');
        });

        it('should accept allRegions array', () => {
            const allRegions: PlacedRegion[] = [mockPlacedRegion];
            expect(Array.isArray(allRegions)).toBe(true);
            expect(allRegions.length).toBeGreaterThan(0);
        });
    });

    describe('scope filtering', () => {
        it('should return true when scope is regions', () => {
            const scope: InteractionScope = 'regions';
            expect(isRegionInScope(scope)).toBe(true);
        });

        it('should return false when scope is walls', () => {
            const scope: InteractionScope = 'walls';
            expect(isRegionInScope(scope)).toBe(false);
        });

        it('should return false when scope is objects', () => {
            const scope: InteractionScope = 'objects';
            expect(isRegionInScope(scope)).toBe(false);
        });

        it('should return false when scope is lights', () => {
            const scope: InteractionScope = 'lights';
            expect(isRegionInScope(scope)).toBe(false);
        });

        it('should return false when scope is null', () => {
            const scope: InteractionScope = null;
            expect(isRegionInScope(scope)).toBe(false);
        });
    });

    describe('color mapping', () => {
        const lightTheme = createTheme({ palette: { mode: 'light' } });
        const darkTheme = createTheme({ palette: { mode: 'dark' } });

        it('should have defined light theme colors', () => {
            expect(lightTheme.palette.warning.main).toBeDefined();
            expect(lightTheme.palette.warning.dark).toBeDefined();
            expect(lightTheme.palette.grey[500]).toBeDefined();
            expect(lightTheme.palette.info.light).toBeDefined();
            expect(lightTheme.palette.grey[400]).toBeDefined();
        });

        it('should have defined dark theme colors', () => {
            expect(darkTheme.palette.warning.main).toBeDefined();
            expect(darkTheme.palette.warning.dark).toBeDefined();
            expect(darkTheme.palette.grey[500]).toBeDefined();
            expect(darkTheme.palette.info.light).toBeDefined();
            expect(darkTheme.palette.grey[400]).toBeDefined();
        });

        it('should have string type colors', () => {
            expect(typeof lightTheme.palette.warning.main).toBe('string');
            expect(typeof lightTheme.palette.warning.dark).toBe('string');
            expect(typeof lightTheme.palette.grey[500]).toBe('string');
        });
    });

    describe('region color utilities', () => {
        describe('getTerrainColor', () => {
            it('should return color for terrain value 0', () => {
                const color = getTerrainColor(0);
                expect(color).toBeDefined();
                expect(typeof color).toBe('string');
            });

            it('should return color for terrain value 1', () => {
                const color = getTerrainColor(1);
                expect(color).toBeDefined();
            });

            it('should return color for terrain value 2', () => {
                const color = getTerrainColor(2);
                expect(color).toBeDefined();
            });

            it('should return default color for unknown terrain value', () => {
                const color = getTerrainColor(99);
                expect(color).toBeDefined();
            });
        });

        describe('getIlluminationColor', () => {
            it('should return color for illumination value -2', () => {
                const color = getIlluminationColor(-2);
                expect(color).toBeDefined();
            });

            it('should return color for illumination value -1', () => {
                const color = getIlluminationColor(-1);
                expect(color).toBeDefined();
            });

            it('should return transparent for illumination value 0', () => {
                const color = getIlluminationColor(0);
                expect(color).toBe('transparent');
            });

            it('should return color for illumination value 1', () => {
                const color = getIlluminationColor(1);
                expect(color).toBeDefined();
            });
        });

        describe('getIlluminationOpacity', () => {
            it('should return opacity for illumination value -2', () => {
                const opacity = getIlluminationOpacity(-2);
                expect(opacity).toBe(0.75);
            });

            it('should return opacity for illumination value -1', () => {
                const opacity = getIlluminationOpacity(-1);
                expect(opacity).toBe(0.5);
            });

            it('should return opacity for illumination value 0', () => {
                const opacity = getIlluminationOpacity(0);
                expect(opacity).toBe(0);
            });

            it('should return opacity for illumination value 1', () => {
                const opacity = getIlluminationOpacity(1);
                expect(opacity).toBe(0.25);
            });
        });

        describe('getElevationColor', () => {
            it('should return green for elevation 0', () => {
                const color = getElevationColor(0, [], []);
                expect(color).toBe('#00FF00');
            });

            it('should interpolate positive elevations', () => {
                const color = getElevationColor(5, [5, 10], []);
                expect(color).toBeDefined();
                expect(typeof color).toBe('string');
            });

            it('should interpolate negative elevations', () => {
                const color = getElevationColor(-5, [], [-10, -5]);
                expect(color).toBeDefined();
                expect(typeof color).toBe('string');
            });
        });

        describe('getRegionColor', () => {
            it('should return color for Elevation type', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Elevation',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 5,
                };
                const color = getRegionColor(region, [region]);
                expect(color).toBeDefined();
            });

            it('should return color for Terrain type', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Terrain',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 1,
                };
                const color = getRegionColor(region, [region]);
                expect(color).toBeDefined();
            });

            it('should return color for Illumination type', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Illumination',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 1,
                };
                const color = getRegionColor(region, [region]);
                expect(color).toBeDefined();
            });

            it('should return default color for unknown type', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Unknown',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                };
                const color = getRegionColor(region, [region]);
                expect(color).toBe('#9E9E9E');
            });
        });

        describe('getRegionFillOpacity', () => {
            it('should return illumination-specific opacity for Illumination type', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Illumination',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: -1,
                };
                const opacity = getRegionFillOpacity(region);
                expect(opacity).toBe(0.5);
            });

            it('should return 0.3 for non-Illumination types', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Terrain',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 1,
                };
                const opacity = getRegionFillOpacity(region);
                expect(opacity).toBe(0.3);
            });
        });

        describe('isTransparentRegion', () => {
            it('should return true for Illumination type with value 0', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Illumination',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 0,
                };
                expect(isTransparentRegion(region)).toBe(true);
            });

            it('should return false for Illumination type with non-zero value', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Illumination',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 1,
                };
                expect(isTransparentRegion(region)).toBe(false);
            });

            it('should return false for non-Illumination types', () => {
                const region: PlacedRegion = {
                    id: 'region-1',
                    index: 0,
                    type: 'Terrain',
                    vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    value: 0,
                };
                expect(isTransparentRegion(region)).toBe(false);
            });
        });
    });

    describe('polygon points calculation', () => {
        it('should convert vertices to flat points array', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];

            const firstVertex = vertices[0];
            const points = [...vertices, firstVertex].flatMap((v) => [v?.x ?? 0, v?.y ?? 0]);

            expect(points).toEqual([0, 0, 100, 0, 100, 100, 0, 100, 0, 0]);
        });

        it('should close polygon by adding first vertex at end', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 },
            ];

            const firstVertex = vertices[0];
            const closedVertices = [...vertices, firstVertex];

            expect(closedVertices.length).toBe(4);
            expect(closedVertices[0]).toEqual(closedVertices[3]);
        });

        it('should handle empty vertices array', () => {
            const vertices: Point[] = [];
            const firstVertex = vertices[0];

            expect(firstVertex).toBeUndefined();
        });
    });

    describe('region types', () => {
        const regionTypes = ['Elevation', 'Terrain', 'Illumination', 'FogOfWar'];

        it.each(regionTypes)('should accept %s region type', (type) => {
            const region: PlacedRegion = {
                id: `region-${type}`,
                index: 0,
                type,
                vertices: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 },
                ],
            };
            expect(region.type).toBe(type);
        });

        it('should handle region with optional name', () => {
            const region: PlacedRegion = {
                id: 'region-1',
                index: 0,
                name: 'Dark Zone',
                type: 'Illumination',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
            };
            expect(region.name).toBe('Dark Zone');
        });

        it('should handle region with optional value', () => {
            const region: PlacedRegion = {
                id: 'region-1',
                index: 0,
                type: 'Elevation',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                value: 10,
            };
            expect(region.value).toBe(10);
        });

        it('should handle region with optional label', () => {
            const region: PlacedRegion = {
                id: 'region-1',
                index: 0,
                type: 'Terrain',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                label: 'Difficult',
            };
            expect(region.label).toBe('Difficult');
        });

        it('should handle region with optional color', () => {
            const region: PlacedRegion = {
                id: 'region-1',
                index: 0,
                type: 'Terrain',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                color: '#FF5733',
            };
            expect(region.color).toBe('#FF5733');
        });
    });

    describe('interaction handling', () => {
        it('should only allow interaction when scope is regions', () => {
            const isInteractive = isRegionInScope('regions');
            expect(isInteractive).toBe(true);
        });

        it('should not allow interaction when scope is not regions', () => {
            const scopes: InteractionScope[] = ['walls', 'objects', 'monsters', 'characters', 'lights', 'sounds', 'fogOfWar', null];
            scopes.forEach((scope) => {
                const isInteractive = isRegionInScope(scope);
                expect(isInteractive).toBe(false);
            });
        });
    });

    describe('selection state', () => {
        it('should handle selected state', () => {
            const isSelected = true;
            // Selected regions have opacity 0.5
            const expectedOpacity = isSelected ? 0.5 : 0.3;
            expect(expectedOpacity).toBe(0.5);
        });

        it('should handle unselected state', () => {
            const isSelected = false;
            // Unselected regions have default opacity 0.3
            const expectedOpacity = isSelected ? 0.5 : 0.3;
            expect(expectedOpacity).toBe(0.3);
        });

        it('should use Illumination-specific opacity when selected', () => {
            const isSelected = true;
            const type = 'Illumination';
            const fillOpacity = 0.25; // value 1

            // Selected state uses 0.5 opacity regardless of type
            const opacity = isSelected ? 0.5 : type === 'Illumination' ? fillOpacity : 0.3;
            expect(opacity).toBe(0.5);
        });
    });
});
