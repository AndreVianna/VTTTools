# VTT Tools Data Migration Service Unit Tests

This project contains comprehensive unit tests for the VTT Tools Data Migration Service.

## Project Structure

```
Data.MigrationService.UnitTests/
├── VttTools.Data.MigrationService.UnitTests.csproj  # Test project configuration
├── GlobalUsings.cs                                  # Global using directives
├── xunit.runner.json                               # xUnit configuration
├── WorkerTests.cs                                   # Tests for Worker class
├── ProgramTests.cs                                  # Tests for Program class
└── README.md                                        # This file
```

## Test Framework and Dependencies

- **xUnit v3**: Primary testing framework with both v2.9.3 (Debug) and v3 (Release/XUnitV3) support
- **AwesomeAssertions**: Fluent assertion library (fork of FluentAssertions)
- **NSubstitute**: Mocking framework for creating test doubles
- **Entity Framework InMemory**: In-memory database provider for testing
- **Coverlet**: Code coverage analysis

## Current Status

### ✅ Completed
1. **Project Structure**: Created complete test project with proper configuration
2. **Solution Integration**: Added to VttTools.sln under Data.MigrationService folder
3. **Package References**: Configured with same versions as other test projects
4. **Project References**: References to Data and Data.MigrationService projects
5. **Placeholder Tests**: 32 comprehensive placeholder tests that all pass
6. **Build Integration**: Builds successfully with the solution

### 🚧 Placeholder Tests (To Be Implemented)

#### WorkerTests.cs (19 tests)
- **Constructor Tests**:
  - `Constructor_WithValidLogger_ShouldCreateInstance`
  - `Constructor_WithNullLogger_ShouldThrowArgumentNullException`

- **Migration Execution Tests**:
  - `StartAsync_WithValidConfiguration_ShouldRunMigrations`
  - `StartAsync_WithDatabaseConnectionFailure_ShouldLogError`
  - `StartAsync_WithMultipleAttempts_ShouldRetryOnFailure`
  - `StartAsync_WithDatabaseMigrationSuccess_ShouldCompleteWithoutException`
  - `StartAsync_WithLongRunningMigration_ShouldHandleTimeoutGracefully`

- **Lifecycle Management Tests**:
  - `StartAsync_WithCancellation_ShouldStopGracefully`
  - `StopAsync_ShouldCompleteGracefully`
  - `StopAsync_WithTimeout_ShouldCompleteWithinTimeLimit`

- **Activity Tracing Tests**:
  - `StartAsync_ShouldCreateActivityWithCorrectName`
  - `StartAsync_OnSuccess_ShouldSetActivityStatusOk`
  - `StartAsync_OnError_ShouldSetActivityStatusError`

- **Logging Tests**:
  - `StartAsync_ShouldLogExpectedMessages` (Theory with 3 test cases)

#### ProgramTests.cs (13 tests)
- **Host Builder Configuration**:
  - `CreateHostBuilder_WithValidArguments_ShouldReturnHostBuilder`
  - `CreateHostBuilder_ShouldRegisterRequiredServices`
  - `CreateHostBuilder_ShouldConfigureLogging`
  - `CreateHostBuilder_ShouldConfigureEntityFramework`
  - `CreateHostBuilder_ShouldConfigureActivitySource`
  - `CreateHostBuilder_ShouldRegisterWorkerAsHostedService`
  - `CreateHostBuilder_ShouldConfigureHealthChecks`

- **Environment and Configuration**:
  - `CreateHostBuilder_ShouldConfigureEnvironment`
  - `CreateHostBuilder_ShouldLoadConfiguration`
  - `CreateHostBuilder_WithDifferentEnvironments_ShouldConfigureCorrectly` (Theory with 3 test cases)

- **Application Lifecycle**:
  - `Main_WithValidArguments_ShouldRunSuccessfully`
  - `HostLifetime_ShouldStartAndStopCorrectly`

- **Service Management**:
  - `CreateHostBuilder_ShouldDisposeServicesCorrectly`
  - `CreateHostBuilder_ShouldResolveScopedServices`

## Implementation Guidelines

### When Migration Service is Created
1. **Update Global Usings**: Add `global using VttTools.Data.MigrationService;` back
2. **Replace Placeholder Tests**: Implement actual test logic for each placeholder
3. **Add Comprehensive Mocking**: Use NSubstitute for database, logger, and service mocks
4. **Implement Activity Listener**: Create proper ActivityListener for testing telemetry
5. **Add Real Assertions**: Replace `Assert.True(true)` with meaningful assertions

### Test Implementation Patterns
```csharp
// Example implementation structure
[Fact]
public async Task StartAsync_WithValidConfiguration_ShouldRunMigrations()
{
    // Arrange
    var mockLogger = Substitute.For<ILogger<Worker>>();
    using var scope = _serviceProvider.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var worker = new Worker(mockLogger);
    
    // Act
    var result = await worker.StartAsync(CancellationToken.None);
    
    // Assert
    result.Should().BeSuccessful();
    // Add specific assertions for migration completion
}
```

### Coverage Requirements
- **Target**: 95% branch coverage (per project standards)
- **Focus Areas**: 
  - All public methods and properties
  - Error handling paths
  - Cancellation scenarios
  - Configuration variations
  - Activity tracing
  - Logging verification

## Running Tests

```bash
# Build tests
dotnet build Data.MigrationService.UnitTests/VttTools.Data.MigrationService.UnitTests.csproj

# Run all tests
dotnet test Data.MigrationService.UnitTests/VttTools.Data.MigrationService.UnitTests.csproj

# Run with coverage (when implemented)
dotnet test Data.MigrationService.UnitTests/VttTools.Data.MigrationService.UnitTests.csproj --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "WorkerTests.StartAsync_WithValidConfiguration_ShouldRunMigrations"
```

## Notes

- All placeholder tests currently pass with `Assert.True(true)`
- Test structure follows project naming conventions: `{MethodBeingTested}_{TestedScenario}_{ExpectedOutputWithVerbInThePresent}`
- Ready for immediate implementation once Worker and Program classes are available
- Comprehensive error handling and edge case coverage planned
- Integration with solution-wide testing infrastructure complete