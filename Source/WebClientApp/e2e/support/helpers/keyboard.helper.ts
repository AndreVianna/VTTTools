/**
 * Keyboard Modifier Helper
 *
 * Handles keyboard modifier + click actions for role assignment
 * Used for: Alt+Click (Token), Ctrl+Click (Display), Ctrl+Alt+Click (Both)
 */

import type { Locator, Page } from '@playwright/test';

export class KeyboardModifierHelper {
  constructor(private page: Page) {}

  /**
   * Click element with modifier keys pressed
   */
  async clickWithModifiers(
    target: string | Locator,
    modifiers: {
      alt?: boolean;
      ctrl?: boolean;
      meta?: boolean;
      shift?: boolean;
    },
  ): Promise<void> {
    const keys: string[] = [];
    if (modifiers.alt) keys.push('Alt');
    if (modifiers.ctrl) keys.push('Control');
    if (modifiers.meta) keys.push('Meta');
    if (modifiers.shift) keys.push('Shift');

    // Press modifiers
    for (const key of keys) {
      await this.page.keyboard.down(key);
    }

    // Click element (handle both string selector and Locator)
    if (typeof target === 'string') {
      await this.page.click(target);
    } else {
      await target.click();
    }

    // Release modifiers in reverse order
    for (const key of keys.reverse()) {
      await this.page.keyboard.up(key);
    }
  }

  /**
   * Alt+Click to toggle Token role
   */
  async altClick(target: string | Locator): Promise<void> {
    await this.clickWithModifiers(target, { alt: true });
  }

  /**
   * Ctrl+Click to toggle Display role
   */
  async ctrlClick(target: string | Locator): Promise<void> {
    await this.clickWithModifiers(target, { ctrl: true });
  }

  /**
   * Ctrl+Alt+Click to toggle both roles
   */
  async ctrlAltClick(target: string | Locator): Promise<void> {
    await this.clickWithModifiers(target, { alt: true, ctrl: true });
  }
}
