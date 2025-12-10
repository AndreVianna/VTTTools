# EPIC-005: AI Content Generation Enhancement

## Quick Overview

| Property | Value |
|----------|-------|
| **Type** | World (Large-Scale Infrastructure) |
| **Status** | Planned |
| **Priority** | High |
| **Effort** | 200-250 hours |
| **Created** | 2025-12-09 |

## Purpose

Comprehensive improvement of AI content generation for VTTTools, serving two audiences:

### A. End-User Features (Subscription-based)
Enable VTT users to generate content directly in the app:
- Asset descriptions, portraits, tokens
- Encounter backgrounds and ambient audio
- NPC dialogue and stat blocks

### B. Internal/Admin Tools (Platform Development)
Tools for building and maintaining the platform's public content library:
- MediaGenerator CLI bulk generation
- Reverse image import (create assets from existing images)
- Style consistency management
- Platform cost tracking

## Key Deliverables

1. **Prompt Template System** - Versioned, configurable prompt management
2. **Audio/Video Providers** - Complete ElevenLabs, Suno, RunwayML implementations
3. **Frontend AI Integration** - Real-time generation in Asset Studio & Encounter Editor
4. **MediaGenerator Enhancements** - Bulk generation, reverse import, consistency
5. **Cost Management** - User subscriptions + platform budget tracking

## Implementation Priority

**Internal tools first** - Build platform content library before exposing to end users.

## Documentation

- [TASK.md](./TASK.md) - Detailed specification
- [ROADMAP.md](./ROADMAP.md) - Implementation phases and progress
- [CHANGELOG.md](./CHANGELOG.md) - Activity log

## Dependencies

- EPIC-001 (Core VTT features) - Asset/Media infrastructure
- Existing AI module (`Source/AI/`) - Provider abstractions
