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
  1. **Dynamic Memory** (MCP) → 2. **Docs & Guides** ('./Documents') → 3. **Code Base** → 4. **External** (Web Search)

## [PRIORITY:HIGH] Module Architecture

### Core Projects
- **AppHost**: `Source/AppHost` - .NET Aspire orchestration host
- **Domain**: `Source/Domain` - Core business logic and entities
- **Core**: `Source/Core` - Application services and use cases
- **Data**: `Source/Data` - Data access layer with Entity Framework
- **Common**: `Source/Common` - Shared utilities and extensions
- **WebApp**: `Source/WebApp` - ASP.NET Core API backend
- **WebApp.WebAssembly**: `Source/WebApp.WebAssembly` - Blazor WASM frontend

### Containerized Services
- **Assets Service**: `Source/Assets` (Docker)
- **Game Service**: `Source/Game` (Docker)
- **Library Service**: `Source/Library` (Docker)
- **Media Service**: `Source/Media` (Docker)

## [PRIORITY:MEDIUM] Cross-Module Operations

### Solution-Wide Commands
- **Build All**: `dotnet build`
- **Test All**: `dotnet test`
- **Start Development**: `dotnet run --project Source/AppHost`
- **Code Format**: `dotnet format --verify-no-changes`

### Module Dependencies
- AppHost → All Services
- WebApp → Core, Domain, Data, Common
- Services → Domain, Common
- UnitTests → Corresponding Source Projects

## [PRIORITY:MEDIUM] Documentation & Navigation

### Documentation Structure
- **Main Project Document**: ./README.md
- **Documentation Folder**: ./Documents
- **Specifications**: ./Documents/Specification
- **Guides**: ./Documents/Guides
- **Templates**: ./Documents/Templates
- **Troubleshooting**: ./Documents/Troubleshooting

### Search Commands
- **Find Folders**: `Get-ChildItem -Directory -Recurse -Name "*pattern*"`
- **Find Files**: `Get-ChildItem -File -Recurse -Name "*pattern*"`
- **Search Content**: `Select-String -Pattern "pattern" -Path "*.cs" -Recurse`

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

