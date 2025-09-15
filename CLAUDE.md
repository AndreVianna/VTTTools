# CLAUDE.md

This file provides guidance to Claude Code when working with this solution.

## ⚠️ [PRIORITY:HIGH] General Behavior ⚠️

- **CRITICAL** Please avoid sycophancy!
- **CRITICAL** NEVER SAY "You are right!", "You're absolutely right!", "You're absolutely correct!", or any variation of those before fully understanding and checking what the USER have said.
- **CRITICAL** ALWAYS check your work and the work of subagents.
- **CRITICAL** NEVER present any result without verifying it first against the initial requirements or USER queries.

## [PRIORITY:HIGH] Solution Context

### Solution Identity
- **SOLUTION_NAME**: VTTTools
- **SOLUTION_TYPE**: .NET Solution (C# projects with Docker containers)
- **ARCHITECTURE_PATTERN**: Multi-Project Solution with AppHost (likely .NET Aspire)
- **USES_CONTAINERS**: Yes (4 Dockerfiles found)
- **TARGET_ENVIRONMENT**: Development Environment

### Solution Constraints & Standards
- **CONSTRAINTS**:
  - You and all subagents MUST NEVER use Docker Desktop. NO integration with Docker Desktop is possible. REMOVE ALL references to Docker Desktop.
  - Follow .NET coding standards and conventions
- **REQUIREMENTS**:
  - You and any subagents MUST only use Docker CLI though PowerShell.
  - Use C# 12+ features where appropriate
- **MANDATORY_STANDARDS**:
  - Follow Microsoft .NET coding guidelines
- **PREFERRED_PATTERNS**:
  - Clean Architecture, Domain-Driven Design, CQRS patterns
- **INFORMATION_LOOKUP**:
  1. **Dynamic Memory** (MCP) → 2. **Project Guides** (./Documents/Guides/) → 3. **Project Specs** (./Documents/Specifications/) → 4. **Code Base** → 5. **External** (Web Search)
  - Use Documents/Guides/TESTING_BEST_PRACTICES.md for comprehensive testing procedures (Unit, Integration, E2E)
  - Use Documents/Guides/ASPIRE_TROUBLESHOOTING.md for infrastructure and service health issues
  - Use Documents/Guides/REACT_ASPIRE_INTEGRATION.md for frontend-backend integration patterns
  - Use Documents/Guides/INFRASTRUCTURE_SETUP.md for native Windows services and Docker CLI setup
  - Use PROJECT_DEFINITION.md for game concepts, entities, UI specs
  - Use ROADMAP.md for development phases, task status

## [PRIORITY:HIGH] Module Architecture

### Core Projects
- **AppHost**: `Source/AppHost` - .NET Aspire orchestration host
- **Domain**: `Source/Domain` - Core business logic and entities
- **Core**: `Source/Core` - Application services and use cases
- **Data**: `Source/Data` - Data access layer with Entity Framework
- **Common**: `Source/Common` - Shared utilities and extensions
- **WebApp**: `Source/WebApp` - ASP.NET Core API backend
- **WebClientApp**: `Source/WebClientApp` - React SPA frontend (current)
- **WebApp.WebAssembly**: `Source/WebApp.WebAssembly` - Blazor WASM frontend (legacy)

### Microservices Architecture
- **Auth Service**: `Source/Auth` - Authentication and authorization microservice
- **Assets Service**: `Source/Assets` - Asset management and media processing
- **Game Service**: `Source/Game` - Game session and real-time features
- **Library Service**: `Source/Library` - Adventure and content management
- **Media Service**: `Source/Media` - File upload and media storage

### Infrastructure Services
- **Data Migration Service**: `Source/Data.MigrationService` - Database schema management
- **SQL Server**: Database backend (native Windows service or Docker)
- **Redis**: Caching and session storage (native Windows service or Docker)

## [PRIORITY:MEDIUM] Cross-Module Operations

### Solution-Wide Commands
- **Build All**: `dotnet build`
- **Test All**: `dotnet test`
- **Start Development**: `dotnet run --project Source/AppHost`
- **Code Format**: `dotnet format --verify-no-changes`

### Module Dependencies
- **AppHost** → All Services (Auth, Assets, Game, Library, Media, WebApp, WebClientApp)
- **WebApp** → Core, Domain, Data, Common (ASP.NET Core API backend)
- **WebClientApp** → Communicates with all microservices via Vite proxy
- **Auth Service** → Domain, Common, Data (Identity and authentication)
- **Microservices** → Domain, Common (shared business logic and utilities)
- **Unit Test Projects** → Corresponding source projects with mocking frameworks

## [PRIORITY:MEDIUM] Documentation & Navigation

### Documentation Structure
- **Main Project Document**: ./README.md
- **Specifications**: ./Documents/Specifications/ - Core project documentation
  - PROJECT_DEFINITION.md - Game concepts, entities, UI specifications
  - ROADMAP.md - Development phases, completed/pending tasks
  - PROJECT_STRUCTURE.md - Complete directory structure
- **Guides**: ./Documents/Guides/ - Testing and infrastructure guides
  - TESTING_BEST_PRACTICES.md - Comprehensive testing procedures (Unit, Integration, E2E)
  - ASPIRE_TROUBLESHOOTING.md - Infrastructure troubleshooting and native Windows alternatives
  - REACT_ASPIRE_INTEGRATION.md - Frontend-backend service communication and authentication patterns
  - INFRASTRUCTURE_SETUP.md - Native Windows services setup and Docker CLI configuration
- **Templates**: ./Documents/Templates/ - Reusable specification templates

### Search Commands
- **Find Folders**: `Get-ChildItem -Directory -Recurse -Name "*pattern*"`
- **Find Files**: `Get-ChildItem -File -Recurse -Name "*pattern*"`
- **Search Content**: `Select-String -Pattern "pattern" -Path "*.cs" -Recurse`
- **Search Documentation**: `Select-String -Pattern "pattern" -Path "Documents/**/*.md" -Recurse`

## [PRIORITY:LOW] Reference Context

### Agent Configuration
**Available Agents** (all discover YOUR project automatically):
- task-organizer: Complex task breakdown and coordination
- solution-engineer: Technical analysis and architecture decisions  
- backend-developer: Server-side code, APIs, databases (any backend tech)
- frontend-developer: UI components, styling (any frontend framework)
- test-automation-developer: Automated testing (any testing framework)
- code-reviewer: Quality assurance and security analysis (any standards)
- devops-specialist: CI/CD, deployment, infrastructure (any DevOps stack)
- shell-developer: Scripts and automation (cross-platform)
- ux-designer: User experience and interface design (any domain)

**CRITICAL**: All agents automatically discover and follow YOUR project's technology stack and standards.
**See**: Documents/Guides/AGENT_USAGE_GUIDE.md for detailed coordination patterns and examples.

### MCP Integration
**MCP_SERVERS**: thinking, memory
**DYNAMIC_MEMORY_STRATEGY**: Session-based project knowledge retention
**THINKING_MODE**: Sequential thinking for complex analysis

