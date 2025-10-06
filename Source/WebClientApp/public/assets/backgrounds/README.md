# Background Images for Scene Editor

This directory contains background images for the VTT scene editor.

**Theme Support**: The canvas background color adapts to dark/light mode:
- **Dark Mode**: `#1F2937` (dark gray) - professional tactical map aesthetic
- **Light Mode**: `#F9FAFB` (light gray/white) - bright, clean workspace

## Default Background Image

**Required File:** `default.png`

**Instructions:**
1. Save the background image to this directory
2. Name it: `default.png`
3. This image will be used as the default background for the scene editor

**Image Specifications:**
- Format: PNG, JPG, or WebP
- **Resolution**: 2800 x 2100 pixels (matches stage dimensions)
- **Rendering**: 1:1 pixel-perfect at 100% zoom (no scaling)
- Higher or lower resolution images will render at their native size

## Adding Custom Backgrounds

To add more background images:
1. Place image files in this directory
2. Update `SceneEditorPage.tsx` to reference the new image path
3. Images are served from `/assets/backgrounds/` URL path

## Current Default

- **Path**: `/assets/backgrounds/default.png`
- **Type**: Tactical tavern map (PNG format)
- **Image Dimensions**: 2800px x 2100px
- **Stage Dimensions**: 2800px x 2100px (1:1 rendering at 100% zoom)
- **Used In**: Phase 3 - Scene Editor Background Rendering
