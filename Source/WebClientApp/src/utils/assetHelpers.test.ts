/**
 * assetHelpers Tests
 * Tests asset helper functions for new backend schema (AssetToken, portrait separation)
 * TARGET_COVERAGE: 80%+
 */

import { describe, expect, it } from 'vitest';
import {
  mockAssetToken,
  mockAssetWithMultipleTokens,
  mockAssetWithPortrait,
  mockMonsterAsset,
  mockMediaResource,
} from '@/test-utils/assetMocks';
import { getDefaultToken, getPortrait, getResourceUrl } from './assetHelpers';

describe('assetHelpers', () => {
  describe('getDefaultToken', () => {
    it('should return token with isDefault=true', () => {
      const asset = mockAssetWithMultipleTokens();

      const result = getDefaultToken(asset);

      expect(result).toBeDefined();
      expect(result?.isDefault).toBe(true);
      expect(result?.token.id).toBe('token-2');
    });

    it('should return undefined when no default token exists', () => {
      const asset = mockMonsterAsset({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: false,
          }),
          mockAssetToken({
            token: mockMediaResource({ id: 'token-2' }),
            isDefault: false,
          }),
        ],
      });

      const result = getDefaultToken(asset);

      expect(result).toBeUndefined();
    });

    it('should return undefined when tokens array is empty', () => {
      const asset = mockMonsterAsset({ tokens: [] });

      const result = getDefaultToken(asset);

      expect(result).toBeUndefined();
    });

    it('should return first default token when multiple defaults exist', () => {
      const asset = mockMonsterAsset({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: true,
          }),
          mockAssetToken({
            token: mockMediaResource({ id: 'token-2' }),
            isDefault: true,
          }),
          mockAssetToken({
            token: mockMediaResource({ id: 'token-3' }),
            isDefault: false,
          }),
        ],
      });

      const result = getDefaultToken(asset);

      expect(result).toBeDefined();
      expect(result?.token.id).toBe('token-1');
    });
  });

  describe('getPortrait', () => {
    it('should return portrait when it exists', () => {
      const asset = mockAssetWithPortrait();

      const result = getPortrait(asset);

      expect(result).toBeDefined();
      expect(result?.id).toBe('portrait-123');
      expect(result?.path).toBe('/media/test-portrait.png');
    });

    it('should return undefined when portrait does not exist', () => {
      const asset = mockMonsterAsset();

      const result = getPortrait(asset);

      expect(result).toBeUndefined();
    });

    it('should return portrait even if tokens exist', () => {
      const asset = mockAssetWithPortrait({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: true,
          }),
          mockAssetToken({
            token: mockMediaResource({ id: 'token-2' }),
            isDefault: false,
          }),
        ],
      });

      const result = getPortrait(asset);

      expect(result).toBeDefined();
      expect(result?.id).toBe('portrait-123');
    });
  });

  describe('getResourceUrl', () => {
    it('should construct URL with resource ID', () => {
      const resourceId = 'resource-123';

      const result = getResourceUrl(resourceId);

      expect(result).toContain(resourceId);
      expect(result).toMatch(/\/resources\/resource-123$/);
    });

    it('should handle different resource IDs', () => {
      const resourceIds = ['abc-123', 'xyz-456', 'token-789'];

      resourceIds.forEach((id) => {
        const result = getResourceUrl(id);
        expect(result).toContain(id);
        expect(result).toMatch(new RegExp(`/resources/${id}$`));
      });
    });
  });

  describe('Token fallback logic', () => {
    it('should prioritize default token over first token', () => {
      const asset = mockMonsterAsset({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: false,
          }),
          mockAssetToken({
            token: mockMediaResource({ id: 'token-2' }),
            isDefault: true,
          }),
          mockAssetToken({
            token: mockMediaResource({ id: 'token-3' }),
            isDefault: false,
          }),
        ],
      });

      const defaultToken = getDefaultToken(asset);

      expect(defaultToken?.token.id).toBe('token-2');
    });

    it('should handle asset with only one token (auto-default)', () => {
      const asset = mockMonsterAsset({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: true,
          }),
        ],
      });

      const defaultToken = getDefaultToken(asset);

      expect(defaultToken).toBeDefined();
      expect(defaultToken?.token.id).toBe('token-1');
    });

    it('should return undefined for object with no tokens', () => {
      const asset = mockMonsterAsset({ tokens: [] });

      const defaultToken = getDefaultToken(asset);

      expect(defaultToken).toBeUndefined();
    });
  });

  describe('Integration: token and portrait separation', () => {
    it('should allow asset with both tokens and portrait', () => {
      const asset = mockAssetWithPortrait({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: true,
          }),
        ],
      });

      const token = getDefaultToken(asset);
      const portrait = getPortrait(asset);

      expect(token).toBeDefined();
      expect(token?.token.id).toBe('token-1');
      expect(portrait).toBeDefined();
      expect(portrait?.id).toBe('portrait-123');
    });

    it('should allow asset with tokens but no portrait', () => {
      const asset = mockMonsterAsset({
        tokens: [
          mockAssetToken({
            token: mockMediaResource({ id: 'token-1' }),
            isDefault: true,
          }),
        ],
        portrait: undefined,
      });

      const token = getDefaultToken(asset);
      const portrait = getPortrait(asset);

      expect(token).toBeDefined();
      expect(portrait).toBeUndefined();
    });

    it('should allow asset with portrait but no tokens', () => {
      const asset = mockAssetWithPortrait({ tokens: [] });

      const token = getDefaultToken(asset);
      const portrait = getPortrait(asset);

      expect(token).toBeUndefined();
      expect(portrait).toBeDefined();
    });
  });
});
