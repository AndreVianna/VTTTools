import { configureStore } from '@reduxjs/toolkit';
import { act, render } from '@testing-library/react';
import type Konva from 'konva';
import React from 'react';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { encounterApi } from '@/services/encounterApi';
import type { Encounter, EncounterWall, Pole } from '@/types/domain';
import { GridType as DomainGridType, Weather } from '@/types/domain';
import { AmbientLight, AmbientSoundSource } from '@/types/stage';
import { type GridConfig, GridType } from '@/utils/gridCalculator';
import { WallDrawingTool } from './WallDrawingTool';

vi.mock('konva', () => ({
  default: {
    Group: vi.fn(),
    Rect: vi.fn(),
  },
}));

vi.mock('react-konva', () => ({
  Group: ({ children }: { children: React.ReactNode }) => <div data-mock='konva-group'>{children}</div>,
  Rect: ({
    onClick,
    onDblClick,
    onMouseMove,
  }: {
    onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    onDblClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseMove?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  }) => {
    const mockKonvaEvent = {
      target: {
        getStage: () => ({
          getPointerPosition: () => ({ x: 100, y: 100 }),
          x: () => 0,
          y: () => 0,
          scaleX: () => 1,
        }),
      },
      evt: {},
      cancelBubble: false,
    } as Konva.KonvaEventObject<MouseEvent>;
    return (
      <button
        type='button'
        data-mock='konva-rect'
        onClick={() => onClick?.(mockKonvaEvent)}
        onDoubleClick={() => onDblClick?.(mockKonvaEvent)}
        onMouseMove={() => onMouseMove?.(mockKonvaEvent)}
      />
    );
  },
}));

vi.mock('./VertexMarker', () => ({
  VertexMarker: ({ position, preview }: { position: { x: number; y: number }; preview?: boolean }) => (
    <div data-mock={preview ? 'vertex-marker-preview' : 'vertex-marker'} data-x={position.x} data-y={position.y} />
  ),
}));

vi.mock('./WallPreview', () => ({
  WallPreview: () => <div data-mock='wall-preview' />,
}));

vi.mock('@/utils/snapping', () => ({
  snap: (pos: { x: number; y: number }) => pos,
  screenToWorld: (pointer: { x: number; y: number }) => pointer,
  getSnapModeFromEvent: () => 'grid',
  SnapMode: {
    Free: 'free',
    Half: 'half',
    Quarter: 'quarter',
  },
}));

describe('WallDrawingTool Integration Tests - Component + Real Hook', () => {
  let onPolesChangeSpy: (poles: Pole[]) => void;
  let onCancelSpy: () => void;
  let onFinishSpy: () => void;

  const defaultGridConfig: GridConfig = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
    scale: 1,
  };

  const createMockEncounter = (walls: EncounterWall[] = []): Partial<Encounter> => ({
    id: 'encounter-1',
    name: 'Test Encounter',
    stage: {
      id: 'stage-1',
      ownerId: 'owner-1',
      name: 'Test Stage',
      description: '',
      isPublished: false,
      isPublic: false,
      settings: {
        zoomLevel: 1,
        panning: { x: 0, y: 0 },
        ambientLight: AmbientLight.Default,
        ambientSoundSource: AmbientSoundSource.NotSet,
        ambientSoundVolume: 1,
        ambientSoundLoop: false,
        ambientSoundIsPlaying: false,
        weather: Weather.Clear,
        useAlternateBackground: false,
      },
      grid: {
        type: DomainGridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        scale: 1,
      },
      walls,
      regions: [],
      lights: [],
      elements: [],
      sounds: [],
    },
  });

  const mockEncounterEmpty = createMockEncounter([
    {
      index: 0,
      name: 'Wall 0',
      segments: [],
    },
  ]);

  beforeEach(() => {
    onPolesChangeSpy = vi.fn();
    onCancelSpy = vi.fn();
    onFinishSpy = vi.fn();
  });

  const createStoreWithEncounter = (encounter: Partial<Encounter>) => {
    return configureStore({
      reducer: {
        [encounterApi.reducerPath]: () => ({
          queries: {
            'getEncounter("encounter-1")': {
              status: 'fulfilled',
              data: encounter,
            },
          },
        }),
      },
      // biome-ignore lint/suspicious/noExplicitAny: Test store has minimal state; middleware expects full RootState
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(encounterApi.middleware as any),
    });
  };

  interface TestWrapperProps {
    children: (params: { wallTransaction: ReturnType<typeof useWallTransaction> }) => React.ReactNode;
  }

  const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
    const wallTransaction = useWallTransaction();

    React.useEffect(() => {
      wallTransaction.startTransaction('placement');
    }, [wallTransaction]);

    return <>{children({ wallTransaction })}</>;
  };

  describe('Scenario 1: Normal Placement', () => {
    it('should place open wall with 2 poles', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let capturedPoles: Pole[] = [];

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => (
              <WallDrawingTool
                encounterId='encounter-1'
                wallIndex={0}
                gridConfig={defaultGridConfig}
                defaultHeight={10}
                onCancel={onCancelSpy}
                onFinish={onFinishSpy}
                onPolesChange={(poles) => {
                  capturedPoles = poles;
                }}
                wallTransaction={wallTransaction}
              />
            )}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      expect(capturedPoles.length).toBe(1);
      expect(capturedPoles[0]).toEqual({ x: 100, y: 100, h: 10 });

      act(() => {
        rect.click();
      });

      expect(capturedPoles.length).toBe(2);
      expect(capturedPoles[1]).toEqual({ x: 100, y: 100, h: 10 });

      act(() => {
        rect.dispatchEvent(new Event('dblclick'));
      });

      expect(onFinishSpy).toHaveBeenCalled();
    });

    it('should place open wall with 5 poles', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let capturedPoles: Pole[] = [];

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => (
              <WallDrawingTool
                encounterId='encounter-1'
                wallIndex={0}
                gridConfig={defaultGridConfig}
                defaultHeight={15}
                onCancel={onCancelSpy}
                onFinish={onFinishSpy}
                onPolesChange={(poles) => {
                  capturedPoles = poles;
                }}
                wallTransaction={wallTransaction}
              />
            )}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      for (let i = 0; i < 5; i++) {
        act(() => {
          rect.click();
        });
      }

      expect(capturedPoles.length).toBe(5);
      capturedPoles.forEach((pole) => {
        expect(pole.h).toBe(15);
      });
    });

    it('should NOT auto-close with only 2 poles when clicking near first pole', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let capturedPoles: Pole[] = [];

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => (
              <WallDrawingTool
                encounterId='encounter-1'
                wallIndex={0}
                gridConfig={defaultGridConfig}
                defaultHeight={10}
                onCancel={onCancelSpy}
                onFinish={onFinishSpy}
                onPolesChange={(poles) => {
                  capturedPoles = poles;
                }}
                wallTransaction={wallTransaction}
              />
            )}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });
      act(() => {
        rect.click();
      });

      expect(capturedPoles.length).toBe(2);
      expect(onFinishSpy).not.toHaveBeenCalled();
    });
  });

  describe('Component Rendering with Real Hook', () => {
    it('should render component with real wallTransaction hook', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      expect(container.querySelector('[data-mock="konva-group"]')).toBeTruthy();
      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.transaction.isActive).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.transaction.type).toBe('placement');
    });

    it('should initialize real hook with empty undo/redo stacks', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(0);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(false);
    });
  });

  describe('Scenario 4: Auto-Close', () => {
    it('should auto-close when clicking near first pole with 3+ poles', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let capturedPoles: Pole[] = [];
      let isClosedCalled = false;

      const mockTransaction: ReturnType<typeof useWallTransaction> = {
        startTransaction: vi.fn(),
        updateSegment: vi.fn((_index, updates) => {
          if (updates.isClosed) {
            isClosedCalled = true;
          }
        }),
        pushLocalAction: vi.fn(),
        transaction: {
          isActive: true,
          type: 'placement',
          originalWall: null,
          segments: [],
        },
        history: {
          push: vi.fn(),
          undo: vi.fn(),
          redo: vi.fn(),
          canUndo: false,
          canRedo: false,
          clear: vi.fn(),
          undoStackSize: 0,
          redoStackSize: 0,
        },
        canUndoLocal: () => false,
        canRedoLocal: () => false,
        undoLocal: vi.fn(),
        redoLocal: vi.fn(),
        rollbackTransaction: vi.fn(),
        commitTransaction: vi.fn(),
        getActiveSegments: vi.fn(() => []),
        addSegment: vi.fn(),
        addSegments: vi.fn(),
        setAllSegments: vi.fn(),
        removeSegment: vi.fn(),
      };

      const { container } = render(
        <Provider store={store}>
          <WallDrawingTool
            encounterId='encounter-1'
            wallIndex={0}
            gridConfig={defaultGridConfig}
            defaultHeight={10}
            onCancel={onCancelSpy}
            onFinish={onFinishSpy}
            onPolesChange={(poles) => {
              capturedPoles = poles;
            }}
            wallTransaction={mockTransaction}
          />
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });
      act(() => {
        rect.click();
      });
      act(() => {
        rect.click();
      });

      expect(capturedPoles.length).toBe(2);
      expect(isClosedCalled).toBe(true);
    });

    it('should NOT auto-close when clicking 11px from first pole (outside tolerance)', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      const customKonvaEvent = {
        target: {
          getStage: () => ({
            getPointerPosition: () => ({ x: 111, y: 100 }),
            x: () => 0,
            y: () => 0,
            scaleX: () => 1,
          }),
        },
        evt: {},
        cancelBubble: false,
      } as Konva.KonvaEventObject<MouseEvent>;

      vi.mock('react-konva', () => ({
        Group: ({ children }: { children: React.ReactNode }) => <div data-mock='konva-group'>{children}</div>,
        Rect: ({ onClick }: { onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void }) => (
          <button type='button' data-mock='konva-rect' onClick={() => onClick?.(customKonvaEvent)} />
        ),
      }));

      let capturedPoles: Pole[] = [];

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => (
              <WallDrawingTool
                encounterId='encounter-1'
                wallIndex={0}
                gridConfig={defaultGridConfig}
                defaultHeight={10}
                onCancel={onCancelSpy}
                onFinish={onFinishSpy}
                onPolesChange={(poles) => {
                  capturedPoles = poles;
                }}
                wallTransaction={wallTransaction}
              />
            )}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      for (let i = 0; i < 3; i++) {
        act(() => {
          rect.click();
        });
      }

      expect(capturedPoles.length).toBe(3);
      expect(onFinishSpy).not.toHaveBeenCalled();
    });
  });

  describe('Pole Placement with Real Hook', () => {
    it('should place pole and populate real undo stack', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(0);

      act(() => {
        rect.click();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(1);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(true);
    });

    it('should call onPolesChange when pole is placed', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => (
              <WallDrawingTool
                encounterId='encounter-1'
                wallIndex={0}
                gridConfig={defaultGridConfig}
                defaultHeight={10}
                onCancel={onCancelSpy}
                onFinish={onFinishSpy}
                onPolesChange={onPolesChangeSpy}
                wallTransaction={wallTransaction}
              />
            )}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      expect(onPolesChangeSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
            h: 10,
          }),
        ]),
      );
    });
  });

  describe('Real Undo/Redo Integration', () => {
    it('should undo pole placement using real hook', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;
      let capturedPoles: Pole[] = [];

      const testOnPolesChange = (poles: Pole[]) => {
        capturedPoles = [...poles];
      };

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={testOnPolesChange}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      expect(capturedPoles.length).toBe(1);
      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(true);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      expect(capturedPoles.length).toBe(0);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(true);
    });

    it('should redo pole placement using real hook', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;
      let capturedPoles: Pole[] = [];

      const testOnPolesChange = (poles: Pole[]) => {
        capturedPoles = [...poles];
      };

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={testOnPolesChange}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      const originalPole = { ...capturedPoles[0] };

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      expect(capturedPoles.length).toBe(0);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.redoLocal();
      });

      expect(capturedPoles.length).toBe(1);
      expect(capturedPoles[0]).toEqual(originalPole);
      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(false);
    });

    it('should handle multiple undo operations with real hook', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      act(() => {
        rect.click();
      });

      act(() => {
        rect.click();
      });

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(3);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.redoStackSize).toBe(0);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(2);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.redoStackSize).toBe(1);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(1);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.redoStackSize).toBe(2);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(0);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.redoStackSize).toBe(3);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(true);
    });
  });

  describe('Real Hook State Management', () => {
    it('should clear redo stack when new pole is placed after undo', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(true);

      act(() => {
        rect.click();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.redoStackSize).toBe(0);
    });

    it('should maintain correct canUndo/canRedo state throughout lifecycle', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(false);

      act(() => {
        rect.click();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(false);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.undoLocal();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(true);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.redoLocal();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canUndoLocal()).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.canRedoLocal()).toBe(false);
    });
  });

  describe('Transaction Lifecycle', () => {
    it('should verify transaction is active after startTransaction', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.transaction.isActive).toBe(true);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.transaction.type).toBe('placement');
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.transaction.originalWall).toBeNull();
    });

    it('should rollback transaction and clear stacks', () => {
      const store = createStoreWithEncounter(mockEncounterEmpty);
      let transaction: ReturnType<typeof useWallTransaction> | null = null;

      const { container } = render(
        <Provider store={store}>
          <TestWrapper>
            {({ wallTransaction }) => {
              transaction = wallTransaction as ReturnType<typeof useWallTransaction>;
              return (
                <WallDrawingTool
                  encounterId='encounter-1'
                  wallIndex={0}
                  gridConfig={defaultGridConfig}
                  defaultHeight={10}
                  onCancel={onCancelSpy}
                  onFinish={onFinishSpy}
                  onPolesChange={onPolesChangeSpy}
                  wallTransaction={wallTransaction}
                />
              );
            }}
          </TestWrapper>
        </Provider>,
      );

      const rect = container.querySelector('[data-mock="konva-rect"]') as HTMLElement;

      act(() => {
        rect.click();
      });

      expect(transaction).not.toBeNull();
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(1);

      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: Checked for null above
        transaction!.rollbackTransaction();
      });

      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.transaction.isActive).toBe(false);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.undoStackSize).toBe(0);
      // biome-ignore lint/style/noNonNullAssertion: Checked for null above
      expect(transaction!.history.redoStackSize).toBe(0);
    });
  });
});
