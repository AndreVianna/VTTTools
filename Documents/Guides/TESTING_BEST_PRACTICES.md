# VTT Tools Testing Best Practices

## Overview

This guide provides comprehensive testing procedures for VTT Tools development based on Phase 1 testing experiences. These practices ensure reliable, efficient testing across all development phases while preventing common issues and maintaining high code quality.

## Core Testing Principles

### 1. Incremental Testing Philosophy
- **Test after every small change** - Don't batch multiple changes before testing
- **Validate service health before proceeding** - Ensure infrastructure is solid before testing features
- **Use appropriate tools for different scenarios** - Match testing tools to the specific requirements

### 2. Test-As-You-Go Approach
```bash
# Recommended workflow for any change:
1. Make small, focused change
2. Validate service health
3. Run relevant tests
4. Verify functionality
5. Only then proceed to next change
```

### 3. Service Health First
Always verify infrastructure health before feature testing:
- Aspire dashboard shows all services healthy
- Database connectivity confirmed
- Service discovery working correctly
- Authentication flow functional

## Testing Strategy Overview

### Unit Testing vs Integration Testing vs End-to-End Testing

**CRITICAL DISTINCTION:** Understanding when to use each testing approach is essential for efficient and reliable testing.

#### Unit Testing
**Purpose:** Test individual components in isolation with all dependencies mocked
**Speed:** Fast (< 100ms per test)
**Scope:** Single class/function/component
**Dependencies:** All external dependencies mocked
**Best For:**
- Business logic validation
- Edge case handling
- Error condition testing
- Regression prevention
- Code coverage requirements

#### Integration Testing
**Purpose:** Test component interaction and data flow across boundaries
**Speed:** Medium (< 2 seconds per test)
**Scope:** Multiple components working together
**Dependencies:** Real implementations within test boundaries, mocked at system edges
**Best For:**
- Service-to-service communication
- Database operations with real data
- Authentication flows with real identity services
- API contract validation
- Configuration and dependency injection testing

#### End-to-End Testing
**Purpose:** Test complete user workflows through the entire system
**Speed:** Slow (10+ seconds per test)
**Scope:** Full application stack
**Dependencies:** Real system with real external services (or high-fidelity mocks)
**Best For:**
- User acceptance scenarios
- Cross-browser compatibility
- Visual UI validation
- Complete business workflows
- Performance under realistic load

## Testing Tool Selection Matrix

### When to Use Unit Tests (xUnit + NSubstitute)
**Framework:** xUnit v3 with NSubstitute for mocking
**Best For:**
- Individual component logic testing
- Business rule validation with mocked dependencies
- Edge case and error condition handling
- Fast feedback during development
- Regression prevention with high code coverage

**Example Use Cases:**
```csharp
// Auth service unit testing with mocked dependencies
[Test]
public async Task LoginAsync_ValidCredentials_ReturnsSuccessResult()
{
    // Arrange
    var mockUserManager = Substitute.For<IUserManager>();
    var mockSignInManager = Substitute.For<ISignInManager>();
    mockSignInManager.PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), false, false)
        .Returns(SignInResult.Success);

    var authService = new AuthService(mockUserManager, mockSignInManager);

    // Act
    var result = await authService.LoginAsync("test@example.com", "ValidPassword123!");

    // Assert
    Assert.True(result.IsSuccess);
}
```

### When to Use Integration Tests
**Framework:** xUnit v3 with TestContainer or in-memory databases
**Best For:**
- Service-to-database integration
- Service-to-service communication within Aspire
- Authentication flow with real identity providers
- API endpoint testing with real data persistence
- Service discovery and configuration validation

**Example Use Cases:**
```csharp
// Auth integration testing with real database
[Collection("Integration")]
public class AuthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    [Test]
    public async Task RegisterUser_ValidData_PersistsToDatabase()
    {
        // Arrange - using real ApplicationDbContext
        var client = _factory.CreateClient();
        var request = new RegisterRequest
        {
            Email = "newuser@example.com",
            Password = "SecurePassword123!"
        };

        // Act - real HTTP call through entire Auth service
        var response = await client.PostAsJsonAsync("/api/auth/register", request);

        // Assert - verify database state
        response.EnsureSuccessStatusCode();
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        Assert.NotNull(user);
    }
}
```

### When to Use React Testing Library
**Framework:** React Testing Library with Jest
**Best For:**
- Component behavior testing
- User interaction simulation
- Accessibility testing
- Component integration with React hooks and context
- Frontend business logic validation

**Example Use Cases:**
```typescript
// React component integration testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../contexts/AuthContext';

test('LoginForm submits valid credentials and shows success', async () => {
  // Arrange
  const mockLogin = jest.fn().mockResolvedValue({ success: true });
  render(
    <AuthProvider>
      <LoginForm onLogin={mockLogin} />
    </AuthProvider>
  );

  // Act
  await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // Assert
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
  });
  expect(screen.getByText(/login successful/i)).toBeInTheDocument();
});
```

### When to Use Playwright MCP
**Best For:**
- End-to-end user workflows
- UI interaction testing with real browser
- Visual validation of canvas/scene builder
- Cross-browser compatibility testing
- User acceptance testing scenarios

**Example Use Cases:**
```typescript
// Complete user workflow testing
- User registration → Login → Create Adventure → Build Scene → Save
- Authentication flows with UI feedback
- Canvas manipulation and visual verification
- Error message display and user guidance
```

### When to Use HTTP Clients (cURL/REST Client)
**Best For:**
- Backend API functionality testing
- Service integration testing
- Authentication endpoint validation
- Data contract verification
- Performance and load testing

**Example Use Cases:**
```bash
# Direct API testing
curl -X POST "/api/auth/login" -d '{"email":"test@example.com","password":"test123"}'
curl -X GET "/api/adventures" -H "Authorization: Bearer <token>"
curl -X POST "/api/scenes" -d '{"name":"Test Scene","adventureId":"123"}'
```

## Step-by-Step Testing Procedures

### Phase Setup Testing
```bash
# 1. Clean Environment Start
./vtttools.sh --cleanup
# or
dotnet run --project Source/AppHost

# 2. Verify Infrastructure Health
# Check Aspire Dashboard: https://localhost:17086
# Ensure all services show "Healthy" status

# 3. Validate Core Services
curl https://localhost:7001/health  # Assets
curl https://localhost:7002/health  # Game
curl https://localhost:7003/health  # Library
curl https://localhost:7004/health  # Media
curl https://localhost:7005/health  # WebApp

# 4. Confirm Database Connectivity
# Check Migration Service logs in Aspire Dashboard
# Verify no connection errors in service logs
```

### Authentication System Testing
```bash
# 1. Test Basic Authentication Endpoints
# Login endpoint
curl -X POST "/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPassword123!"}'

# Current user endpoint
curl -X GET "/api/auth/me" \
  -H "Cookie: .AspNetCore.Identity.Application=<session-cookie>"

# Logout endpoint
curl -X POST "/api/auth/logout" \
  -H "Cookie: .AspNetCore.Identity.Application=<session-cookie>"

# 2. Validate UI Authentication Flow (Playwright)
- Navigate to login page
- Enter valid credentials
- Verify redirect to dashboard
- Confirm user session established
- Test logout functionality
```

### Service Integration Testing
```bash
# 1. Test Service Discovery
# Verify React app can reach microservices through Vite proxy
curl -X GET "http://localhost:5173/api/assets"      # Proxied to assets-api
curl -X GET "http://localhost:5173/api/adventures"  # Proxied to library-api
curl -X GET "http://localhost:5173/api/sessions"    # Proxied to game-api

# 2. Test Cross-Service Communication
# Create adventure via Library API
curl -X POST "/api/adventures" -d '{"name":"Test Adventure","description":"Test","type":"OneShot"}'

# Upload asset via Media API
curl -X POST "/api/media/upload" -F "file=@test-image.png"

# Link asset to adventure via Library API
curl -X POST "/api/adventures/{id}/assets" -d '{"assetId":"<asset-id>"}'
```

### Canvas/Scene Builder Testing
```typescript
// Use Playwright for visual and interaction testing
await page.goto('/scenes/builder');

// Test canvas initialization
await page.waitForSelector('[data-testid="konva-stage"]');
expect(await page.locator('[data-testid="konva-stage"]').isVisible()).toBe(true);

// Test asset placement
await page.click('[data-testid="add-asset-button"]');
await page.click('[data-testid="canvas"]', { position: { x: 100, y: 100 } });

// Verify asset appears at correct position
const assetElement = page.locator('[data-testid="canvas-asset"]');
await expect(assetElement).toBeVisible();

// Test zoom and pan functionality
await page.mouse.wheel(0, -120); // Zoom in
await page.mouse.move(200, 200);
await page.mouse.down({ button: 'right' });
await page.mouse.move(250, 250); // Pan
await page.mouse.up({ button: 'right' });
```

## Error Diagnosis Procedures

### Service Health Issues
```bash
# 1. Check Aspire Dashboard Service Status
# Navigate to: https://localhost:17086
# Look for services marked as "Unhealthy" or "Starting"

# 2. Review Service Logs
# In Aspire Dashboard, click on problematic service
# Check logs for connection errors, startup failures, or exceptions

# 3. Validate Dependencies
# Ensure SQL Server, Redis, and Storage services are running
# Check Docker containers: docker ps
# Verify database migrations completed successfully
```

### Authentication Issues
```bash
# 1. Check WebApp Service Status
# Verify WebApp shows "Healthy" in Aspire Dashboard
# Check for Identity-related errors in WebApp logs

# 2. Validate Cookie Configuration
# Check browser developer tools → Application → Cookies
# Ensure .AspNetCore.Identity.Application cookie exists
# Verify cookie domain and path settings

# 3. Test Direct Authentication
# Bypass React app and test WebApp Identity directly
curl -X POST "https://localhost:{webapp-port}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Service Discovery Issues
```bash
# 1. Check Vite Proxy Configuration
# In React app vite.config.ts, verify proxy settings:
proxy: {
  '/api/assets': 'https+http://assets-api',
  '/api/adventures': 'https+http://library-api',
  // etc.
}

# 2. Verify Service Names in Aspire
# Check Source/AppHost/Program.cs for service registration names
# Ensure Vite proxy targets match Aspire service names

# 3. Test Direct Service Access
# Use actual service URLs from Aspire Dashboard
curl -X GET "https://localhost:{actual-port}/api/assets"
```

### Database Connection Issues
```bash
# 1. Check SQL Server Container
docker ps | grep sql
docker logs <sql-container-id>

# 2. Verify Migration Service Execution
# Check Migration Service logs in Aspire Dashboard
# Look for successful migration application messages

# 3. Test Database Connectivity
# Use connection string from appsettings.json or user secrets
sqlcmd -S "localhost,1433" -d "VttToolsDb" -U "sa" -P "<password>"
```

## Performance Testing Guidelines

### Canvas Performance Testing
```typescript
// Measure frame rate with multiple assets
const measureFPS = async (page: Page, assetCount: number) => {
  // Add specified number of assets
  for (let i = 0; i < assetCount; i++) {
    await page.click('[data-testid="add-asset-button"]');
  }

  // Measure frame rate
  const fps = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let frames = 0;
      const start = performance.now();

      function countFrames() {
        frames++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          resolve(frames);
        }
      }
      requestAnimationFrame(countFrames);
    });
  });

  expect(fps).toBeGreaterThan(50); // 50fps minimum requirement
};
```

### API Response Time Testing
```bash
# Measure API response times
time curl -X GET "/api/adventures"
time curl -X POST "/api/adventures" -d '{"name":"Test","description":"Test","type":"OneShot"}'

# Performance requirements:
# - CRUD operations: < 2 seconds
# - File uploads: < 5 seconds
# - Simple queries: < 500ms
```

## Test Data Management

### Test User Accounts
```bash
# Create consistent test users for development
# In appsettings.Development.json or user secrets:
{
  "TestUsers": [
    {
      "Email": "gamemaster@test.com",
      "Password": "GameMaster123!",
      "Role": "GameMaster"
    },
    {
      "Email": "player@test.com",
      "Password": "Player123!",
      "Role": "Player"
    }
  ]
}
```

### Test Data Seeding
```csharp
// In test environment, seed consistent test data
public static class TestDataSeeder
{
    public static void SeedTestData(ApplicationDbContext context)
    {
        // Create test adventures
        var testAdventure = new Adventure
        {
            Name = "Test Adventure",
            Description = "Adventure for testing purposes",
            Type = AdventureType.OneShot
        };
        context.Adventures.Add(testAdventure);

        // Create test assets
        var testAsset = new Asset
        {
            Name = "Test Token",
            Type = AssetType.Character,
            Description = "Character token for testing"
        };
        context.Assets.Add(testAsset);

        context.SaveChanges();
    }
}
```

## Continuous Testing Practices

### Pre-Commit Testing
```bash
# Run before committing any changes
dotnet test                    # Unit tests
npm run test                   # Frontend unit tests
npm run lint                   # Code quality checks
dotnet format --verify-no-changes  # Code formatting

# For major changes, also run:
npm run test:e2e              # End-to-end tests
./vtttools.sh test --rebuild  # Full solution test with coverage
```

### Development Cycle Testing
```bash
# After implementing new feature:
1. Unit tests for new components
2. Integration tests for API endpoints
3. UI tests for new user interactions
4. Performance tests for performance-critical features
5. End-to-end workflow tests

# Before moving to next phase:
1. Full regression test suite
2. Performance benchmark comparison
3. Security vulnerability scanning
4. Accessibility compliance testing
```

## Testing Environment Management

### Development Environment Reset
```bash
# When environment becomes unstable:
1. Stop all services: Ctrl+C in Aspire terminal
2. Clean containers: docker system prune -f
3. Remove volumes: docker volume prune -f
4. Clear build artifacts: dotnet clean
5. Rebuild and restart: ./vtttools.sh --rebuild
```

### Test Environment Isolation
```bash
# Ensure tests don't interfere with each other:
1. Use separate test database per test run
2. Clear browser state between UI tests
3. Reset Redis cache for integration tests
4. Use unique test data identifiers
```

## Comprehensive Testing Implementation Patterns

### Unit Testing Implementation Patterns

#### xUnit v3 + NSubstitute Pattern (C# Services)

**Project Setup:**
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="3.0.0-beta.1" />
    <PackageReference Include="xunit.runner.visualstudio" Version="3.0.0-beta.1" />
    <PackageReference Include="NSubstitute" Version="5.1.0" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
  </ItemGroup>
</Project>
```

**Service Class Under Test Example:**
```csharp
public class AuthService
{
    private readonly IUserManager _userManager;
    private readonly ISignInManager _signInManager;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserManager userManager, ISignInManager signInManager, ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        try
        {
            var result = await _signInManager.PasswordSignInAsync(email, password, false, false);
            return result.Succeeded ? AuthResult.Success() : AuthResult.Failure("Invalid credentials");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for {Email}", email);
            return AuthResult.Failure("Login failed");
        }
    }
}
```

**Complete Unit Test Implementation:**
```csharp
public class AuthServiceTests
{
    private readonly IUserManager _mockUserManager;
    private readonly ISignInManager _mockSignInManager;
    private readonly ILogger<AuthService> _mockLogger;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockUserManager = Substitute.For<IUserManager>();
        _mockSignInManager = Substitute.For<ISignInManager>();
        _mockLogger = Substitute.For<ILogger<AuthService>>();
        _authService = new AuthService(_mockUserManager, _mockSignInManager, _mockLogger);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsSuccess()
    {
        // Arrange
        var email = "test@example.com";
        var password = "ValidPassword123!";
        _mockSignInManager.PasswordSignInAsync(email, password, false, false)
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Success);

        // Act
        var result = await _authService.LoginAsync(email, password);

        // Assert
        result.IsSuccess.Should().BeTrue();
        await _mockSignInManager.Received(1).PasswordSignInAsync(email, password, false, false);
    }

    [Fact]
    public async Task LoginAsync_InvalidCredentials_ReturnsFailure()
    {
        // Arrange
        var email = "test@example.com";
        var password = "WrongPassword";
        _mockSignInManager.PasswordSignInAsync(email, password, false, false)
            .Returns(Microsoft.AspNetCore.Identity.SignInResult.Failed);

        // Act
        var result = await _authService.LoginAsync(email, password);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Invalid credentials");
    }

    [Fact]
    public async Task LoginAsync_ExceptionThrown_ReturnsFailureAndLogsError()
    {
        // Arrange
        var email = "test@example.com";
        var password = "ValidPassword123!";
        var exception = new InvalidOperationException("Database connection failed");
        _mockSignInManager.PasswordSignInAsync(email, password, false, false)
            .Throws(exception);

        // Act
        var result = await _authService.LoginAsync(email, password);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Login failed");
        _mockLogger.Received(1).LogError(exception, "Login failed for {Email}", email);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task LoginAsync_InvalidEmail_ReturnsFailure(string email)
    {
        // Arrange
        var password = "ValidPassword123!";

        // Act
        var result = await _authService.LoginAsync(email, password);

        // Assert
        result.IsSuccess.Should().BeFalse();
        await _mockSignInManager.DidNotReceive().PasswordSignInAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<bool>());
    }
}
```

**Mocking Complex Dependencies:**
```csharp
// Database context mocking
public class AdventureServiceTests
{
    private readonly IApplicationDbContext _mockDbContext;
    private readonly ILogger<AdventureService> _mockLogger;
    private readonly AdventureService _adventureService;

    public AdventureServiceTests()
    {
        _mockDbContext = Substitute.For<IApplicationDbContext>();
        _mockLogger = Substitute.For<ILogger<AdventureService>>();
        _adventureService = new AdventureService(_mockDbContext, _mockLogger);

        // Setup DbSet mocks
        var mockAdventures = Substitute.For<DbSet<Adventure>>();
        _mockDbContext.Adventures.Returns(mockAdventures);
    }

    [Fact]
    public async Task CreateAdventureAsync_ValidData_SavesAdventure()
    {
        // Arrange
        var request = new CreateAdventureRequest
        {
            Name = "Test Adventure",
            Description = "Test Description",
            Type = AdventureType.Campaign
        };
        _mockDbContext.SaveChangesAsync().Returns(1);

        // Act
        var result = await _adventureService.CreateAdventureAsync(request);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _mockDbContext.Adventures.Received(1).Add(Arg.Is<Adventure>(a =>
            a.Name == request.Name &&
            a.Description == request.Description &&
            a.Type == request.Type));
        await _mockDbContext.Received(1).SaveChangesAsync();
    }
}
```

#### React Testing Library Pattern (Frontend Components)

**Component Under Test:**
```typescript
// LoginForm.tsx
interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      await onLogin(email, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && <div role="alert" data-testid="error-message">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

**Complete Component Test Suite:**
```typescript
// LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  test('renders form elements correctly', () => {
    render(<LoginForm onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('calls onLogin with email and password when form is submitted', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockResolvedValue(undefined);

    render(<LoginForm onLogin={mockOnLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockOnLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  test('displays error message when fields are empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={mockOnLogin} />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByTestId('error-message')).toHaveTextContent('Email and password are required');
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('displays error message when onLogin throws error', async () => {
    const user = userEvent.setup();
    mockOnLogin.mockRejectedValue(new Error('Network error'));

    render(<LoginForm onLogin={mockOnLogin} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Login failed. Please try again.');
    });
  });

  test('disables form elements when loading', () => {
    render(<LoginForm onLogin={mockOnLogin} loading={true} />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Logging in...');
  });

  test('clears error message on new submission attempt', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={mockOnLogin} />);

    // First submission - trigger error
    await user.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByTestId('error-message')).toBeInTheDocument();

    // Second submission - error should clear
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});
```

### Integration Testing Implementation Patterns

#### Aspire Service Integration Testing

**Test Project Setup for Integration Tests:**
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="3.0.0-beta.1" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
    <PackageReference Include="Testcontainers.SqlServer" Version="3.6.0" />
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\VttTools.Auth\VttTools.Auth.csproj" />
  </ItemGroup>
</Project>
```

**Integration Test Base Class:**
```csharp
public class IntegrationTestBase : IClassFixture<WebApplicationFactory<Program>>, IDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly IServiceScope Scope;
    protected readonly ApplicationDbContext DbContext;

    public IntegrationTestBase(WebApplicationFactory<Program> factory)
    {
        Factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace SQL Server with in-memory database for testing
                services.RemoveDbContext<ApplicationDbContext>();
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase($"TestDb_{Guid.NewGuid()}"));

                // Override any external services with test doubles
                services.AddScoped<IEmailService, MockEmailService>();
            });
        });

        Client = Factory.CreateClient();
        Scope = Factory.Services.CreateScope();
        DbContext = Scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure database is created and seeded
        DbContext.Database.EnsureCreated();
        SeedTestData();
    }

    private void SeedTestData()
    {
        if (!DbContext.Users.Any())
        {
            DbContext.Users.Add(new ApplicationUser
            {
                Email = "test@example.com",
                UserName = "test@example.com",
                EmailConfirmed = true
            });
            DbContext.SaveChanges();
        }
    }

    public void Dispose()
    {
        Scope?.Dispose();
        Client?.Dispose();
    }
}
```

**Complete Auth Integration Tests:**
```csharp
[Collection("Integration")]
public class AuthIntegrationTests : IntegrationTestBase
{
    public AuthIntegrationTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsSuccessWithCookie()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "ValidPassword123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.EnsureSuccessStatusCode();
        response.Headers.Should().ContainKey("Set-Cookie");

        var cookies = response.Headers.GetValues("Set-Cookie");
        cookies.Should().Contain(cookie => cookie.StartsWith(".AspNetCore.Identity.Application"));
    }

    [Fact]
    public async Task Register_NewUser_CreatesUserInDatabase()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Email = "newuser@example.com",
            Password = "SecurePassword123!",
            ConfirmPassword = "SecurePassword123!"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", registerRequest);

        // Assert
        response.EnsureSuccessStatusCode();

        var user = await DbContext.Users
            .FirstOrDefaultAsync(u => u.Email == registerRequest.Email);
        user.Should().NotBeNull();
        user.Email.Should().Be(registerRequest.Email);
        user.EmailConfirmed.Should().BeFalse(); // Should require email confirmation
    }

    [Fact]
    public async Task Me_WithValidSession_ReturnsUserInfo()
    {
        // Arrange
        await LoginAsTestUser();

        // Act
        var response = await Client.GetAsync("/api/auth/me");

        // Assert
        response.EnsureSuccessStatusCode();
        var userInfo = await response.Content.ReadFromJsonAsync<UserInfoResponse>();
        userInfo.Should().NotBeNull();
        userInfo.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Logout_WithValidSession_ClearsCookieAndSession()
    {
        // Arrange
        await LoginAsTestUser();

        // Act
        var response = await Client.PostAsync("/api/auth/logout", null);

        // Assert
        response.EnsureSuccessStatusCode();

        // Verify session is cleared by trying to access protected endpoint
        var protectedResponse = await Client.GetAsync("/api/auth/me");
        protectedResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private async Task LoginAsTestUser()
    {
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "ValidPassword123!"
        };

        var response = await Client.PostAsJsonAsync("/api/auth/login", loginRequest);
        response.EnsureSuccessStatusCode();
    }
}
```

#### Database Integration Testing with TestContainers

**Real SQL Server Integration Tests:**
```csharp
public class DatabaseIntegrationTests : IAsyncLifetime
{
    private readonly SqlServerContainer _sqlContainer;
    private readonly WebApplicationFactory<Program> _factory;
    private HttpClient _client;
    private ApplicationDbContext _dbContext;

    public DatabaseIntegrationTests()
    {
        _sqlContainer = new SqlServerBuilder()
            .WithPassword("YourStrong@Passw0rd")
            .WithCleanUp(true)
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _sqlContainer.StartAsync();

        _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveDbContext<ApplicationDbContext>();
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlServer(_sqlContainer.GetConnectionString()));
            });
        });

        _client = _factory.CreateClient();

        using var scope = _factory.Services.CreateScope();
        _dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await _dbContext.Database.MigrateAsync();
    }

    [Fact]
    public async Task CreateAdventure_WithRealDatabase_PersistsCorrectly()
    {
        // Arrange
        var request = new CreateAdventureRequest
        {
            Name = "Epic Campaign",
            Description = "A long-running campaign",
            Type = AdventureType.Campaign
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/adventures", request);
        response.EnsureSuccessStatusCode();

        // Assert - verify data persisted in real database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var adventure = await dbContext.Adventures
            .FirstOrDefaultAsync(a => a.Name == request.Name);

        adventure.Should().NotBeNull();
        adventure.Description.Should().Be(request.Description);
        adventure.Type.Should().Be(AdventureType.Campaign);
        adventure.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await _sqlContainer.DisposeAsync();
    }
}
```

#### React + Aspire Integration Testing

**Frontend to Backend Integration:**
```typescript
// Integration test for React component with real backend
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdventureList } from './AdventureList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the actual API calls with MSW (Mock Service Worker)
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/adventures', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: '1',
        name: 'Test Adventure',
        description: 'Test Description',
        type: 'OneShot',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]));
  }),

  rest.post('/api/adventures', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({
      id: '2',
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      createdAt: new Date().toISOString()
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('AdventureList loads and displays adventures from API', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdventureList />
      </AuthProvider>
    </QueryClientProvider>
  );

  // Wait for API call to complete and data to render
  await waitFor(() => {
    expect(screen.getByText('Test Adventure')).toBeInTheDocument();
  });

  expect(screen.getByText('Test Description')).toBeInTheDocument();
  expect(screen.getByText('OneShot')).toBeInTheDocument();
});

test('Creating new adventure calls API and updates list', async () => {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdventureList />
      </AuthProvider>
    </QueryClientProvider>
  );

  // Wait for initial load
  await waitFor(() => {
    expect(screen.getByText('Test Adventure')).toBeInTheDocument();
  });

  // Create new adventure
  await user.click(screen.getByText('Create Adventure'));
  await user.type(screen.getByLabelText(/name/i), 'New Adventure');
  await user.type(screen.getByLabelText(/description/i), 'New Description');
  await user.selectOptions(screen.getByLabelText(/type/i), 'Campaign');
  await user.click(screen.getByText('Save'));

  // Verify new adventure appears in list
  await waitFor(() => {
    expect(screen.getByText('New Adventure')).toBeInTheDocument();
  });
  expect(screen.getByText('New Description')).toBeInTheDocument();
});
```

### Testing Best Practices Summary

#### Unit Testing Best Practices
- **Fast and Isolated**: Each test should run in < 100ms and not depend on external resources
- **Mock All Dependencies**: Use NSubstitute for C# or Jest mocks for TypeScript to isolate the unit under test
- **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
- **Use Descriptive Test Names**: Test names should describe the scenario and expected outcome
- **Follow AAA Pattern**: Arrange, Act, Assert structure for clear test organization

#### Integration Testing Best Practices
- **Test Real Interactions**: Use real implementations within test boundaries, mock at system edges
- **Use Test Databases**: In-memory databases for fast tests, TestContainers for realistic scenarios
- **Clean Test Data**: Each test should start with a known state and clean up after itself
- **Test Configuration**: Validate that services can discover and communicate with each other
- **Test Error Scenarios**: Verify proper error handling when dependencies fail

#### General Testing Best Practices
- **Test Pyramid**: Many unit tests, some integration tests, few end-to-end tests
- **Deterministic Tests**: Tests should always produce the same result given the same inputs
- **Independent Tests**: Tests should not depend on the order of execution or side effects from other tests
- **Maintainable Tests**: Keep tests simple and focused on single responsibilities
- **Continuous Validation**: Run tests frequently during development to catch regressions early

## Common Testing Anti-Patterns to Avoid

### ❌ Don't Do This
- Batch multiple changes before testing
- Skip service health validation
- Test only through UI for backend issues
- Use production data in tests
- Ignore performance requirements during development
- Mix authentication testing with feature testing

### ✅ Do This Instead
- Test incrementally after each change
- Always verify service health first
- Use appropriate testing tools for each layer
- Maintain consistent test data
- Monitor performance throughout development
- Separate authentication testing from feature testing

## Phase-Specific Testing Guidelines

### Phase 1 (Infrastructure & Auth) - COMPLETED
- Focus on service health and authentication flows
- Validate Docker alternatives and native services
- Test service discovery and configuration management
- Establish baseline performance metrics

### Phase 2 (Content Management)
- Test CRUD operations for adventures and scenes
- Validate data relationships and constraints
- Test file upload and media management
- Performance test with larger datasets

### Phase 3+ (Interactive Features)
- Canvas performance with multiple assets
- Real-time features with SignalR
- Multi-user collaboration testing
- Advanced UI interaction testing

## Troubleshooting Quick Reference

### "Service Unavailable" Errors
1. Check Aspire Dashboard service status
2. Verify service health endpoints
3. Check service logs for startup errors
4. Validate configuration and secrets

### Authentication Failures
1. Verify WebApp service is healthy
2. Check browser cookies and session state
3. Test direct authentication endpoints
4. Validate user credentials and database state

### Database Connection Issues
1. Check SQL Server container status
2. Verify migration service execution
3. Validate connection strings
4. Test database connectivity directly

### Performance Issues
1. Monitor frame rates in browser DevTools
2. Check API response times in Network tab
3. Review service logs for slow queries
4. Validate resource usage in Aspire Dashboard

---

**Remember:** The key to successful testing is consistency, incrementality, and using the right tool for each testing scenario. Always validate infrastructure health before feature testing, and maintain separation between different types of testing concerns.