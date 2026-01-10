import { describe, expect, it } from 'vitest';
import { FogOfWarRenderer } from './FogOfWarRenderer';

describe('FogOfWarRenderer', () => {
  it('component is defined and exports correctly', () => {
    expect(FogOfWarRenderer).toBeDefined();
    expect(typeof FogOfWarRenderer).toBe('object');
  });

  it('is a memoized React component', () => {
    expect(FogOfWarRenderer.$$typeof).toBeDefined();
  });
});
