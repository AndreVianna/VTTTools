# VTTTools Technology Stack

**Last Updated**: January 2025

This document consolidates all technology stack information for VTTTools. All agents reference this document instead of duplicating stack details.

---

## 🎯 Solution Overview

**Solution Name**: VTTTools (Virtual Tabletop Tools)
**Architecture**: Full-stack web application with C# backend and React frontend
**Pattern**: DDD Contracts + Service Implementation
**Solution File**: `VttTools.slnx` (NOT `VttTools.sln`) ⚠️ **CRITICAL**

---

## 🔧 Backend Stack

### Core Technologies
- **Language**: C# 14 / .NET 10
- **Framework**: ASP.NET Core with Minimal APIs
- **Database**: Entity Framework Core (code-first migrations)
- **Testing**: xUnit 2.9+ with FluentAssertions 6.12+ (≥80% coverage required)

### Key Backend Conventions
- **Brace Style**: K&R (opening brace on same line)
- **Namespaces**: File-scoped only (`namespace VttTools.Game;`)
- **Constructors**: Primary constructors for services and storage classes
- **Collections**: Collection expressions (`List<int> nums = [];`)
- **Null Checks**: Pattern matching (`if (value is null)`)
- **Local Variables**: Always use `var`
- **Private Fields**: `_camelCase` naming
- **Async Methods**: Require `Async` suffix (e.g., `GetByIdAsync(...)`)
- **Cancellation**: All async methods include `CancellationToken ct = default`

### DDD Architecture Layers

**1. Domain Layer** (`Source/Domain/`)
- Anemic models (records with init-only properties)
- NO business logic in domain models
- Use `Guid.CreateVersion7()` for ID generation
- Initialize collections with `= [];`

**2. Service Layer** (`Source/{Area}/Services/`)
- Business logic implementation
- Primary constructors for dependency injection
- Validation using FluentValidation patterns
- TypedResult pattern for operation results

**3. Storage Layer** (`Source/Data/`)
- Repository pattern with interface abstraction
- EF Core DbContext implementation
- Async/await for all database operations
- Interface: `I{Entity}Storage`

**4. API Layer** (`Source/{Area}/Handlers/`)
- Static handler methods in dedicated classes
- ASP.NET Core typed results: `Results<Ok<T>, NotFound>`
- Map API contracts to service contracts

---

## 🎨 Frontend Stack

### Core Technologies
- **Framework**: React 18 with TypeScript 5
- **Type Safety**: TypeScript strict mode (10 strict flags enabled)
- **UI Library**: Material-UI (MUI) - latest stable version
- **State Management**: Redux Toolkit 2.9 with RTK Query
- **Build Tool**: Vite
- **Testing**: Vitest 2.1+ with React Testing Library (≥70% coverage required)

### Frontend Location
**Path**: `Source/WebClientApp/`

### Key Frontend Conventions
- **Indentation**: 4 spaces
- **Quotes**: Single quotes required
- **Semicolons**: Required
- **Components**: Function components only (no class components)
- **Props**: Interfaces with `Props` suffix (e.g., `interface LoginFormProps {}`)
- **Hooks**: Custom hooks use `use` prefix (e.g., `export const useAuth = () => {}`)
- **File Extensions**: `.tsx` for components, `.ts` for utilities

### Path Aliases Configured
- `@components` → components directory
- `@pages` → pages directory
- `@store` → Redux store directory
- `@utils` → utilities directory

### Theme System (CRITICAL)
- **MANDATORY**: All components MUST support dark/light mode
- **Theme Access**: Use `useTheme()` hook from `@mui/material/styles`
- **NO Hardcoded Colors**: Use theme palette values only
- **Testing**: Test ALL components in both dark and light themes
- **Reference**: See `Documents/Guides/THEME_GUIDE.md` for complete theme tokens

### MUI Design System
- Use `sx` prop for component styling (preferred over styled-components)
- Use MUI icons from `@mui/icons-material`
- Use MUI Grid/Stack for layouts
- Use MUI Typography variants (h1-h6, body1, body2, etc.)
- Spacing: `theme.spacing(1)` = 8px

---

## 🧪 Testing Stack

### Backend Testing (xUnit)
- **Framework**: xUnit 2.9+
- **Assertions**: FluentAssertions 6.12+
- **Mocking**: NSubstitute (or Moq)
- **Coverage Target**: ≥80% for services and business logic
- **Pattern**: AAA (Arrange, Act, Assert)
- **Naming**: `{Method}_{Scenario}_{Expected}`
- **Location**: `*.UnitTests/` projects (e.g., `Source/Assets.UnitTests/`)

### Frontend Testing (Vitest)
- **Framework**: Vitest 2.1+
- **Component Testing**: React Testing Library
- **API Mocking**: Mock Service Worker (MSW)
- **Coverage Target**: ≥70% for components and hooks
- **Pattern**: AAA (Arrange, Act, Assert)
- **Naming**: `should {expected} when {scenario}`
- **Location**: Co-located `.test.tsx` files (e.g., `LoginForm.test.tsx`)

### BDD Testing
- **Language**: Gherkin/Cucumber syntax
- **Location**: `Documents/Features/` (following domain structure)
- **Reference**: See `Documents/Guides/BDD_CUCUMBER_GUIDE.md`

---

## 🏗️ Architecture Pattern: DDD Contracts + Service Implementation

### Pattern Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│  Static handlers return TypedResults (Ok, NotFound, etc.)   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Service Layer                               │
│  Business logic with primary constructors + validation      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 Storage Layer                                │
│  Repository pattern with EF Core implementation             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Domain Layer                                │
│  Anemic records with init-only properties (NO logic)        │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles
1. **Separation of Concerns**: Each layer has distinct responsibility
2. **Interface-Based Abstractions**: Services and storage use interfaces for testability
3. **Anemic Domain Models**: Business logic in service layer, NOT domain layer
4. **TypedResult Pattern**: Operation results include status codes and data/errors
5. **Async/Await Throughout**: All I/O operations are async with CancellationToken

---

## 🔐 Security Standards

### OWASP Top 10 Compliance
- **A01**: Authorization checks on all API endpoints
- **A02**: Sensitive data encrypted, HTTPS enforced, no secrets in code
- **A03**: SQL injection prevented (EF Core parameterized queries)
- **A04**: Proper authentication/authorization architecture
- **A05**: No default credentials, security headers configured
- **A07**: Strong password requirements, session timeouts
- **A08**: Dependencies from trusted sources
- **A09**: Security events logged, no sensitive data in logs
- **A10**: External URLs validated

### Additional Security Requirements
- No hardcoded secrets or connection strings
- Input validation on all service methods
- Authentication/Authorization checks enforced
- React automatic XSS escaping (frontend)

---

## 🛠️ Infrastructure

### Azure Services
- **Blob Storage**: Asset and media file storage
- **Health Checks**: Configured in `Source/Common/HealthChecks/`
  - `BlobStorageHealthCheck` - Azure Blob Storage connectivity
  - `DatabaseHealthCheck` - EF Core database connectivity

### Cross-Platform Support
- **Target Platforms**: Windows, Linux, macOS
- **Primary Development OS**: Windows
- **Primary Deployment Target**: Linux

### Scripting
- **Language**: PowerShell Core (pwsh)
- **Location**: `.claude/scripts/` folder
- **Execution**: `pwsh -ExecutionPolicy Bypass -File <script.ps1>`
- **Requirements**: Cross-platform compatibility mandatory

---

## 📦 Project Structure

```
VTTTools/
├── VttTools.slnx                    # Solution file (XML-based)
├── Source/
│   ├── Domain/                      # Domain models and contracts
│   ├── Data/                        # EF Core storage implementations
│   ├── {Area}/                      # Area-specific implementations
│   │   ├── Services/                # Business logic
│   │   ├── Handlers/                # API handlers
│   │   └── EndpointMappers/         # Endpoint configuration
│   ├── Common/                      # Shared utilities
│   │   └── HealthChecks/            # Health check implementations
│   ├── WebClientApp/                # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── store/               # Redux store
│   │   │   └── types/               # TypeScript interfaces
│   │   └── package.json
│   └── *.UnitTests/                 # Test projects
├── Documents/
│   ├── Guides/                      # Project-specific guides
│   ├── Areas/                       # Domain specifications
│   └── Features/                    # BDD feature files
└── .claude/
    ├── agents/                      # Subagent definitions
    ├── commands/                    # Slash commands
    ├── scripts/                     # PowerShell automation
    └── guides/                      # Generic guides
```

---

## 🔗 Related Documentation

- **Coding Standards**: `Documents/Guides/CODING_STANDARDS.md`
- **C# Style Guide**: `Documents/Guides/CSHARP_STYLE_GUIDE.md`
- **TypeScript Style Guide**: `Documents/Guides/TYPESCRIPT_STYLE_GUIDE.md`
- **Testing Guide**: `Documents/Guides/TESTING_GUIDE.md`
- **Theme Guide**: `Documents/Guides/THEME_GUIDE.md`
- **Implementation Guide**: `Documents/Guides/IMPLEMENTATION_GUIDE.md`
- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Common Commands**: `Documents/Guides/COMMON_COMMANDS.md`

---

## ⚠️ Critical Reminders

1. **ALWAYS** use `VttTools.slnx` for .NET build operations (NOT `VttTools.sln`)
2. **ALWAYS** support dark/light theme in frontend components
3. **ALWAYS** use primary constructors for services and storage classes
4. **ALWAYS** achieve ≥80% backend coverage and ≥70% frontend coverage
5. **ALWAYS** follow K&R brace style and file-scoped namespaces
6. **ALWAYS** include `CancellationToken ct = default` in async methods
7. **ALWAYS** validate input at service layer
8. **ALWAYS** use anemic domain models (no business logic)
