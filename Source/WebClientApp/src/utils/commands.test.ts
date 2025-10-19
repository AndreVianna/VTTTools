import { describe, it, expect, vi } from 'vitest';
import {
    createPlaceAssetCommand,
    createMoveAssetCommand,
    createRemoveAssetCommand,
    createResizeAssetCommand,
    createRotateAssetCommand,
    createBatchCommand,
} from './commands';
import type { PlacedAsset } from '@/types/domain';
import { AssetKind } from '@/types/domain';

const createMockPlacedAsset = (id: string): PlacedAsset => ({
    id,
    assetId: `asset-${id}`,
    asset: {
        id: `asset-${id}`,
        ownerId: 'owner-1',
        kind: AssetKind.Object,
        name: `Asset ${id}`,
        description: 'Test asset',
        isPublished: true,
        isPublic: false,
        resources: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
    },
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    zIndex: 1,
});

describe('createPlaceAssetCommand', () => {
    it('executes place operation', () => {
        const onPlace = vi.fn();
        const onRemove = vi.fn();
        const asset = createMockPlacedAsset('1');

        const command = createPlaceAssetCommand({ asset, onPlace, onRemove });

        command.execute();

        expect(onPlace).toHaveBeenCalledWith(asset);
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('undoes place operation', () => {
        const onPlace = vi.fn();
        const onRemove = vi.fn();
        const asset = createMockPlacedAsset('1');

        const command = createPlaceAssetCommand({ asset, onPlace, onRemove });

        command.undo();

        expect(onRemove).toHaveBeenCalledWith(asset.id);
        expect(onPlace).not.toHaveBeenCalled();
    });

    it('has descriptive name', () => {
        const onPlace = vi.fn();
        const onRemove = vi.fn();
        const asset = createMockPlacedAsset('1');

        const command = createPlaceAssetCommand({ asset, onPlace, onRemove });

        expect(command.description).toContain('Place');
        expect(command.description).toContain(asset.asset.name);
    });
});

describe('createMoveAssetCommand', () => {
    it('executes move operation with new position', () => {
        const onMove = vi.fn();
        const oldPosition = { x: 100, y: 100 };
        const newPosition = { x: 200, y: 200 };

        const command = createMoveAssetCommand({
            assetId: '1',
            oldPosition,
            newPosition,
            onMove,
        });

        command.execute();

        expect(onMove).toHaveBeenCalledWith('1', newPosition);
        expect(onMove).toHaveBeenCalledTimes(1);
    });

    it('undoes move operation with old position', () => {
        const onMove = vi.fn();
        const oldPosition = { x: 100, y: 100 };
        const newPosition = { x: 200, y: 200 };

        const command = createMoveAssetCommand({
            assetId: '1',
            oldPosition,
            newPosition,
            onMove,
        });

        command.undo();

        expect(onMove).toHaveBeenCalledWith('1', oldPosition);
    });

    it('creates immutable position copies', () => {
        const onMove = vi.fn();
        const oldPosition = { x: 100, y: 100 };
        const newPosition = { x: 200, y: 200 };

        const command = createMoveAssetCommand({
            assetId: '1',
            oldPosition,
            newPosition,
            onMove,
        });

        command.execute();

        const calledPosition = onMove.mock.calls[0]?.[1];
        expect(calledPosition).toEqual(newPosition);
        expect(calledPosition).not.toBe(newPosition);
    });
});

describe('createRemoveAssetCommand', () => {
    it('executes remove operation', () => {
        const onPlace = vi.fn();
        const onRemove = vi.fn();
        const asset = createMockPlacedAsset('1');

        const command = createRemoveAssetCommand({ asset, onPlace, onRemove });

        command.execute();

        expect(onRemove).toHaveBeenCalledWith(asset.id);
        expect(onPlace).not.toHaveBeenCalled();
    });

    it('undoes remove operation by placing back', () => {
        const onPlace = vi.fn();
        const onRemove = vi.fn();
        const asset = createMockPlacedAsset('1');

        const command = createRemoveAssetCommand({ asset, onPlace, onRemove });

        command.undo();

        expect(onPlace).toHaveBeenCalledWith(asset);
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('has descriptive name', () => {
        const onPlace = vi.fn();
        const onRemove = vi.fn();
        const asset = createMockPlacedAsset('1');

        const command = createRemoveAssetCommand({ asset, onPlace, onRemove });

        expect(command.description).toContain('Remove');
        expect(command.description).toContain(asset.asset.name);
    });
});

describe('createResizeAssetCommand', () => {
    it('executes resize operation with new size', () => {
        const onResize = vi.fn();
        const oldSize = { width: 50, height: 50 };
        const newSize = { width: 100, height: 100 };

        const command = createResizeAssetCommand({
            assetId: '1',
            oldSize,
            newSize,
            onResize,
        });

        command.execute();

        expect(onResize).toHaveBeenCalledWith('1', newSize);
    });

    it('undoes resize operation with old size', () => {
        const onResize = vi.fn();
        const oldSize = { width: 50, height: 50 };
        const newSize = { width: 100, height: 100 };

        const command = createResizeAssetCommand({
            assetId: '1',
            oldSize,
            newSize,
            onResize,
        });

        command.undo();

        expect(onResize).toHaveBeenCalledWith('1', oldSize);
    });

    it('creates immutable size copies', () => {
        const onResize = vi.fn();
        const oldSize = { width: 50, height: 50 };
        const newSize = { width: 100, height: 100 };

        const command = createResizeAssetCommand({
            assetId: '1',
            oldSize,
            newSize,
            onResize,
        });

        command.execute();

        const calledSize = onResize.mock.calls[0]?.[1];
        expect(calledSize).toEqual(newSize);
        expect(calledSize).not.toBe(newSize);
    });
});

describe('createRotateAssetCommand', () => {
    it('executes rotate operation with new rotation', () => {
        const onRotate = vi.fn();

        const command = createRotateAssetCommand({
            assetId: '1',
            oldRotation: 0,
            newRotation: 90,
            onRotate,
        });

        command.execute();

        expect(onRotate).toHaveBeenCalledWith('1', 90);
    });

    it('undoes rotate operation with old rotation', () => {
        const onRotate = vi.fn();

        const command = createRotateAssetCommand({
            assetId: '1',
            oldRotation: 0,
            newRotation: 90,
            onRotate,
        });

        command.undo();

        expect(onRotate).toHaveBeenCalledWith('1', 0);
    });
});

describe('createBatchCommand', () => {
    it('executes all commands in order', () => {
        const executeFn1 = vi.fn();
        const executeFn2 = vi.fn();
        const executeFn3 = vi.fn();

        const commands = [
            { description: 'Cmd 1', execute: executeFn1, undo: vi.fn() },
            { description: 'Cmd 2', execute: executeFn2, undo: vi.fn() },
            { description: 'Cmd 3', execute: executeFn3, undo: vi.fn() },
        ];

        const batch = createBatchCommand({ commands });

        batch.execute();

        expect(executeFn1).toHaveBeenCalledTimes(1);
        expect(executeFn2).toHaveBeenCalledTimes(1);
        expect(executeFn3).toHaveBeenCalledTimes(1);

        const order1 = executeFn1.mock.invocationCallOrder[0];
        const order2 = executeFn2.mock.invocationCallOrder[0];
        const order3 = executeFn3.mock.invocationCallOrder[0];

        expect(order1).toBeLessThan(order2 ?? Infinity);
        expect(order2).toBeLessThan(order3 ?? Infinity);
    });

    it('undoes all commands in reverse order', () => {
        const undoFn1 = vi.fn();
        const undoFn2 = vi.fn();
        const undoFn3 = vi.fn();

        const commands = [
            { description: 'Cmd 1', execute: vi.fn(), undo: undoFn1 },
            { description: 'Cmd 2', execute: vi.fn(), undo: undoFn2 },
            { description: 'Cmd 3', execute: vi.fn(), undo: undoFn3 },
        ];

        const batch = createBatchCommand({ commands });

        batch.undo();

        expect(undoFn1).toHaveBeenCalledTimes(1);
        expect(undoFn2).toHaveBeenCalledTimes(1);
        expect(undoFn3).toHaveBeenCalledTimes(1);

        const order3 = undoFn3.mock.invocationCallOrder[0];
        const order2 = undoFn2.mock.invocationCallOrder[0];
        const order1 = undoFn1.mock.invocationCallOrder[0];

        expect(order3).toBeLessThan(order2 ?? Infinity);
        expect(order2).toBeLessThan(order1 ?? Infinity);
    });

    it('has descriptive name with count', () => {
        const commands = [
            { description: 'Cmd 1', execute: vi.fn(), undo: vi.fn() },
            { description: 'Cmd 2', execute: vi.fn(), undo: vi.fn() },
        ];

        const batch = createBatchCommand({ commands });

        expect(batch.description).toContain('Batch');
        expect(batch.description).toContain('2');
    });

    it('handles empty command list', () => {
        const batch = createBatchCommand({ commands: [] });

        expect(() => {
            batch.execute();
            batch.undo();
        }).not.toThrow();
    });

    it('does not mutate original commands array on undo', () => {
        const commands = [
            { description: 'Cmd 1', execute: vi.fn(), undo: vi.fn() },
            { description: 'Cmd 2', execute: vi.fn(), undo: vi.fn() },
        ];

        const originalLength = commands.length;
        const batch = createBatchCommand({ commands });

        batch.undo();

        expect(commands.length).toBe(originalLength);
    });
});
