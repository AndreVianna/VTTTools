# EPIC-005: AI Content Generation - Implementation Roadmap

**World**: AI Content Generation
**Type**: Large-Scale Infrastructure
**Status**: Planned
**Completion**: 0% (0h completed, 200-250h remaining)
**Total Effort**: 200-250 hours estimated
**Complexity**: Very High
**Created**: 2025-12-09
**Last Updated**: 2025-12-09

---

## Executive Summary

This roadmap provides a dependency-based implementation plan for EPIC-005. The implementation is organized into three tracks:
- **Track A**: Foundation (required for both internal and user features)
- **Track B**: Internal/Admin Tools (priority)
- **Track C**: End-User Features (after internal tools)

### Key Highlights

- **Internal Tools First**: Build platform content library before exposing to users
- **Existing Infrastructure**: Leverages existing AI microservice with factory pattern
- **Provider Completion**: Complete 3 stub implementations (ElevenLabs, Suno, RunwayML)
- **Style Consistency**: Multiple approaches combined for art consistency
- **Dual Budget Model**: User subscriptions + platform cost tracking

---

## Track A: Foundation (Required for Both)

### Phase 1: Prompt Template System
**Duration**: 20-25 hours
**Status**: NOT STARTED
**Dependencies**: None

**Backend Components**:
- [ ] PromptTemplate domain model (`Source/Domain/AI/Templates/`) (3h)
- [ ] PromptCategory enum with all categories (1h)
- [ ] IPromptTemplateService interface (1h)
- [ ] PromptTemplateEntity EF Core mapping (2h)
- [ ] PromptTemplateStorage implementation (3h)
- [ ] PromptTemplateSchemaBuilder with indexes (1h)
- [ ] PromptTemplateService implementation (4h)
- [ ] PromptTemplateHandlers (CRUD endpoints) (3h)
- [ ] Unit tests (≥80% coverage) (4h)

**Quality Gates**:
- [ ] Templates stored in database with versioning
- [ ] Variable substitution working ({assetName}, {category}, etc.)
- [ ] Template retrieval by name + active version
- [ ] Unit tests passing with ≥80% coverage

---

### Phase 2: Text Generation Service
**Duration**: 15-20 hours
**Status**: NOT STARTED
**Dependencies**: Phase 1 (Prompt Templates)

**Backend Components**:
- [ ] ITextGenerationService interface (1h)
- [ ] TextGenerationRequest/Response models (1h)
- [ ] TextGenerationService implementation (4h)
- [ ] OpenAiTextProvider (extends existing OpenAI integration) (3h)
- [ ] TextGenerationHandlers (POST endpoint) (2h)
- [ ] Integration with prompt templates (2h)
- [ ] Unit tests (≥80% coverage) (4h)

**Quality Gates**:
- [ ] Generate text from template + context
- [ ] Support custom prompts (bypass templates)
- [ ] Cost tracking per generation
- [ ] Unit tests passing with ≥80% coverage

---

### Phase 3: Audio Provider Implementations
**Duration**: 30-35 hours
**Status**: NOT STARTED
**Dependencies**: None (can parallel with Phase 1-2)

#### 3A: ElevenLabs Provider (15-18h)
- [ ] ElevenLabsHttpHelper (API client wrapper) (3h)
- [ ] ElevenLabsModels (request/response DTOs) (1h)
- [ ] ElevenLabsAudioProvider (replace stub) (6h)
- [ ] Voice selection with default (1h)
- [ ] Stability/similarity controls (1h)
- [ ] Unit tests (4h)

#### 3B: Suno Provider (15-17h)
- [ ] SunoHttpHelper (API client wrapper) (3h)
- [ ] SunoModels (request/response DTOs) (1h)
- [ ] SunoAudioProvider (replace stub) (6h)
- [ ] Style/genre selection (1h)
- [ ] Duration and instrumental controls (1h)
- [ ] Async polling for generation completion (2h)
- [ ] Unit tests (4h)

**Quality Gates**:
- [ ] ElevenLabs generates MP3 from text
- [ ] Suno generates music from prompt
- [ ] Both providers integrated with AudioGenerationService
- [ ] Cost calculation per provider
- [ ] Unit tests ≥80% coverage

---

### Phase 4: Video Provider Implementation
**Duration**: 15-20 hours
**Status**: NOT STARTED
**Dependencies**: None (can parallel with Phase 3)

**Components**:
- [ ] RunwayHttpHelper (API client wrapper) (3h)
- [ ] RunwayModels (request/response DTOs) (1h)
- [ ] RunwayVideoProvider (replace stub) (6h)
- [ ] Text-to-video generation (2h)
- [ ] Image-to-video generation (2h)
- [ ] Async polling for generation completion (2h)
- [ ] Unit tests (4h)

**Quality Gates**:
- [ ] Generate MP4 from text prompt
- [ ] Generate MP4 from image (animation)
- [ ] Duration control (4-16 seconds)
- [ ] Integrated with VideoGenerationService
- [ ] Unit tests ≥80% coverage

---

### Phase 5: Caching Infrastructure
**Duration**: 15-20 hours
**Status**: NOT STARTED
**Dependencies**: Phases 1-4

**Components**:
- [ ] GeneratedContentCache domain model (2h)
- [ ] IAiCacheService interface (1h)
- [ ] GeneratedContentCacheEntity EF Core mapping (2h)
- [ ] AiCacheService implementation (4h)
- [ ] SHA256 cache key generation (1h)
- [ ] TTL management (default 7 days) (1h)
- [ ] Integration with generation services (3h)
- [ ] Unit tests (4h)

**Quality Gates**:
- [ ] Cache hit returns existing content
- [ ] Cache key based on template + context + provider + model
- [ ] TTL expiration working
- [ ] Hit count tracking
- [ ] Unit tests ≥80% coverage

---

## Track B: Internal/Admin Tools (Priority)

### Phase 6A: Style Consistency Management
**Duration**: 20-25 hours
**Status**: NOT STARTED
**Dependencies**: Phase 1 (Prompt Templates)

**Components**:
- [ ] StyleTemplate domain model (2h)
- [ ] IStyleManagementService interface (1h)
- [ ] StyleTemplateEntity EF Core mapping (2h)
- [ ] StyleManagementService implementation (4h)
- [ ] Style prompt injection (append to all prompts) (2h)
- [ ] Seed persistence and retrieval (3h)
- [ ] Reference image support (image-to-image) (4h)
- [ ] Provider-specific style features (2h)
- [ ] Unit tests (4h)

**Quality Gates**:
- [ ] Named style presets working
- [ ] Consistent style suffix injection
- [ ] Seed saving and reuse for reproducibility
- [ ] Reference image guidance
- [ ] Unit tests ≥80% coverage

---

### Phase 6B: Platform Cost Tracking
**Duration**: 12-15 hours
**Status**: NOT STARTED
**Dependencies**: Phase 5 (Caching)

**Components**:
- [ ] PlatformGenerationCost domain model (2h)
- [ ] IPlatformCostService interface (1h)
- [ ] PlatformGenerationCostEntity EF Core mapping (2h)
- [ ] PlatformCostTrackingService implementation (4h)
- [ ] Monthly budget with 80% warning (2h)
- [ ] Hard stop at 100% (1h)
- [ ] Cost attribution by category (2h)
- [ ] Unit tests (3h)

**Quality Gates**:
- [ ] Separate tracking for platform vs user
- [ ] Alert at 80% monthly budget
- [ ] Block at 100% monthly budget
- [ ] Cost breakdown by asset category
- [ ] Unit tests ≥80% coverage

---

### Phase 6C: MediaGenerator Bulk Generation
**Duration**: 20-25 hours
**Status**: NOT STARTED
**Dependencies**: Phases 6A, 6B

**Components**:
- [ ] JSON manifest schema definition (2h)
- [ ] Manifest parser and validator (3h)
- [ ] BulkGenerateCommand (extends existing generate) (6h)
- [ ] Batch processing with parallelism control (3h)
- [ ] Progress tracking and reporting (2h)
- [ ] Resume capability (checkpoint files) (3h)
- [ ] Cost estimation (dry-run mode) (2h)
- [ ] Integration tests (4h)

**JSON Manifest Schema**:
```json
{
  "style": "fantasy-color-pencil",
  "provider": "OpenAI",
  "parallelism": 2,
  "assets": [
    {
      "name": "Goblin Warrior",
      "kind": "Creature",
      "category": "Humanoid",
      "type": "Goblin",
      "description": "A sneaky goblin..."
    }
  ]
}
```

**Quality Gates**:
- [ ] Parse and validate JSON manifest
- [ ] Generate all assets with style consistency
- [ ] Progress output during generation
- [ ] Resume from checkpoint after interruption
- [ ] Dry-run shows cost estimate
- [ ] Integration tests passing

---

### Phase 6D: Reverse Image Import
**Duration**: 25-30 hours
**Status**: NOT STARTED
**Dependencies**: Phase 6C

**Components**:
- [ ] ImportCommand (new command) (4h)
- [ ] Filename parser (naming convention) (2h)
- [ ] ImageMetadataService (AI vision for classification) (6h)
- [ ] AssetRecordGenerator (create asset from image) (6h)
- [ ] Missing variant detection (3h)
- [ ] Missing variant generation (2h)
- [ ] Integration tests (4h)

**Naming Convention**:
```
{asset_name}_{variant}.{ext}
Examples:
- goblin_warrior_portrait.png
- goblin_warrior_token.png
- ancient_dragon_portrait.jpg
```

**Quality Gates**:
- [ ] Parse folder of images by convention
- [ ] AI generates description from image
- [ ] AI classifies asset (kind, category, type)
- [ ] Create asset record with imported images
- [ ] Detect and generate missing variants
- [ ] Integration tests passing

---

## Track C: End-User Features (After Internal Tools)

### Phase 7: Subscription Tier System
**Duration**: 20-25 hours
**Status**: NOT STARTED
**Dependencies**: Track B complete

**Components**:
- [ ] AiSubscriptionTier enum (1h)
- [ ] UserAiSubscription domain model (2h)
- [ ] AiUsageTracker domain model (2h)
- [ ] IAiSubscriptionService interface (1h)
- [ ] UserAiSubscriptionEntity EF Core mapping (2h)
- [ ] AiUsageLogEntity EF Core mapping (2h)
- [ ] AiSubscriptionService implementation (6h)
- [ ] Subscription endpoints (GET, upgrade) (3h)
- [ ] Usage enforcement in generation services (2h)
- [ ] Unit tests (4h)

**Tier Limits**:
| Tier | Image | Text | Audio | Video |
|------|-------|------|-------|-------|
| Free | 10/mo | 50/mo | 5/mo | 0 |
| Pro | 100/mo | 500/mo | 50/mo | 10/mo |
| Premium | Unlimited | Unlimited | 200/mo | 50/mo |

**Quality Gates**:
- [ ] User subscription stored with tier
- [ ] Usage tracking per content type
- [ ] Monthly reset working
- [ ] Limit enforcement in services
- [ ] Upgrade request endpoint
- [ ] Unit tests ≥80% coverage

---

### Phase 8: Frontend AI Integration
**Duration**: 35-45 hours
**Status**: NOT STARTED
**Dependencies**: Phases 1-7

#### 8A: AI API Service (8-10h)
- [ ] Create aiApi.ts RTK Query slice (4h)
- [ ] Mutation hooks for generation endpoints (2h)
- [ ] Query hooks for providers/templates/subscription (2h)
- [ ] Register in store.ts (1h)

#### 8B: Reusable Components (12-15h)
- [ ] AiGenerationButton component (3h)
- [ ] AiGenerationDialog component (4h)
- [ ] AiGenerationProgress component (2h)
- [ ] AiBudgetIndicator component (2h)
- [ ] Component unit tests (4h)

#### 8C: Panel Integrations (15-20h)
- [ ] MetadataPanel - description generation (3h)
- [ ] VisualIdentityPanel - portrait/token generation (4h)
- [ ] DataPanel - stat block generation (3h)
- [ ] BackgroundPanel - background generation (3h)
- [ ] SoundsPanel - ambient audio generation (3h)
- [ ] Integration tests (4h)

**Quality Gates**:
- [ ] AI buttons visible in all target panels
- [ ] Generation dialog with provider selection
- [ ] Budget indicator shows remaining usage
- [ ] Generated content saved to asset/encounter
- [ ] Error handling for limit exceeded
- [ ] Unit tests ≥70% frontend coverage

---

### Phase 9: Default Templates Seed
**Duration**: 8-10 hours
**Status**: NOT STARTED
**Dependencies**: Phase 8

**Templates to Create**:
- [ ] `asset.description` - Asset lore/background
- [ ] `asset.portrait.character` - Character portraits
- [ ] `asset.portrait.creature` - Creature portraits
- [ ] `asset.token.topdown` - Top-down tokens
- [ ] `encounter.background` - Battle map backgrounds
- [ ] `encounter.ambient` - Environmental sounds
- [ ] `encounter.description` - Encounter narrative
- [ ] `npc.dialogue` - NPC speech

**Quality Gates**:
- [ ] All templates seeded in database
- [ ] Templates produce quality output
- [ ] Variable substitution verified
- [ ] Negative prompts appropriate

---

## Implementation Order Summary

| Order | Phase | Track | Effort | Dependencies |
|-------|-------|-------|--------|--------------|
| 1 | Phase 1: Prompt Templates | A | 20-25h | None |
| 2 | Phase 2: Text Generation | A | 15-20h | Phase 1 |
| 3 | Phase 3: Audio Providers | A | 30-35h | None (parallel) |
| 4 | Phase 4: Video Provider | A | 15-20h | None (parallel) |
| 5 | Phase 5: Caching | A | 15-20h | Phases 1-4 |
| 6 | Phase 6A: Style Consistency | B | 20-25h | Phase 1 |
| 7 | Phase 6B: Platform Cost | B | 12-15h | Phase 5 |
| 8 | Phase 6C: Bulk Generation | B | 20-25h | Phases 6A, 6B |
| 9 | Phase 6D: Reverse Import | B | 25-30h | Phase 6C |
| 10 | Phase 7: Subscriptions | C | 20-25h | Track B |
| 11 | Phase 8: Frontend | C | 35-45h | Phases 1-7 |
| 12 | Phase 9: Template Seed | C | 8-10h | Phase 8 |

**Total**: 200-250 hours

---

## Progress Tracking

### Phase Completion Checklist

- [ ] **Phase 1**: Prompt Template System (0/9 tasks)
- [ ] **Phase 2**: Text Generation Service (0/7 tasks)
- [ ] **Phase 3**: Audio Providers (0/12 tasks)
- [ ] **Phase 4**: Video Provider (0/7 tasks)
- [ ] **Phase 5**: Caching Infrastructure (0/8 tasks)
- [ ] **Phase 6A**: Style Consistency (0/9 tasks)
- [ ] **Phase 6B**: Platform Cost Tracking (0/8 tasks)
- [ ] **Phase 6C**: Bulk Generation (0/8 tasks)
- [ ] **Phase 6D**: Reverse Image Import (0/7 tasks)
- [ ] **Phase 7**: Subscription System (0/10 tasks)
- [ ] **Phase 8**: Frontend Integration (0/14 tasks)
- [ ] **Phase 9**: Default Templates (0/9 tasks)

---

## Risks & Mitigations

### Risk 1: Provider API Changes
**Likelihood**: Medium | **Impact**: High
**Mitigation**: Abstract provider interfaces, version lock API clients

### Risk 2: Cost Overruns (Platform)
**Likelihood**: Medium | **Impact**: Medium
**Mitigation**: Hard budget stops, cost estimation before generation

### Risk 3: Style Inconsistency
**Likelihood**: High | **Impact**: Medium
**Mitigation**: Multiple consistency approaches combined

### Risk 4: Subscription Abuse
**Likelihood**: Low | **Impact**: Medium
**Mitigation**: Rate limiting, usage logging, abuse detection

---

## Activity Log

- **2025-12-09**: EPIC-005 created. Comprehensive planning completed with dual-purpose scope (end-users + internal tools). Decisions made: internal tools first, all style consistency approaches, 3-tier subscriptions, simple platform budget with alerts.

---

## Related Documentation

- [TASK.md](./TASK.md) - Detailed specification
- [CHANGELOG.md](./CHANGELOG.md) - Activity log
- Existing AI: `Source/AI/`
- MediaGenerator: `Source/MediaGenerator/`
