# EPIC-005: AI Content Generation Enhancement

**World**: AI Content Generation
**Type**: Large-Scale Infrastructure
**Status**: Planned
**Priority**: High
**Effort**: 200-250 hours
**Complexity**: Very High
**Created**: 2025-12-09
**Last Updated**: 2025-12-09

---

## Executive Summary

This EPIC enhances VTTTools' AI content generation capabilities for both end-users and platform development. It builds on the existing AI microservice (`Source/AI/`) to provide a comprehensive content generation platform.

### Dual Purpose

**A. End-User Features (Subscription-based)**
- Real-time AI generation in Asset Studio and Encounter Editor
- 3-tier subscription model (Free/Pro/Premium)
- Text, image, audio, and video generation

**B. Internal/Admin Tools (Platform Development)**
- MediaGenerator CLI enhancements for bulk asset creation
- Reverse image import (create asset records from existing images)
- Style consistency management across generations
- Platform cost tracking and budget management

---

## Current State Analysis

### Existing AI Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| ImageGenerationService | Active | OpenAI, Stability, Google providers |
| AudioGenerationService | Stub | ElevenLabs, Suno not implemented |
| VideoGenerationService | Stub | RunwayML not implemented |
| PromptEnhancementService | Active | OpenAI gpt-4o-mini |
| AiProviderFactory | Active | Well-designed factory pattern |
| MediaGenerator CLI | Active | Prepare + Generate commands |

### Provider Status

| Provider | Category | Status |
|----------|----------|--------|
| OpenAI | Image | Active (gpt-image-1) |
| OpenAI | Prompt | Active (gpt-4o-mini) |
| Stability AI | Image | Active (sd3) |
| Google | Image | Active (gemini-2.5-flash-image) |
| ElevenLabs | Audio | Stub (throws NotImplementedException) |
| Suno | Audio | Stub (throws NotImplementedException) |
| RunwayML | Video | Stub (throws NotImplementedException) |

---

## Scope

| Area | Description |
|------|-------------|
| **Prompt Management** | Template-based, versioned prompt system stored in database |
| **Provider Completion** | Implement ElevenLabs, Suno, RunwayML providers |
| **Frontend Integration** | Real-time AI generation in web UI (end-users) |
| **MediaGenerator Enhancement** | Bulk generation, reverse import, style consistency |
| **Cost Optimization** | Caching, subscriptions (users), budgets (platform) |
| **Text Generation** | New capability for descriptions, dialogue, stat blocks |

---

## Feature Specifications

### F1: Prompt Template System

**Domain Model**: `Source/Domain/AI/Templates/`

```
PromptTemplate
├── Id (Guid)
├── Name (string) - e.g., "asset.portrait.creature"
├── Category (PromptCategory enum)
├── TargetProvider (AiProviderType?)
├── Version (int)
├── SystemPrompt (string, 4096)
├── UserPromptTemplate (string, 4096) - with {variable} placeholders
├── NegativePromptTemplate (string, 2048)
├── Style (string?)
├── Parameters (Dictionary<string,string>)
├── IsActive (bool)
├── CreatedAt (DateTimeOffset)
└── UpdatedAt (DateTimeOffset)
```

**Categories**:
- `ImagePortrait` - Character/creature portraits
- `ImageToken` - Top-down battle tokens
- `ImageBackground` - Encounter backgrounds
- `AudioAmbient` - Environmental sounds
- `AudioMusic` - Background music
- `AudioVoice` - NPC text-to-speech
- `VideoBackground` - Animated backgrounds
- `TextDescription` - Asset/encounter descriptions
- `TextStatBlock` - D&D-style stat blocks
- `TextDialogue` - NPC dialogue generation

**Variable Syntax**:
- `{assetName}` - Asset name
- `{assetKind}` - Character/Creature/Object/Effect
- `{category}` - Classification category
- `{type}` - Classification type
- `{description}` - User-provided description
- `{style:default}` - Style with fallback value

### F2: Text Generation Service

**Purpose**: Generate full content (not just prompt enhancement)

**Request**:
```csharp
public sealed record TextGenerationRequest {
    public string? TemplateName { get; init; }
    public Dictionary<string, string> Context { get; init; } = [];
    public string? CustomPrompt { get; init; }
    public AiProviderType? Provider { get; init; }
    public string? Model { get; init; }
    public int MaxTokens { get; init; } = 500;
}
```

**Use Cases**:
- Generate asset descriptions from name/classification
- Generate encounter narratives from setting
- Generate NPC dialogue from context
- Generate stat blocks from creature type/CR

### F3: Audio Providers

**ElevenLabs** (Text-to-Speech):
- API: `POST /v1/text-to-speech/{voice_id}`
- Voice selection with stability/similarity controls
- MP3 output format
- Use case: NPC voices, narrative read-aloud

**Suno** (Music Generation):
- Music generation with style/genre selection
- Duration control (30s-120s)
- Instrumental option
- Use case: Ambient soundscapes, battle themes

### F4: Video Provider

**RunwayML** (Gen-3):
- Text-to-video generation
- Image-to-video (animate static backgrounds)
- 4-16 second clips
- MP4 output
- Use case: Animated encounter backgrounds

### F5: User Subscription System

**Tier Structure**:

| Tier | Price | Image | Text | Audio | Video |
|------|-------|-------|------|-------|-------|
| **Free** | $0 | 10/mo | 50/mo | 5/mo | 0 |
| **Pro** | TBD | 100/mo | 500/mo | 50/mo | 10/mo |
| **Premium** | TBD | Unlimited | Unlimited | 200/mo | 50/mo |

**Features**:
- Tier-based generation limits per content type
- Monthly usage tracking with reset
- Usage logging for analytics
- Upgrade prompts when limits reached
- Admin override capability

### F6: Frontend AI Integration

**Components**:
- `AiGenerationButton` - Trigger with budget check
- `AiGenerationDialog` - Provider/prompt selection
- `AiGenerationProgress` - Loading state with cost
- `AiBudgetIndicator` - Usage status

**Panel Integrations**:

| Panel | Feature | Template |
|-------|---------|----------|
| MetadataPanel | Description generation | `asset.description` |
| VisualIdentityPanel | Portrait/token generation | `asset.portrait.*` |
| DataPanel | Stat block generation | `asset.statblock` |
| BackgroundPanel | Background generation | `encounter.background` |
| SoundsPanel | Ambient audio generation | `encounter.ambient` |

### F7: MediaGenerator Enhancements

**Bulk Generation** (JSON Manifest):
```json
{
  "style": "fantasy-color-pencil",
  "provider": "OpenAI",
  "assets": [
    { "name": "Goblin Warrior", "kind": "Creature", "category": "Humanoid", "description": "..." }
  ]
}
```

Features:
- Batch processing with parallelism control
- Progress tracking and resume capability
- Cost estimation (dry-run mode)

**Reverse Image Import**:
1. Import folder with naming convention (`goblin_warrior_portrait.png`)
2. Parse filenames → asset name, variant type
3. Generate metadata using AI vision
4. Create asset records with imported images
5. Generate missing variants (have portrait → generate token)

### F8: Style Consistency Management

**Approaches** (all combined):
- **Style Templates**: Named presets with detailed prompts
- **Reference Images**: Image-to-image for style matching
- **Seed Persistence**: Save generation seeds for reproducibility
- **Style Injection**: Consistent suffix in all prompts

### F9: Platform Cost Tracking

**Features**:
- Separate tracking for platform vs user generations
- Simple budget with 80% warning, 100% hard stop
- Cost attribution by asset category
- Monthly reports

---

## Technical Architecture

### Backend Components

**Domain** (`Source/Domain/AI/`):
- `Templates/` - PromptTemplate, PromptCategory, IPromptTemplateService
- `TextGeneration/` - ITextGenerationService, request/response models
- `Subscription/` - AiSubscriptionTier, UserAiSubscription, IAiSubscriptionService
- `Cache/` - GeneratedContentCache, IAiCacheService
- `Styles/` - StyleTemplate, IStyleManagementService
- `PlatformCost/` - PlatformGenerationCost, IPlatformCostService

**Data** (`Source/Data/AI/`):
- PromptTemplateEntity, PromptTemplateStorage
- UserAiSubscriptionEntity, AiUsageLogEntity
- GeneratedContentCacheEntity
- StyleTemplateEntity
- PlatformGenerationCostEntity

**AI Service** (`Source/AI/`):
- Services: PromptTemplateService, TextGenerationService, AiCacheService, etc.
- Providers: Complete ElevenLabs, Suno, RunwayML implementations

**MediaGenerator** (`Source/MediaGenerator/`):
- Commands: ImportCommand (new)
- Services: ImageMetadataService, AssetRecordGenerator, StyleConsistencyService

### Frontend Components

**Services** (`Source/WebClientApp/src/services/`):
- `aiApi.ts` - RTK Query slice for AI endpoints

**Components** (`Source/WebClientApp/src/components/ai/`):
- AiGenerationButton
- AiGenerationDialog
- AiGenerationProgress
- AiBudgetIndicator

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ai/templates` | List prompt templates |
| GET | `/api/ai/templates/{id}` | Get template by ID |
| POST | `/api/ai/text/generate` | Generate text content |
| GET | `/api/ai/subscription` | Get user subscription/usage |
| GET | `/api/ai/budget` | Get platform budget status |

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Development Priority** | Internal tools first | Build platform content library before user features |
| **Audio Providers** | ElevenLabs + Suno parallel | Cover both TTS and music generation |
| **User Budget Model** | 3-tier subscription | Flexible monetization with upgrade path |
| **Platform Budget Model** | Simple budget + alerts | 80% warning, 100% stop per month |
| **Template Storage** | Database only | Enables versioning, A/B testing |
| **Style Consistency** | All approaches combined | Templates + seeds + img2img + provider features |
| **UI Priority** | All panels together | Consistent AI experience across app |
| **Video Scope** | Include RunwayML | Full feature set for animated backgrounds |

---

## Out of Scope

- Admin UI for managing prompt templates (future)
- A/B testing framework for prompts (future)
- Payment integration for subscriptions (EPIC-003)
- Usage analytics dashboard (future)
- Bulk generation queue system (future)

---

## Related Documentation

- [ROADMAP.md](./ROADMAP.md) - Implementation phases
- [CHANGELOG.md](./CHANGELOG.md) - Activity log
- [Source/AI/](../../Source/AI/) - Existing AI infrastructure
- [Source/MediaGenerator/](../../Source/MediaGenerator/) - CLI tool
