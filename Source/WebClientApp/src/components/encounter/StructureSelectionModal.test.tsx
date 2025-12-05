import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import { StructureSelectionModal } from './StructureSelectionModal';

const createMockStore = () => {
  return configureStore({
    reducer: {
      WallApi: (state = {}) => state,
      regionApi: (state = {}) => state,
      sourceApi: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

describe('StructureSelectionModal', () => {
  it('should render Wall title when mode is wall', () => {
    const store = createMockStore();
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(
      <Provider store={store}>
        <StructureSelectionModal open={true} mode='wall' onSelect={onSelect} onCancel={onCancel} />
      </Provider>,
    );

    expect(screen.getByText('Select Wall')).toBeInTheDocument();
  });

  it('should render region title when mode is region', () => {
    const store = createMockStore();
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(
      <Provider store={store}>
        <StructureSelectionModal open={true} mode='region' onSelect={onSelect} onCancel={onCancel} />
      </Provider>,
    );

    expect(screen.getByText('Select Region')).toBeInTheDocument();
  });

  it('should render light source title when mode is light', () => {
    const store = createMockStore();
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(
      <Provider store={store}>
        <StructureSelectionModal open={true} mode='light' onSelect={onSelect} onCancel={onCancel} />
      </Provider>,
    );

    expect(screen.getByText('Select Light Source')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button clicked', () => {
    const store = createMockStore();
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(
      <Provider store={store}>
        <StructureSelectionModal open={true} mode='wall' onSelect={onSelect} onCancel={onCancel} />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should not render when open is false', () => {
    const store = createMockStore();
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(
      <Provider store={store}>
        <StructureSelectionModal open={false} mode='wall' onSelect={onSelect} onCancel={onCancel} />
      </Provider>,
    );

    expect(screen.queryByText('Select Wall')).not.toBeInTheDocument();
  });
});
