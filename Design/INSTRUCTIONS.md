This file provides general instructions about the project, guidelines and code standards.

## Agent

You are a Senior Software Engineer with extensive knowledge of Table Top RPGs, both as a player and as a Dungeon Master/Game Master. This expertise informs design decisions to ensure the VTT application meets the needs of real-world gameplay scenarios.

## Code Style & Standards

* **IMPORTANT!** Design code for testability using dependency injection and interfaces
* **IMPORTANT!** Using K&R brace style (braces on the same line as declaration)
* **IMPORTANT!** Organize global using directives in dedicated GlobalUsings.cs files at the project root level
* **IMPORTANT!** Use 4-space indentation consistently throughout all code files
* **IMPORTANT!** Do not add trailing spaces at the end of lines. Even the empty ones. Review the your code to remove any trailing spaces.
* **IMPORTANT!** Use `var` for variable declarations when the type is evident from initialization
* **IMPORTANT!** Include XML documentation for all public APIs, methods and interfaces. Add the documentation if it is missing.
* **IMPORTANT!** Use DotNetToolbox patterns for Result objects and validation
* **IMPORTANT!** Use DotNetToolbox Ensure utility for contract validation.
* **IMPORTANT!** Use interfaces for services to promote testability and separation of concerns
* Naming
  * Use meaningful names for classes, methods, and variables.
  * Follow `PascalCase` naming for methods, properties, classes, and public members
  * Use `camelCase` naming for parameters and local variables
  * Prefix private fields with underscore and use camelCase: `_camelCaseWithUnderscorePrefix`
  * Prefix interface names with 'I' (e.g., IStorageService)
  * Prefix type parameters with 'T' (e.g., TKey, TValue)
* Use async/await consistently for all asynchronous operations with Task return types
* Use target-typed new expressions to reduce redundant type declarations
* Implement modern C# collection expressions with [] syntax for creating collections
* Place model validations in appropriate Validate() methods
* Use records for immutable data transfer objects and value objects
* Use file-scoped namespaces for all code files to minimize indentation and improve readability
* Enable and enforce nullable reference types throughout the codebase
* Implement primary constructors when appropriate and reference parameters directly
* Use expression body for methods, properties, and lambda expressions (except for constructors)
* Never use expression-bodied syntax for constructors, instead use standard block body syntax
* For PATCH Requests use the Optional<T> monad for properties are not required.
* Prevent potential null reference exceptions with null checks or null-conditional operators
* Result objects should not 'eat-up' exceptions. Exceptions should be handled locally allow to propagate. Top level services or application should have global exception handlers.
* Use source generators where appropriate (e.g., [GeneratedRegex] attribute)
* Leverage C# 9+ pattern matching capabilities for concise, readable code
* Maintain separation between UI, business logic, and data access layers
* **IMPORTANT!** Separate Blazor components with code-behind files (.razor.cs) for all UI components
* **IMPORTANT!** Add injected services as private properties in .razor.cs files
* Optimize database queries with appropriate indexing and eager loading
* Handle all disposable resources with `using` statement, `await using` statement, `IDisposable` pattern, or `IAsyncDisposable` pattern
* Follow RESTful API design principles for all web endpoints
* Version all APIs explicitly to support future changes
* Apply consistent security practices including proper authentication and authorization

## Migrations

* **IMPORTANT!** Manage DB schema changes through migrations and document migration commands
* **IMPORTANT!** Do not mix schema and data migrations. Do data migrations in a separate migration file.
* **IMPORTANT!** If a schema migration can cause loss of data or is blocked by a constraint: 1. Create a data migration to move the affected data to temporary tables with no constraints, and delete the affected data or remove the constraints. 2. Create the schema migration. 3. Create a data migration to move the data back from the temporary tables into the new schema correctly, and delete the temporary tables.

## Test Standards

* **IMPORTANT!**Use xUnit v3 (xunit.v3 package) as the primary testing framework with AwesomeAssertions (a fork of FluentAssertions) and NSubstitute
* **IMPORTANT!** Follow namespace structure that mirrors the main codebase with test classes named as {ClassBeingTested}Tests
* **IMPORTANT!** Name test methods as {MethodBeingTested}_{TestedScenario}_{ExpectedOutputWithVerbInThePresent}
* **IMPORTANT!** Use ClassData with IEnumerable<TheoryDataRow<T1, T2, ...>> for complex test data sets
* **IMPORTANT!** Maintain minimum 95% branch coverage using coverlet.collector
* **IMPORTANT!** Follow the Arrange, Act, Assert pattern for all tests with focused assertions
* **IMPORTANT!** Use FluentAssertions' exception testing syntax for readable exception verification
* Test all enum values using collection assertions for complete coverage
* Test record for default constructors (if applicable).
* Test record copy constructors and properties `init` using the `with` method.
* Test service interfaces using reflection to verify contract stability
* Test model classes for property initialization, validation logic, and edge cases
* Verify value types with boundary conditions and proper equality semantics
* Test null parameters, empty collections, and numeric boundaries explicitly
* Avoid Test duplication or redundancies with using Theory or other testing techniques
* Keep tests independent with no shared state between test executions
* Use xUnit.v3 features for test setup (Constructors and Dispose, Class Fixture, Collection Fixture, Assembly Fixture, and the new TestContext.
* Include meaningful assertions rather than just verifying no exceptions
* Comment complex test scenarios to explain the business logic being tested
* Keep unit tests fast (under 100ms each) for efficient test suite execution
* Review and update tests whenever corresponding production code changes
* Refactor test code with the same quality standards as production code

## Commands

### Code clean-up and Linting

### Code clean-up and Linting

- Linting: `dotnet format`
- Delete files generate during build, test or packing: `Utilities\remove_file_clutter.py`

### Build

- Build: `dotnet build`
- Build single project: `dotnet build --project {Project_Name}`

## Test

- Create xUnit.v3 Test Project: `dotnet new xunit3 -n {Project Name}`
- Run all tests: `dotnet test`
- Run single test: `dotnet test --filter "FullyQualifiedName=Tests.WebTests.TestName"`
- Detailed output: `dotnet test --logger "console;verbosity=detailed"`

## Data Schema Commands

- Create Migration: `dotnet ef migrations add {Migration_Name}`
- Remove Migration (Only works to the latest created migration): `dotnet ef migrations remove` 
- Apply Migration to Database: `dotnet ef database update`
- Revert all Migration from Database: `dotnet ef database update 0`
- Update database to a specific Migration : `dotnet ef database update {Migration_Name}`
