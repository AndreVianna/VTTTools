# EPIC-005: AI Content Generation Enhancement - Changelog

## [Unreleased]

### Completed
- Phase 1.1: Prompt Template System (core infrastructure)

### In Progress
- Phase 1.2: Text Generation Service

### Planned
- Phase 2: Text Generation Service
- Phase 3: Audio Providers (ElevenLabs, Suno)
- Phase 4: Video Provider (RunwayML)
- Phase 5: Caching Infrastructure
- Phase 6A: Style Consistency Management
- Phase 6B: Platform Cost Tracking
- Phase 6C: MediaGenerator Bulk Generation
- Phase 6D: Reverse Image Import
- Phase 7: Subscription Tier System
- Phase 8: Frontend AI Integration
- Phase 9: Default Templates Seed

---

## Activity Log

### 2025-12-09 - EPIC Creation

**Session**: Initial Planning

**Completed**:
- Created EPIC-005 documentation structure
- Analyzed existing AI infrastructure (`Source/AI/`)
- Identified dual-purpose scope (end-users + internal tools)
- Mapped frontend integration opportunities
- Designed prompt template system
- Planned provider implementations

**Key Decisions**:
| Decision | Choice |
|----------|--------|
| Development Priority | Internal tools first |
| Audio Providers | ElevenLabs + Suno in parallel |
| User Budget Model | 3-tier subscription (Free/Pro/Premium) |
| Platform Budget Model | Simple budget + 80% warning + 100% stop |
| Template Storage | Database only (versioning, A/B testing) |
| Style Consistency | All approaches combined |
| UI Priority | All panels together |
| Video Scope | Include RunwayML |

**Exploration Findings**:

*Current AI Infrastructure*:
- AI microservice at `Source/AI/` with factory pattern
- Active providers: OpenAI (image, prompt), Stability AI, Google Gemini
- Stub providers: ElevenLabs, Suno, RunwayML (all throw NotImplementedException)
- MediaGenerator CLI with prepare/generate commands

*Frontend Integration Opportunities*:
- Asset Studio: MetadataPanel (description), VisualIdentityPanel (portrait/tokens)
- Encounter Editor: BackgroundPanel, SoundsPanel
- No existing AI API service in frontend

*Domain Model Targets*:
- Text fields: World/Campaign/Adventure/Encounter descriptions (4096 char)
- Image fields: Asset portraits/tokens, encounter backgrounds
- Audio fields: Encounter ambient sounds

**Files Created**:
- `Documents/Tasks/EPIC-005/README.md`
- `Documents/Tasks/EPIC-005/TASK.md`
- `Documents/Tasks/EPIC-005/ROADMAP.md`
- `Documents/Tasks/EPIC-005/CHANGELOG.md`

**Next Steps**:
1. Begin Phase 1: Prompt Template System
2. Parallel: Phase 3 Audio Providers (can start independently)

---

### 2025-12-09 - Phase 1.1 Prompt Template System

**Session**: Implementation

**Completed**:
- Created `PromptCategory` enum with 10 categories
- Created `PromptTemplate` domain model with versioning support
- Created `IPromptTemplateStorage` and `IPromptTemplateService` interfaces
- Implemented `PromptTemplateStorage` with EF Core
- Implemented `PromptTemplateService` with template variable resolution
- Created `PromptTemplateHandlers` with 8 API endpoints
- Registered services in AI Program.cs
- Created 25 unit tests with full coverage

**Files Created**:

*Domain Layer (`Source/Domain/AI/Templates/`)*:
- `PromptCategory.cs` - Category enum
- `Model/PromptTemplate.cs` - Domain model
- `Storage/IPromptTemplateStorage.cs` - Storage interface
- `Services/IPromptTemplateService.cs` - Service interface
- `ApiContracts/CreatePromptTemplateRequest.cs`
- `ApiContracts/UpdatePromptTemplateRequest.cs`
- `ApiContracts/PromptTemplateResponse.cs`

*Data Layer (`Source/Data/AI/`)*:
- `Entities/PromptTemplate.cs` - EF Core entity
- `Mapper.cs` - Entity/Model mapping
- `PromptTemplateStorage.cs` - Storage implementation

*Schema (`Source/Data/Builders/`)*:
- `PromptTemplateSchemaBuilder.cs` - EF Core configuration

*AI Service (`Source/AI/`)*:
- `Services/PromptTemplateService.cs` - Business logic
- `Handlers/PromptTemplateHandlers.cs` - API handlers

*Tests (`Source/AI.UnitTests/Services/`)*:
- `PromptTemplateServiceTests.cs` - 25 unit tests

**Files Modified**:
- `Source/Domain/GlobalUsings.cs` - Added template namespaces
- `Source/Data/GlobalUsings.cs` - Added template namespaces
- `Source/Data/ApplicationDbContext.cs` - Added DbSet and schema builder
- `Source/AI/GlobalUsings.cs` - Added template namespaces
- `Source/AI/Program.cs` - Registered services
- `Source/AI/EndpointMappers/AiEndpointsMapper.cs` - Added template endpoints
- `Source/AI.UnitTests/GlobalUsings.cs` - Added template namespaces

**API Endpoints Created**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/templates` | List all templates |
| GET | `/api/ai/templates/{id}` | Get template by ID |
| GET | `/api/ai/templates/by-name/{name}` | Get active template by name |
| POST | `/api/ai/templates` | Create template (Admin) |
| PUT | `/api/ai/templates/{id}` | Update template (Admin) |
| DELETE | `/api/ai/templates/{id}` | Delete template (Admin) |
| POST | `/api/ai/templates/{id}/activate` | Activate version (Admin) |
| POST | `/api/ai/templates/{id}/version` | Create new version (Admin) |

**Next Steps**:
1. Create EF Core migration for PromptTemplates table
2. Begin Phase 1.2: Text Generation Service
3. Seed default templates (Phase 9)
