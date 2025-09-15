# VTT Tools Infrastructure Setup Guide

## Overview

This guide provides comprehensive setup instructions for VTT Tools development infrastructure, focusing on Windows native services that replace Docker containers for reliable development. Based on Phase 1 testing experiences, native services provide superior stability and performance compared to Docker on Windows development machines.

## Architecture Overview

### Development vs Production Infrastructure

**Development (Native Services):**
- LocalDB for SQL Server
- Memurai for Redis
- Azurite for Azure Storage
- PowerShell scripts for automation

**Production (Containerized):**
- SQL Server in containers
- Redis in containers
- Azure Storage (cloud or container)
- Aspire orchestration

## Windows Native Services Setup

### SQL Server LocalDB Installation

**Why LocalDB?**
- No Docker compatibility issues
- Lightweight SQL Server instance
- Automatic startup/shutdown
- Perfect for development
- No licensing concerns

**Installation Steps:**
```powershell
# Check if LocalDB is already installed
sqllocaldb info

# If not installed, download SQL Server Express LocalDB
# Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
# Select "Express" -> "LocalDB"

# Verify installation
sqllocaldb info
# Should show: MSSQLLocalDB

# Create development instance (if not exists)
sqllocaldb create "mssqllocaldb" -s

# Start the instance
sqllocaldb start "mssqllocaldb"

# Test connection
sqlcmd -S "(localdb)\mssqllocaldb" -Q "SELECT @@VERSION"
```

**Configuration:**
```json
// In user secrets for each service project
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
  }
}
```

**Management Commands:**
```powershell
# List LocalDB instances
sqllocaldb info

# Stop instance
sqllocaldb stop "mssqllocaldb"

# Start instance
sqllocaldb start "mssqllocaldb"

# Delete instance (if needed for fresh start)
sqllocaldb delete "mssqllocaldb"
sqllocaldb create "mssqllocaldb" -s

# Connect with SQL Server Management Studio
# Server name: (localdb)\mssqllocaldb
```

### Redis → Memurai Installation

**Why Memurai?**
- Native Windows Redis implementation
- 100% Redis API compatibility
- Windows service integration
- Better performance than Docker Redis on Windows
- Enterprise features available

**Installation Steps:**
```powershell
# Download Memurai from: https://www.memurai.com/get-memurai
# Use the free developer edition

# After installation, verify service is running
Get-Service -Name "Memurai"

# If not running, start the service
Start-Service -Name "Memurai"

# Set service to start automatically
Set-Service -Name "Memurai" -StartupType Automatic

# Test Redis connectivity
redis-cli ping
# Should return: PONG
```

**Configuration:**
```json
// In user secrets
{
  "ConnectionStrings": {
    "RedisCache": "localhost:6379"
  }
}
```

**Management Commands:**
```powershell
# Check Memurai service status
Get-Service -Name "Memurai"

# Start/Stop service
Start-Service -Name "Memurai"
Stop-Service -Name "Memurai"

# Connect with Redis CLI
redis-cli -h localhost -p 6379

# Basic Redis commands for testing
redis-cli ping
redis-cli set test "Hello World"
redis-cli get test
redis-cli flushall  # Clear all data (development only)
```

### Azure Storage → Azurite Installation

**Why Azurite?**
- Official Azure Storage emulator
- Cross-platform compatibility
- Full Azure Storage API compatibility
- Better than legacy Storage Emulator
- npm-based installation

**Installation Steps:**
```powershell
# Install Azurite globally via npm
npm install -g azurite

# Verify installation
azurite --version

# Create data directory
mkdir C:\azurite-data

# Start Azurite (run in separate PowerShell window)
azurite --location C:\azurite-data --debug C:\azurite-debug.log

# Alternative: Start with specific ports
azurite --location C:\azurite-data --blobPort 10000 --queuePort 10001 --tablePort 10002
```

**Configuration:**
```json
// In user secrets
{
  "ConnectionStrings": {
    "AzureStorage": "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
  }
}
```

**Management Commands:**
```powershell
# Start Azurite in background
Start-Process -FilePath "azurite" -ArgumentList "--location", "C:\azurite-data" -WindowStyle Hidden

# Check if Azurite is running
Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*azurite*"}

# Test blob storage connectivity
curl http://127.0.0.1:10000/devstoreaccount1

# Use Azure Storage Explorer to manage
# Connection string: AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
```

## User Secrets Configuration

### Setting Up User Secrets for All Services

**Why User Secrets?**
- Keeps sensitive data out of source control
- Environment-specific configuration
- Easy to manage per-project
- Secure development practices

**Setup Script:**
```powershell
# Scripts/setup-user-secrets.ps1
$connectionStrings = @{
    "DefaultConnection" = "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
    "RedisCache" = "localhost:6379"
    "AzureStorage" = "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
}

$projects = @(
    "Source/WebApp",
    "Source/Assets",
    "Source/Game",
    "Source/Library",
    "Source/Media",
    "Source/Data.MigrationService"
)

foreach ($project in $projects) {
    Write-Host "Setting up user secrets for $project..."

    # Navigate to project directory
    Push-Location $project

    # Initialize user secrets
    dotnet user-secrets init

    # Set connection strings
    foreach ($key in $connectionStrings.Keys) {
        dotnet user-secrets set "ConnectionStrings:$key" $connectionStrings[$key]
        Write-Host "  Set ConnectionStrings:$key"
    }

    Pop-Location
    Write-Host "Completed $project`n"
}

Write-Host "User secrets setup completed for all projects."
```

**Manual Setup (Alternative):**
```powershell
# For each project directory
cd Source/WebApp

# Initialize user secrets
dotnet user-secrets init

# Set connection strings
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
dotnet user-secrets set "ConnectionStrings:RedisCache" "localhost:6379"
dotnet user-secrets set "ConnectionStrings:AzureStorage" "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"

# Repeat for all service projects...
```

## Service Configuration Updates

### AppHost Configuration for Native Services

```csharp
// Source/AppHost/Program.cs - Updated for native services
var builder = DistributedApplication.CreateBuilder(args);

var isDevelopment = builder.Environment.IsDevelopment();

// Use native services in development, containers in production
IResourceBuilder<IResourceWithConnectionString> database;
IResourceBuilder<IResourceWithConnectionString> cache;
IResourceBuilder<IResourceWithConnectionString> blobs;

if (isDevelopment)
{
    // Native services via connection strings
    database = builder.AddConnectionString("DefaultConnection");
    cache = builder.AddConnectionString("RedisCache");
    blobs = builder.AddConnectionString("AzureStorage");
}
else
{
    // Containerized services for production
    database = builder.AddSqlServer("sql").AddDatabase("database");
    cache = builder.AddRedis("cache");
    blobs = builder.AddAzureStorage("storage").RunAsEmulator();
}

// Migration service - applies database migrations
var migrationService = builder.AddProject<Projects.VttTools_Data_MigrationService>("migration-service")
                             .WithReference(database);

// Microservices with native service dependencies
var resources = builder.AddProject<Projects.VttTools_Media>("resources-api")
                      .WithReference(database)
                      .WithReference(cache)
                      .WithReference(blobs)
                      .WaitFor(migrationService)
                      .WithHttpHealthCheck("health");

var assets = builder.AddProject<Projects.VttTools_Assets>("assets-api")
                   .WithReference(database)
                   .WithReference(cache)
                   .WaitFor(migrationService)
                   .WithHttpHealthCheck("health");

var library = builder.AddProject<Projects.VttTools_Library>("library-api")
                    .WithReference(database)
                    .WithReference(cache)
                    .WaitFor(migrationService)
                    .WithHttpHealthCheck("health");

var game = builder.AddProject<Projects.VttTools_Game>("game-api")
                 .WithReference(database)
                 .WithReference(cache)
                 .WaitFor(migrationService)
                 .WithHttpHealthCheck("health");

var webApp = builder.AddProject<Projects.VttTools_WebApp>("webapp")
                   .WithReference(database)
                   .WithReference(cache)
                   .WithReference(blobs)
                   .WithReference(resources).WaitFor(resources)
                   .WithReference(assets).WaitFor(assets)
                   .WithReference(library).WaitFor(library)
                   .WithReference(game).WaitFor(game)
                   .WaitFor(migrationService)
                   .WithHttpHealthCheck("health");

builder.Build().Run();
```

### Service Health Checks for Native Infrastructure

```csharp
// Example for any service's Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add health checks for native services
builder.Services.AddHealthChecks()
    .AddSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "database",
        tags: new[] { "ready" })
    .AddRedis(
        builder.Configuration.GetConnectionString("RedisCache")!,
        name: "redis",
        tags: new[] { "ready" })
    .AddAzureBlobStorage(
        builder.Configuration.GetConnectionString("AzureStorage")!,
        name: "storage",
        tags: new[] { "ready" });

var app = builder.Build();

// Health check endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,
});
```

## Development Environment Scripts

### Infrastructure Startup Script

```powershell
# Scripts/start-infrastructure.ps1
Write-Host "Starting VTT Tools Development Infrastructure..."

# Start LocalDB
Write-Host "Starting LocalDB..."
sqllocaldb start "mssqllocaldb"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ LocalDB started successfully"
} else {
    Write-Host "❌ Failed to start LocalDB"
    exit 1
}

# Start Memurai (Redis)
Write-Host "Starting Memurai (Redis)..."
$memuriService = Get-Service -Name "Memurai" -ErrorAction SilentlyContinue
if ($memuriService) {
    if ($memuriService.Status -ne "Running") {
        Start-Service -Name "Memurai"
        Write-Host "✅ Memurai service started"
    } else {
        Write-Host "✅ Memurai service already running"
    }
} else {
    Write-Host "❌ Memurai service not found. Please install Memurai."
    exit 1
}

# Start Azurite
Write-Host "Starting Azurite..."
$azuriteProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*azurite*"}
if (-not $azuriteProcess) {
    Start-Process -FilePath "azurite" -ArgumentList "--location", "C:\azurite-data", "--debug", "C:\azurite-debug.log" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✅ Azurite started"
} else {
    Write-Host "✅ Azurite already running"
}

# Verify all services
Write-Host "`nVerifying services..."

# Test LocalDB
try {
    $null = Invoke-Sqlcmd -ServerInstance "(localdb)\mssqllocaldb" -Query "SELECT @@VERSION" -ErrorAction Stop
    Write-Host "✅ LocalDB connection verified"
} catch {
    Write-Host "❌ LocalDB connection failed: $($_.Exception.Message)"
}

# Test Redis
try {
    $redisResult = redis-cli ping 2>$null
    if ($redisResult -eq "PONG") {
        Write-Host "✅ Redis connection verified"
    } else {
        Write-Host "❌ Redis connection failed"
    }
} catch {
    Write-Host "❌ Redis connection failed: $($_.Exception.Message)"
}

# Test Azurite
try {
    $azuriteTest = Invoke-WebRequest -Uri "http://127.0.0.1:10000/devstoreaccount1" -Method HEAD -ErrorAction Stop
    Write-Host "✅ Azurite connection verified"
} catch {
    Write-Host "❌ Azurite connection failed: $($_.Exception.Message)"
}

Write-Host "`n🎉 Infrastructure startup completed!"
Write-Host "You can now run: dotnet run --project Source/AppHost"
```

### Infrastructure Shutdown Script

```powershell
# Scripts/stop-infrastructure.ps1
Write-Host "Stopping VTT Tools Development Infrastructure..."

# Stop Azurite processes
Write-Host "Stopping Azurite..."
$azuriteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*azurite*"}
foreach ($process in $azuriteProcesses) {
    Stop-Process -Id $process.Id -Force
    Write-Host "✅ Stopped Azurite process (PID: $($process.Id))"
}

# Stop Memurai (optional - can keep running)
Write-Host "Memurai service will continue running (recommended for development)"
Write-Host "To stop manually: Stop-Service -Name 'Memurai'"

# Stop LocalDB (optional - can keep running)
Write-Host "LocalDB will continue running (recommended for development)"
Write-Host "To stop manually: sqllocaldb stop 'mssqllocaldb'"

Write-Host "`n✅ Infrastructure shutdown completed!"
```

### Health Check Script

```powershell
# Scripts/check-infrastructure.ps1
Write-Host "Checking VTT Tools Infrastructure Health..."

$allHealthy = $true

# Check LocalDB
Write-Host "`n🔍 Checking LocalDB..."
try {
    $localDbInstances = sqllocaldb info
    if ($localDbInstances -contains "mssqllocaldb") {
        $localDbStatus = sqllocaldb info "mssqllocaldb"
        if ($localDbStatus -match "State:\s+Running") {
            Write-Host "✅ LocalDB is running"

            # Test connection
            $null = Invoke-Sqlcmd -ServerInstance "(localdb)\mssqllocaldb" -Query "SELECT 1" -ErrorAction Stop
            Write-Host "✅ LocalDB connection successful"
        } else {
            Write-Host "❌ LocalDB is not running"
            $allHealthy = $false
        }
    } else {
        Write-Host "❌ LocalDB instance 'mssqllocaldb' not found"
        $allHealthy = $false
    }
} catch {
    Write-Host "❌ LocalDB error: $($_.Exception.Message)"
    $allHealthy = $false
}

# Check Memurai/Redis
Write-Host "`n🔍 Checking Memurai/Redis..."
try {
    $memuriService = Get-Service -Name "Memurai" -ErrorAction Stop
    if ($memuriService.Status -eq "Running") {
        Write-Host "✅ Memurai service is running"

        # Test Redis connection
        $redisResult = redis-cli ping 2>$null
        if ($redisResult -eq "PONG") {
            Write-Host "✅ Redis connection successful"
        } else {
            Write-Host "❌ Redis connection failed"
            $allHealthy = $false
        }
    } else {
        Write-Host "❌ Memurai service is not running (Status: $($memuriService.Status))"
        $allHealthy = $false
    }
} catch {
    Write-Host "❌ Memurai service not found or error: $($_.Exception.Message)"
    $allHealthy = $false
}

# Check Azurite
Write-Host "`n🔍 Checking Azurite..."
try {
    $azuriteProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*azurite*"}
    if ($azuriteProcess) {
        Write-Host "✅ Azurite process is running (PID: $($azuriteProcess.Id))"

        # Test Azurite connection
        $azuriteTest = Invoke-WebRequest -Uri "http://127.0.0.1:10000/devstoreaccount1" -Method HEAD -ErrorAction Stop -TimeoutSec 5
        Write-Host "✅ Azurite connection successful"
    } else {
        Write-Host "❌ Azurite process not found"
        $allHealthy = $false
    }
} catch {
    Write-Host "❌ Azurite connection failed: $($_.Exception.Message)"
    $allHealthy = $false
}

# Check user secrets configuration
Write-Host "`n🔍 Checking User Secrets Configuration..."
$projects = @("Source/WebApp", "Source/Assets", "Source/Game", "Source/Library", "Source/Media")
foreach ($project in $projects) {
    if (Test-Path $project) {
        Push-Location $project
        try {
            $secrets = dotnet user-secrets list 2>$null
            if ($secrets -match "ConnectionStrings:DefaultConnection") {
                Write-Host "✅ $project has user secrets configured"
            } else {
                Write-Host "❌ $project missing user secrets"
                $allHealthy = $false
            }
        } catch {
            Write-Host "❌ $project user secrets error"
            $allHealthy = $false
        }
        Pop-Location
    }
}

# Final status
Write-Host "`n" + "="*50
if ($allHealthy) {
    Write-Host "🎉 All infrastructure components are healthy!"
    Write-Host "You can now run: dotnet run --project Source/AppHost"
} else {
    Write-Host "⚠️  Some infrastructure components need attention."
    Write-Host "Please review the errors above and run setup scripts if needed."
    Write-Host "`nSetup commands:"
    Write-Host "  .\Scripts\start-infrastructure.ps1"
    Write-Host "  .\Scripts\setup-user-secrets.ps1"
}
Write-Host "="*50
```

## Docker CLI Alternatives

### When Docker is Required

Some scenarios still require Docker CLI (not Docker Desktop):

```powershell
# Install Docker CLI only (without Docker Desktop)
# 1. Install via Chocolatey
choco install docker-cli

# 2. Or download binary directly from:
# https://download.docker.com/win/static/stable/x86_64/

# 3. Configure to use remote Docker daemon or Podman
$env:DOCKER_HOST = "tcp://remote-docker-host:2376"
```

### Podman as Docker Alternative

```powershell
# Install Podman (Docker alternative)
# Download from: https://podman.io/getting-started/installation

# Podman can replace Docker commands
podman --version

# Use podman for container operations
podman pull mcr.microsoft.com/mssql/server:latest
podman run -d --name test-sql -e ACCEPT_EULA=Y -e SA_PASSWORD=YourPassword123 -p 1433:1433 mcr.microsoft.com/mssql/server:latest

# But prefer native services for development!
```

## Performance Optimization

### Resource Configuration

```powershell
# Optimize LocalDB performance
sqllocaldb stop "mssqllocaldb"
sqllocaldb delete "mssqllocaldb"
sqllocaldb create "mssqllocaldb" -s

# Configure LocalDB settings (if needed)
sqlcmd -S "(localdb)\mssqllocaldb" -Q "ALTER DATABASE tempdb MODIFY FILE (NAME = tempdev, SIZE = 100MB, FILEGROWTH = 10MB)"
```

### Monitoring and Maintenance

```powershell
# Scripts/maintenance.ps1
Write-Host "Performing VTT Tools infrastructure maintenance..."

# Clear LocalDB logs (if getting large)
$localDbPath = "$env:USERPROFILE\AppData\Local\Microsoft\Microsoft SQL Server Local DB\Instances\mssqllocaldb"
if (Test-Path "$localDbPath\LocalDB.log") {
    $logSize = (Get-Item "$localDbPath\LocalDB.log").Length / 1MB
    Write-Host "LocalDB log size: $([math]::Round($logSize, 2)) MB"
    if ($logSize -gt 100) {
        Write-Host "⚠️  LocalDB log is large. Consider cleanup."
    }
}

# Clear Redis cache (development only)
Write-Host "Clearing Redis cache..."
redis-cli flushall

# Clear Azurite data (if needed)
$azuriteDataPath = "C:\azurite-data"
if (Test-Path $azuriteDataPath) {
    $dataSize = (Get-ChildItem $azuriteDataPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Azurite data size: $([math]::Round($dataSize, 2)) MB"
}

Write-Host "Maintenance completed."
```

## Troubleshooting Common Issues

### LocalDB Issues

```powershell
# LocalDB won't start
sqllocaldb delete "mssqllocaldb"
sqllocaldb create "mssqllocaldb" -s

# Connection timeout issues
# Check Windows Firewall settings
# Ensure SQL Server Browser service is running
```

### Memurai Issues

```powershell
# Service won't start
Stop-Service -Name "Memurai" -Force
Start-Service -Name "Memurai"

# Connection refused
# Check if port 6379 is blocked by firewall
netstat -an | findstr :6379
```

### Azurite Issues

```powershell
# Port already in use
netstat -an | findstr :10000

# Kill existing processes
Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*azurite*"} | Stop-Process -Force

# Restart with different ports
azurite --location C:\azurite-data --blobPort 10010 --queuePort 10011 --tablePort 10012
```

## Integration with CI/CD

### GitHub Actions Configuration

```yaml
# .github/workflows/infrastructure-setup.yml
name: Setup Infrastructure

on: [push, pull_request]

jobs:
  test-infrastructure:
    runs-on: windows-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '9.0.x'

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install Azurite
      run: npm install -g azurite

    - name: Start Infrastructure
      shell: powershell
      run: |
        # Start LocalDB (already available on GitHub runners)
        sqllocaldb start "mssqllocaldb"

        # Start Azurite
        Start-Process -FilePath "azurite" -ArgumentList "--location", "C:\temp\azurite" -WindowStyle Hidden
        Start-Sleep -Seconds 5

        # Note: Redis not available on GitHub runners - use in-memory cache for tests

    - name: Setup User Secrets
      shell: powershell
      run: |
        $projects = @("Source/WebApp", "Source/Assets", "Source/Game", "Source/Library", "Source/Media")
        foreach ($project in $projects) {
          Push-Location $project
          dotnet user-secrets init
          dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\mssqllocaldb;Database=VttToolsDb_Test;Trusted_Connection=true;"
          dotnet user-secrets set "ConnectionStrings:AzureStorage" "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
          Pop-Location
        }

    - name: Test Infrastructure
      shell: powershell
      run: .\Scripts\check-infrastructure.ps1

    - name: Run Tests
      run: dotnet test --configuration Release
```

---

**Key Benefits of Native Infrastructure:**
1. **Reliability**: No Docker compatibility issues on Windows
2. **Performance**: Native Windows services run faster than containers
3. **Simplicity**: Standard Windows service management
4. **Development Speed**: Faster startup and shutdown times
5. **Resource Efficiency**: Lower memory and CPU usage
6. **Debugging**: Easier to debug and troubleshoot issues

**Phase 1 Lessons Applied:**
- Use LocalDB instead of Docker SQL Server
- Use Memurai instead of Docker Redis
- Use Azurite instead of Docker Azure Storage
- Configure everything via user secrets
- Provide comprehensive automation scripts
- Include health checking and monitoring tools