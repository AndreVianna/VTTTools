# EPIC-008: Domain Layer Infrastructure Isolation

## Quick Overview

| Property | Value |
|----------|-------|
| **Type** | Epic (Architecture Refactoring) |
| **Status** | Planned |
| **Priority** | High |
| **Effort** | 16-24 hours (2-3 days) |
| **Created** | 2025-12-30 |

## Purpose

Isolate the Domain layer from infrastructure dependencies while maintaining full functionality of EF Core Identity and Azure Cloud services. This follows Clean Architecture principles where the Domain layer should have zero infrastructure dependencies.

### Current Problems

1. **Identity Models in Domain** inherit from EF Core Identity classes (`IdentityUser<Guid>`, etc.)
2. **Global EF Core using** in Library layer exposes infrastructure types to services
3. **Azure SDK in Health Checks** bypasses the existing `IBlobStorage` abstraction
4. **Infrastructure packages** in service layer project

### Target Architecture

```
Domain Layer (Zero Infrastructure Dependencies)
├── Pure Identity Models (POCOs/Records)
├── Service Interfaces (IIdentityService, IStageService)
├── Storage Interfaces (IUserStorage, IStageStorage)
└── API Contracts (DTOs)

Data Layer (EF Core Implementation)
├── EF Identity Entities (internal)
├── Storage Implementations
├── Entity-to-Domain Mappers
└── ApplicationDbContext

Media Layer (Azure Implementation)
├── AzureBlobStorage : IBlobStorage
└── Cloud-specific implementations
```

## Key Deliverables

1. **Pure Domain Identity Models** - POCO/Record classes without EF Core dependencies
2. **Identity Storage Interface** - `IUserStorage` contract in Domain layer
3. **EF Identity Implementation** - Data layer entities + mappers
4. **Clean Library Project** - Remove global EF Core using
5. **Abstract Health Checks** - Use `IBlobStorage` instead of direct Azure SDK

## Benefits

- **Testability** - Mock storage interfaces without EF Core
- **Flexibility** - Swap EF Identity for Auth0/Cognito later
- **Clean Domain** - No infrastructure polluting business logic
- **Maintainability** - Clear separation of concerns

## Documentation

- [TASK.md](./TASK.md) - Detailed specification and acceptance criteria
- [ROADMAP.md](./ROADMAP.md) - Implementation phases and progress

## Dependencies

- **EPIC-007** (PostgreSQL Migration) - Completed, provides current database infrastructure
- Existing storage interface pattern in `Source/Domain/*/Storage/`

## Related Analysis

This epic was created based on a comprehensive Service Layer Infrastructure Isolation Analysis that identified:

| Category | Current Grade | Target Grade |
|----------|:-------------:|:------------:|
| Database Isolation | D | A |
| Cloud Isolation | C | A |
| FileSystem Isolation | A | A |
| External Services | A | A |
| **Overall** | **C** | **A** |
