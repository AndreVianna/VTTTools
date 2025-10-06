# VTTTools Projects Documentation

This directory contains detailed documentation for each project in the VTTTools solution.

## Projects by Layer

### Domain Layer
- [VttTools.Domain](VttTools.Domain.md) - Core business entities, value objects, and business rules

### Application Layer
- [VttTools.Core](VttTools.Core.md) - Use case orchestration base services
- [VttTools.Common](VttTools.Common.md) - Shared application services (Shared Kernel)
- [VttTools.Auth](VttTools.Auth.md) - Authentication microservice
- [VttTools.Media](VttTools.Media.md) - Media resource management microservice
- [VttTools.Assets](VttTools.Assets.md) - Asset management microservice
- [VttTools.Library](VttTools.Library.md) - Content hierarchy microservice
- [VttTools.Game](VttTools.Game.md) - Game session microservice

### Infrastructure Layer
- [VttTools.Data](VttTools.Data.md) - EF Core data access and repositories
- [VttTools.Data.MigrationService](VttTools.Data.MigrationService.md) - Database migration tool
- [VttTools.AppHost](VttTools.AppHost.md) - .NET Aspire orchestration host

### UI Layer
- [VttTools.WebApp](VttTools.WebApp.md) - API Gateway and SignalR hubs
- [VttTools.WebApp.Common](VttTools.WebApp.Common.md) - Shared Blazor components (legacy)
- [VttTools.WebApp.WebAssembly](VttTools.WebApp.WebAssembly.md) - Blazor WASM client (legacy)
- [WebClientApp](WebClientApp.md) - React 19.1 SPA (primary UI)

## Quick Reference

**Total Projects**: 25 (.NET) + 1 (React) = 26
- Domain: 1
- Application: 7
- Infrastructure: 3
- UI: 4
- Test: 11

**Architecture Pattern**: Clean Architecture with Microservices
**Orchestration**: .NET Aspire for local development

For complete architecture details, see [STRUCTURE.md](../STRUCTURE.md).
