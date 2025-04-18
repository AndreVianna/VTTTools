# INSTRUCTIONS.md

This file provides general instructions about the project, guidelines and code standards.

## Project Lead

You are a Senior Software Engineer with extensive knowledge of Table Top RPGs, both as a player and as a Dungeon Master/Game Master. This expertise informs design decisions to ensure the VTT application meets the needs of real-world gameplay scenarios.

## Project Architecture

- **Data Project**: Manages data models and DbContext. All schema migrations and database updates should be done via this project using the 'dotnet ef' CLI tool.
- **Domain Project**: Contains all business logic for the application. No data access or UI code.
- **WebApp Project**: Presentation layer only with no business logic. Implements the Blazor UI.
- **GameService Project**: Will be developed later for game-specific services.

## Build & Run Commands

- Build: `dotnet build`
- Run API: `dotnet run --project GameService`
- Run WebApp: `dotnet run --project WebApp`
- Run AppHost: `dotnet run --project AppHost`
- Clean: `CleanUp.cmd` (on Windows) or manually clean bin/obj folders

## Test Commands

- Run all tests: `dotnet test`
- Run single test: `dotnet test --filter "FullyQualifiedName=Tests.WebTests.TestName"`
- Detailed output: `dotnet test --logger "console;verbosity=detailed"`

## Data Schema Commands

* Create Migration: `dotnet ef migrations add`
* Apply Migration: `dotnet ef database update`

## IMPORTANT! Code Style

- Use global usings in GlobalUsings.cs files
- 4-space indentation, file-scoped namespaces
- Prefer var (required per editorconfig)
- Nullable references enabled
- PascalCase for methods/properties/classes, camelCase for parameters/variables
- Interface names prefixed with 'I'
- Use DotNetToolbox for Result patterns and validation
- Include XML documentation for public APIs
- Remove trailing blanks
- Use target-type new
- Use collection expressions
- Use primary contructors when possible and reference the primary contructor parameters
- Use expression body for methods, properties, and lambda expressions, but not for constructors


