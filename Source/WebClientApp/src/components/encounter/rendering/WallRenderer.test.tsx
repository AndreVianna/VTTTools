import { describe, expect, it } from 'vitest';
import { WallRenderer } from './WallRenderer';

describe('WallRenderer', () => {
  it('has correct display name', () => {
    expect(WallRenderer.displayName).toBe('WallRenderer');
  });

  it('component is defined and exports correctly', () => {
    expect(WallRenderer).toBeDefined();
    expect(typeof WallRenderer).toBe('function');
  });
});
