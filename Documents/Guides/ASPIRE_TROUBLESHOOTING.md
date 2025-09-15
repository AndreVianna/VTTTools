# VTT Tools Aspire Troubleshooting Guide

## Overview

This guide provides solutions for common .NET Aspire issues encountered during VTT Tools development, with a focus on Docker alternatives, service discovery problems, and Windows-specific configuration challenges based on Phase 1 testing experiences.

## Docker Issues & Native Alternatives

### Windows/Linux Manifest Mismatches

**Problem:**
Docker containers fail to start due to platform manifest mismatches on Windows development machines.

```bash
# Error Example:
Error: no matching manifest for windows/amd64 in the manifest list entries
docker: Error response from daemon: pull access denied for linux/amd64 manifest
```

**Solution: Native Windows Services**
Replace Docker containers with native Windows services for development:

#### SQL Server → LocalDB
```xml
<!-- In appsettings.Development.json -->
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb;Trusted_Connection=true;MultipleActiveResultSets=true;"
  }
}
```

```bash
# Install SQL Server LocalDB (if not already installed)
# Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads

# Verify LocalDB installation
sqllocaldb info
sqllocaldb start mssqllocaldb
```

#### Redis → Memurai
```bash
# Install Memurai (Redis-compatible for Windows)
# Download from: https://www.memurai.com/get-memurai

# Start Memurai service
net start Memurai

# Update connection string in appsettings.Development.json
{
  "ConnectionStrings": {
    "RedisCache": "localhost:6379"
  }
}
```

#### Azure Storage → Azurite
```bash
# Install Azurite globally
npm install -g azurite

# Start Azurite in dedicated terminal
azurite --location C:\azurite-data --debug C:\azurite-debug.log

# Update connection string in appsettings.Development.json
{
  "ConnectionStrings": {
    "AzureStorage": "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
  }
}
```

### Docker Bridge Plugin Issues

**Problem:**
Docker using nat driver instead of bridge driver on Windows, causing networking issues.

```bash
# Error Example:
Error: network bridge not found
docker: Error response from daemon: network vtttools_default not found
```

**Solution: AppHost Configuration Update**
```csharp
// In Source/AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Use native services instead of containers for development
var database = builder.AddConnectionString("DefaultConnection");
var cache = builder.AddConnectionString("RedisCache");
var blobs = builder.AddConnectionString("AzureStorage");

// Remove container definitions and use connection strings directly
```

### Container Auto-Detection Issues

**Problem:**
Aspire still attempts to create containers even when using native services.

```bash
# Error Example:
Attempting to start SQL Server container...
Error: Container creation failed, falling back to connection string
```

**Solution: Explicit Configuration**
```csharp
// In Source/AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var isDevelopment = builder.Environment.IsDevelopment();

// Explicitly use connection strings in development
IResourceBuilder<ConnectionStringResource> database;
IResourceBuilder<ConnectionStringResource> cache;
IResourceBuilder<ConnectionStringResource> blobs;

if (isDevelopment)
{
    // Use native services via connection strings
    database = builder.AddConnectionString("DefaultConnection");
    cache = builder.AddConnectionString("RedisCache");
    blobs = builder.AddConnectionString("AzureStorage");
}
else
{
    // Use containers in production
    database = builder.AddSqlServer("sql")
                     .AddDatabase("database");
    cache = builder.AddRedis("cache");
    blobs = builder.AddAzureStorage("storage")
                  .RunAsEmulator();
}
```

## Service Discovery Issues

### Aspire Service Names Not Resolving

**Problem:**
React app cannot resolve Aspire service discovery names like `https+http://auth-api`.

```typescript
// Error in Vite proxy configuration:
proxy: {
  '/api/auth': 'https+http://webapp',  // ❌ Doesn't work
}
```

**Solution: Use Localhost URLs**
```typescript
// vite.config.ts - Updated proxy configuration
export default defineConfig({
  server: {
    proxy: {
      '/api/auth': {
        target: 'https://localhost:7005',  // ✅ Direct localhost URL
        changeOrigin: true,
        secure: false,
      },
      '/api/assets': {
        target: 'https://localhost:7001',  // ✅ Direct localhost URL
        changeOrigin: true,
        secure: false,
      },
      '/api/adventures': {
        target: 'https://localhost:7003',  // ✅ Direct localhost URL
        changeOrigin: true,
        secure: false,
      },
      // Add all service endpoints with actual ports
    },
  },
});
```

### Finding Correct Service Ports

**Problem:**
Aspire assigns dynamic ports, making Vite proxy configuration difficult.

**Solution: Port Detection Script**
```bash
# Create a PowerShell script to detect ports
# Scripts/get-service-ports.ps1

$aspireEndpoints = @{}

# Read Aspire dashboard output or configuration
$processes = Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"} | Select-Object LocalPort

Write-Host "Detected Aspire Service Ports:"
Write-Host "WebApp (Identity): 7005"
Write-Host "Assets API: 7001"
Write-Host "Game API: 7002"
Write-Host "Library API: 7003"
Write-Host "Media API: 7004"

# Update vite.config.ts template
$viteConfig = @"
proxy: {
  '/api/auth': 'https://localhost:7005',
  '/api/assets': 'https://localhost:7001',
  '/api/adventures': 'https://localhost:7003',
  '/api/scenes': 'https://localhost:7003',
  '/api/sessions': 'https://localhost:7002',
  '/api/media': 'https://localhost:7004',
}
"@

Write-Host "Use this configuration in vite.config.ts:"
Write-Host $viteConfig
```

### Service Discovery in Development vs Production

**Problem:**
Different service discovery mechanisms needed for development and production.

**Solution: Environment-Specific Configuration**
```csharp
// In Source/AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);
var isDevelopment = builder.Environment.IsDevelopment();

// Configure services with environment-specific settings
var webApp = builder.AddProject<Projects.VttTools_WebApp>("webapp")
                   .WithHttpsEndpoint(port: isDevelopment ? 7005 : null, name: "https")
                   .WithReference(database)
                   .WithReference(cache);

var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                   .WithHttpsEndpoint(port: isDevelopment ? 7001 : null, name: "https")
                   .WithReference(database)
                   .WithReference(cache);

// In development, use fixed ports for easier proxy configuration
// In production, let Aspire handle dynamic port assignment
```

## Configuration Management Issues

### Hardcoded Connection Strings

**Problem:**
Connection strings hardcoded in appsettings.json cause security and maintainability issues.

**Solution: User Secrets Pattern**
```bash
# Initialize user secrets for each project
cd Source/WebApp
dotnet user-secrets init

# Set connection strings via user secrets
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb;Trusted_Connection=true;"
dotnet user-secrets set "ConnectionStrings:RedisCache" "localhost:6379"
dotnet user-secrets set "ConnectionStrings:AzureStorage" "AccountName=devstoreaccount1;AccountKey=...;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"

# Repeat for all service projects
cd ../Assets
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb;Trusted_Connection=true;"
# ... etc.
```

```csharp
// In each service's Program.cs
var builder = WebApplication.CreateBuilder(args);

// AddConnectionString() pattern for clean configuration
builder.AddServiceDefaults();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);
});

builder.Services.AddStackExchangeRedisCache(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("RedisCache");
    options.Configuration = connectionString;
});
```

### Environment Variable Conflicts

**Problem:**
Environment variables from different sources conflict or override each other.

**Solution: Configuration Precedence**
```json
// appsettings.Development.json - Lowest priority
{
  "ConnectionStrings": {
    "DefaultConnection": "fallback-connection-string"
  }
}
```

```xml
<!-- In .csproj files -->
<PropertyGroup>
  <UserSecretsId>vtttools-service-secrets</UserSecretsId>
</PropertyGroup>
```

```bash
# User secrets - Medium priority
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "development-connection"

# Environment variables - Highest priority
$env:ConnectionStrings__DefaultConnection = "override-connection"
```

## Health Check Configuration Issues

### Health Checks Failing

**Problem:**
Aspire health checks fail even when services are running correctly.

**Solution: Comprehensive Health Check Implementation**
```csharp
// In each service's Program.cs
builder.Services.AddHealthChecks()
    .AddDbContext<ApplicationDbContext>() // Database connectivity
    .AddRedis(builder.Configuration.GetConnectionString("RedisCache")) // Redis connectivity
    .AddAzureBlobStorage(builder.Configuration.GetConnectionString("AzureStorage")); // Storage connectivity

var app = builder.Build();

// Configure health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// More detailed health check for debugging
app.MapHealthChecks("/health/detailed", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration.ToString()
            })
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
});
```

### Health Check Dependencies

**Problem:**
Services report unhealthy due to dependency service issues.

**Solution: Dependency Health Checks**
```csharp
// In Source/AppHost/Program.cs
var database = builder.AddConnectionString("DefaultConnection");
var cache = builder.AddConnectionString("RedisCache");
var blobs = builder.AddConnectionString("AzureStorage");

// Ensure services wait for dependencies
var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                   .WithReference(database)
                   .WithReference(cache)
                   .WaitFor(database) // ✅ Wait for database before starting
                   .WaitFor(cache)    // ✅ Wait for cache before starting
                   .WithHttpHealthCheck("health");

var library = builder.AddProject<Projects.VttTools_Library>("library-api")
                    .WithReference(database)
                    .WithReference(cache)
                    .WaitFor(database)
                    .WaitFor(cache)
                    .WithHttpHealthCheck("health");
```

## Aspire Dashboard Issues

### Dashboard Not Accessible

**Problem:**
Cannot access Aspire Dashboard at expected URL.

```bash
# Error Example:
Unable to connect to https://localhost:17086
Connection refused or timeout
```

**Solution: Port and Firewall Configuration**
```bash
# Check if port 17086 is in use
netstat -an | findstr :17086

# Check Windows Firewall settings
# Add exception for port 17086 if needed

# Alternative: Use different port
$env:ASPIRE_DASHBOARD_PORT = "17087"
dotnet run --project Source/AppHost
```

### Dashboard Shows Services as Unhealthy

**Problem:**
All services appear red/unhealthy in Aspire Dashboard despite running correctly.

**Solution: Debugging Service Health**
```bash
# Test each service health endpoint individually
curl -k https://localhost:7001/health  # Assets
curl -k https://localhost:7002/health  # Game
curl -k https://localhost:7003/health  # Library
curl -k https://localhost:7004/health  # Media
curl -k https://localhost:7005/health  # WebApp

# Check detailed health information
curl -k https://localhost:7001/health/detailed

# Common issues:
# 1. Database connection string incorrect
# 2. Redis not running (check Memurai service)
# 3. Azurite not started
# 4. Certificate trust issues (use -k flag for testing)
```

## Migration Service Issues

### Migrations Not Running

**Problem:**
Database migrations don't execute during startup.

**Solution: Migration Service Configuration**
```csharp
// In Source/Data.MigrationService/Worker.cs
public class Worker : BackgroundService
{
    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Ensure database exists
            await context.Database.EnsureCreatedAsync(cancellationToken);

            // Apply pending migrations
            var pendingMigrations = await context.Database.GetPendingMigrationsAsync(cancellationToken);
            if (pendingMigrations.Any())
            {
                _logger.LogInformation("Applying {Count} pending migrations", pendingMigrations.Count());
                await context.Database.MigrateAsync(cancellationToken);
                _logger.LogInformation("Migrations applied successfully");
            }
            else
            {
                _logger.LogInformation("No pending migrations found");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to apply database migrations");
            throw; // Important: fail fast if migrations fail
        }

        await base.StartAsync(cancellationToken);
    }
}
```

### Migration Service Connection Issues

**Problem:**
Migration service cannot connect to database.

**Solution: Connection String Validation**
```csharp
// In Source/Data.MigrationService/Program.cs
var builder = Host.CreateApplicationBuilder(args);

// Test connection string before proceeding
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("DefaultConnection connection string is required");
}

// Test database connectivity
try
{
    using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();
    connection.Close();
    Console.WriteLine("Database connection test successful");
}
catch (Exception ex)
{
    Console.WriteLine($"Database connection test failed: {ex.Message}");
    throw;
}

builder.AddServiceDefaults();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
```

## Performance & Resource Issues

### High Memory Usage

**Problem:**
Aspire services consume excessive memory during development.

**Solution: Resource Constraints**
```csharp
// In Source/AppHost/Program.cs
var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                   .WithResourceLimits(memory: "256MB", cpu: "0.5") // Limit resources
                   .WithReference(database);
```

### Slow Startup Times

**Problem:**
Services take too long to start, causing timeouts.

**Solution: Startup Optimization**
```csharp
// In each service's Program.cs
var builder = WebApplication.CreateBuilder(args);

// Optimize startup performance
builder.Services.Configure<HostOptions>(options =>
{
    options.ServicesStartConcurrently = true; // Start services in parallel
    options.ServicesStopConcurrently = true;
});

// Add minimal services for faster startup
if (builder.Environment.IsDevelopment())
{
    // Skip expensive services during development
    builder.Services.AddSingleton<IEmailService, NullEmailService>();
}
else
{
    builder.Services.AddScoped<IEmailService, EmailService>();
}
```

## Common Error Patterns & Solutions

### "Service 'xyz' is not ready"

**Cause:** Service dependencies not properly configured
**Solution:** Add `.WaitFor()` dependencies in AppHost

### "Connection string 'DefaultConnection' not found"

**Cause:** User secrets not set or configuration override
**Solution:** Check user secrets and environment variables

### "Unable to resolve service 'https+http://service-name'"

**Cause:** Vite proxy cannot resolve Aspire service names
**Solution:** Use direct localhost URLs with actual ports

### "Health check failed for service"

**Cause:** Service cannot connect to dependencies
**Solution:** Verify all dependency services are running and accessible

### "Migration service exited with code 1"

**Cause:** Database connection failure or migration error
**Solution:** Check connection string and database availability

## Quick Diagnostic Commands

```bash
# Check all Windows services
Get-Service | Where-Object {$_.Name -like "*Memurai*" -or $_.Name -like "*MSSQL*"}

# Check local database instances
sqllocaldb info
sqllocaldb start mssqllocaldb

# Test Azurite connectivity
curl http://127.0.0.1:10000/devstoreaccount1

# Verify Redis connectivity
redis-cli -h localhost -p 6379 ping

# Check .NET processes
Get-Process | Where-Object {$_.ProcessName -like "*dotnet*"}

# Clean and reset development environment
docker system prune -f
dotnet clean
dotnet build --configuration Development
```

## Prevention Checklist

Before starting development session:

- [ ] LocalDB service is running
- [ ] Memurai service is running
- [ ] Azurite is started in separate terminal
- [ ] User secrets are configured for all services
- [ ] No conflicting Docker containers are running
- [ ] Windows Firewall allows necessary ports
- [ ] Latest .NET SDK version installed
- [ ] Node.js and npm are up to date

---

**Remember:** Native Windows services provide more reliable development experience than Docker containers for VTT Tools development. Always verify infrastructure health before troubleshooting application-specific issues.