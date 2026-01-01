import { describe, it, expect } from 'vitest';
import type {
    StageWall,
    StageWallSegment,
    Pole,
} from '../stage';
import { SegmentType, SegmentState } from '../domain';
import type {
    CreateWallRequest,
    UpdateWallRequest,
    CreateWallSegmentRequest,
    UpdateWallSegmentRequest,
} from '../stage';

describe('Wall Types', () => {
    describe('StageWall', () => {
        it('should allow valid StageWall object', () => {
            const wall: StageWall = {
                index: 0,
                name: 'Stone Wall',
                segments: [],
            };
            expect(wall.name).toBe('Stone Wall');
            expect(wall.index).toBe(0);
            expect(wall.segments).toEqual([]);
        });

        it('should allow StageWall without optional name', () => {
            const wall: StageWall = {
                index: 1,
                segments: [],
            };
            expect(wall.name).toBeUndefined();
            expect(wall.index).toBe(1);
        });

        it('should allow StageWall with segments', () => {
            const wall: StageWall = {
                index: 0,
                name: 'Wall with segments',
                segments: [
                    {
                        index: 0,
                        startPole: { x: 0, y: 0, h: 10 },
                        endPole: { x: 100, y: 0, h: 10 },
                        type: SegmentType.Wall,
                        isOpaque: true,
                        state: SegmentState.Closed,
                    },
                ],
            };
            expect(wall.segments).toHaveLength(1);
            expect(wall.segments[0]?.type).toBe(SegmentType.Wall);
        });
    });

    describe('StageWallSegment', () => {
        it('should allow valid segment with all properties', () => {
            const segment: StageWallSegment = {
                index: 0,
                name: 'Main Wall Segment',
                startPole: { x: 0, y: 0, h: 10 },
                endPole: { x: 50, y: 50, h: 10 },
                type: SegmentType.Wall,
                isOpaque: true,
                state: SegmentState.Closed,
            };
            expect(segment.name).toBe('Main Wall Segment');
            expect(segment.startPole.x).toBe(0);
            expect(segment.endPole.x).toBe(50);
            expect(segment.type).toBe(SegmentType.Wall);
            expect(segment.isOpaque).toBe(true);
            expect(segment.state).toBe(SegmentState.Closed);
        });

        it('should allow segment without optional name', () => {
            const segment: StageWallSegment = {
                index: 0,
                startPole: { x: 0, y: 0, h: 5 },
                endPole: { x: 10, y: 10, h: 5 },
                type: SegmentType.Door,
                isOpaque: false,
                state: SegmentState.Open,
            };
            expect(segment.name).toBeUndefined();
            expect(segment.type).toBe(SegmentType.Door);
            expect(segment.state).toBe(SegmentState.Open);
        });

        it('should support Window segment type', () => {
            const segment: StageWallSegment = {
                index: 0,
                startPole: { x: 0, y: 0, h: 8 },
                endPole: { x: 20, y: 0, h: 8 },
                type: SegmentType.Window,
                isOpaque: false,
                state: SegmentState.Closed,
            };
            expect(segment.type).toBe(SegmentType.Window);
        });

        it('should support all segment states', () => {
            const states = [
                SegmentState.Open,
                SegmentState.Closed,
                SegmentState.Locked,
                SegmentState.Visible,
                SegmentState.Secret,
            ];

            states.forEach((state, index) => {
                const segment: StageWallSegment = {
                    index,
                    startPole: { x: 0, y: 0, h: 10 },
                    endPole: { x: 10, y: 0, h: 10 },
                    type: SegmentType.Door,
                    isOpaque: true,
                    state,
                };
                expect(segment.state).toBe(state);
            });
        });

        it('should allow poles with different heights', () => {
            const segment: StageWallSegment = {
                index: 0,
                startPole: { x: 0, y: 0, h: 5 },
                endPole: { x: 10, y: 10, h: 15 },
                type: SegmentType.Wall,
                isOpaque: true,
                state: SegmentState.Closed,
            };
            expect(segment.startPole.h).toBe(5);
            expect(segment.endPole.h).toBe(15);
        });
    });

    describe('Pole', () => {
        it('should allow valid Pole object', () => {
            const pole: Pole = { x: 100, y: 200, h: 10 };
            expect(pole.x).toBe(100);
            expect(pole.y).toBe(200);
            expect(pole.h).toBe(10);
        });

        it('should allow negative coordinates', () => {
            const pole: Pole = { x: -50, y: -100, h: 0 };
            expect(pole.x).toBe(-50);
            expect(pole.y).toBe(-100);
        });

        it('should allow zero values', () => {
            const pole: Pole = { x: 0, y: 0, h: 0 };
            expect(pole.x).toBe(0);
            expect(pole.y).toBe(0);
            expect(pole.h).toBe(0);
        });
    });

    describe('CreateWallRequest', () => {
        it('should allow request with name and segments', () => {
            const request: CreateWallRequest = {
                name: 'New Wall',
                segments: [
                    {
                        startPole: { x: 0, y: 0, h: 10 },
                        endPole: { x: 100, y: 0, h: 10 },
                        type: SegmentType.Wall,
                    },
                ],
            };
            expect(request.name).toBe('New Wall');
            expect(request.segments).toHaveLength(1);
        });

        it('should allow request without optional fields', () => {
            const request: CreateWallRequest = {};
            expect(request.name).toBeUndefined();
            expect(request.segments).toBeUndefined();
        });

        it('should allow request with only name', () => {
            const request: CreateWallRequest = {
                name: 'Empty Wall',
            };
            expect(request.name).toBe('Empty Wall');
        });
    });

    describe('UpdateWallRequest', () => {
        it('should allow updating name', () => {
            const request: UpdateWallRequest = {
                name: 'Updated Wall Name',
            };
            expect(request.name).toBe('Updated Wall Name');
        });

        it('should allow empty update', () => {
            const request: UpdateWallRequest = {};
            expect(request.name).toBeUndefined();
        });
    });

    describe('CreateWallSegmentRequest', () => {
        it('should allow request with required fields', () => {
            const request: CreateWallSegmentRequest = {
                startPole: { x: 0, y: 0, h: 10 },
                endPole: { x: 50, y: 50, h: 10 },
                type: SegmentType.Wall,
            };
            expect(request.startPole).toBeDefined();
            expect(request.endPole).toBeDefined();
            expect(request.type).toBe(SegmentType.Wall);
        });

        it('should allow request with all optional fields', () => {
            const request: CreateWallSegmentRequest = {
                name: 'Named Segment',
                startPole: { x: 0, y: 0, h: 10 },
                endPole: { x: 50, y: 50, h: 10 },
                type: SegmentType.Door,
                isOpaque: false,
                state: SegmentState.Open,
            };
            expect(request.name).toBe('Named Segment');
            expect(request.isOpaque).toBe(false);
            expect(request.state).toBe(SegmentState.Open);
        });
    });

    describe('UpdateWallSegmentRequest', () => {
        it('should allow partial updates', () => {
            const request: UpdateWallSegmentRequest = {
                type: SegmentType.Door,
                state: SegmentState.Locked,
            };
            expect(request.type).toBe(SegmentType.Door);
            expect(request.state).toBe(SegmentState.Locked);
            expect(request.startPole).toBeUndefined();
        });

        it('should allow updating poles', () => {
            const request: UpdateWallSegmentRequest = {
                startPole: { x: 10, y: 20, h: 15 },
                endPole: { x: 30, y: 40, h: 15 },
            };
            expect(request.startPole?.x).toBe(10);
            expect(request.endPole?.x).toBe(30);
        });

        it('should allow empty update', () => {
            const request: UpdateWallSegmentRequest = {};
            expect(Object.keys(request)).toHaveLength(0);
        });
    });
});
