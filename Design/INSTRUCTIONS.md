# INSTRUCTIONS.md

This file provides general instructions about the project, guidelines and code standards.

## Agent

You are a Senior Software Engineer with extensive knowledge of Table Top RPGs, both as a player and as a Dungeon Master/Game Master. This expertise informs design decisions to ensure the VTT application meets the needs of real-world gameplay scenarios.

## Code Style & Standards **IMPORTANT!**

* Use file-scoped namespaces for all code files to minimize indentation and improve readability
* Organize global using directives in dedicated GlobalUsings.cs files at the project root level
* Use 4-space indentation consistently throughout all code files
* Remove trailing whitespace between lines and at the end of lines
* Use K&R code style.
* Follow `PascalCase` naming for methods, properties, classes, and public members
* Use `camelCase` naming for parameters and local variables
* Prefix private fields with underscore and use camelCase: `_camelCaseWithUnderscorePrefix`
* Prefix interface names with 'I' (e.g., IStorageService)
* Prefix type parameters with 'T' (e.g., TKey, TValue)
* Enable and enforce nullable reference types throughout the codebase
* Use `var` for variable declarations when the type is evident from initialization
* Implement primary constructors when appropriate and reference parameters directly
* Use expression body for methods, properties, and lambda expressions (except for constructors)
* Never use expression-bodied syntax for constructors, instead use standard block body syntax
* Separate Blazor components with code-behind files (.razor.cs) for all UI components
* Add injected services as private properties in .razor.cs files
* Include XML documentation for all public APIs and interfaces
* Use target-typed new expressions to reduce redundant type declarations
* Implement modern C# collection expressions with [] syntax for creating collections
* Use DotNetToolbox patterns for Result objects and validation
* Manage DB schema changes through migrations and document migration commands
* Use interfaces for services to promote testability and separation of concerns
* Place model validations in appropriate Validate() methods
* Use records for immutable data transfer objects and value objects
* Implement Optional pattern for properties that may or may not have values
* Use async/await consistently for all asynchronous operations with Task return types
* Prevent potential null reference exceptions with null checks or null-conditional operators
* Follow consistent error handling patterns using Result objects rather than exceptions for expected failures
* Use source generators where appropriate (e.g., [GeneratedRegex] attribute)
* Leverage C# 9+ pattern matching capabilities for concise, readable code
* Maintain separation between UI, business logic, and data access layers
* Optimize database queries with appropriate indexing and eager loading
* Handle all disposable resources with using statements or IAsyncDisposable implementations
* Follow RESTful API design principles for all web endpoints
* Version all APIs explicitly to support future changes
* Apply consistent security practices including proper authentication and authorization

## Build & Run Commands

- Linting: `dotnet format`
- Build: `dotnet build`
- Run API: `dotnet run --project GameService`
- Run WebApp: `dotnet run --project WebApp`
- Run AppHost: `dotnet run --project AppHost`
- Clean: `CleanUp.cmd` (on Windows) or manually clean bin/obj folders

## Test Standards **IMPORTANT!**

* Use xUnit v3 (xunit.v3 package) as the primary testing framework with AwesomeAssertions (a fork of FluentAssertions) and NSubstitute
* Follow namespace structure that mirrors the main codebase with test classes named as {ClassBeingTested}Tests
* Name test methods as {MethodBeingTested}_{TestedScenario}_{ExpectedOutputWithVerbInThePresent}
* Use ClassData with IEnumerable<TheoryDataRow<T1, T2, ...>> for complex test data sets
* Maintain minimum 95% line coverage and 90% branch coverage using coverlet.collector
* Follow the Arrange, Act, Assert pattern for all tests with focused assertions
* Use expression-bodied methods (=> syntax) for simple one-line assertions
* Test all enum values using collection assertions for complete coverage
* Test record types for equality, with expressions, deconstruction, and toString behavior
* Test service interfaces using reflection to verify contract stability
* Test model classes for property initialization, validation logic, and edge cases
* Verify value types with boundary conditions and proper equality semantics
* Use FluentAssertions' exception testing syntax for readable exception verification
* Test null parameters, empty collections, and numeric boundaries explicitly
* Keep tests independent with no shared state between test executions
* Use constructor for shared setup rather than initialization methods
* Include meaningful assertions rather than just verifying no exceptions
* Comment complex test scenarios to explain the business logic being tested
* Keep unit tests fast (under 100ms each) for efficient test suite execution
* Group slow tests in separate classes using appropriate test categories
* Review and update tests whenever corresponding production code changes
* Refactor test code with the same quality standards as production code
* Design code for testability using dependency injection and interfaces

## Test Commands

- Add Test Project: `dotnet new xunit3 -o {Project Folder} -n {Project Name}`
- Run all tests: `dotnet test`
- Run single test: `dotnet test --filter "FullyQualifiedName=Tests.WebTests.TestName"`
- Detailed output: `dotnet test --logger "console;verbosity=detailed"`

## Data Schema Commands

* Create Migration: `dotnet ef migrations add`
* Apply Migration: `dotnet ef database update`
