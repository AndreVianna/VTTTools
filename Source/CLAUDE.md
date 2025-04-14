# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Code Style
- Use global usings in GlobalUsings.cs files
- 4-space indentation, file-scoped namespaces
- Prefer var (required per editorconfig)
- Nullable references enabled
- PascalCase for methods/properties/classes, camelCase for parameters/variables
- Interface names prefixed with 'I'
- Use DotNetToolbox for Result patterns and validation
- Include XML documentation for public APIs