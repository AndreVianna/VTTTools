# VTTTools Common Commands

**Last Updated**: January 2025

This document contains all frequently-used commands for VTTTools development. All agents reference this document instead of duplicating commands.

---

## Table of Contents

1. [Backend Operations (.NET)](#backend-operations-net)
2. [Frontend Operations (npm)](#frontend-operations-npm)
3. [Database Operations (EF Core)](#database-operations-ef-core)
4. [PowerShell Automation](#powershell-automation)
5. [Testing Commands](#testing-commands)
6. [Git Operations](#git-operations)
7. [Azure Operations](#azure-operations)

---

## Backend Operations (.NET)

### Build Operations

```bash
# CRITICAL: Always use VttTools.slnx (NOT VttTools.sln)

# Restore packages
dotnet restore VttTools.slnx

# Build solution (Debug)
dotnet build VttTools.slnx

# Build solution (Release)
dotnet build VttTools.slnx --configuration Release

# Clean solution
dotnet clean VttTools.slnx

# Rebuild (clean + build)
dotnet clean VttTools.slnx && dotnet build VttTools.slnx
```

### Run Operations

```bash
# Run specific project
dotnet run --project Source/Assets

# Run with specific environment
dotnet run --project Source/Assets --environment Development
dotnet run --project Source/Assets --environment Production

# Watch mode (auto-restart on changes)
dotnet watch --project Source/Assets
```

### Package Management

```bash
# Add package to project
dotnet add Source/Assets/Assets.csproj package PackageName

# Update package
dotnet add Source/Assets/Assets.csproj package PackageName --version 1.2.3

# Remove package
dotnet remove Source/Assets/Assets.csproj package PackageName

# List packages
dotnet list package
dotnet list package --outdated
```

---

## Frontend Operations (npm)

### Navigate to Frontend

```bash
# Always navigate to WebClientApp first
cd Source/WebClientApp
```

### Package Management

```bash
# Install all dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update packages
npm update

# Remove package
npm uninstall package-name

# List outdated packages
npm outdated
```

### Build & Run

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## Database Operations (EF Core)

### Migration Commands

```bash
# Create new migration
dotnet ef migrations add MigrationName --project Source/Data --startup-project Source/Assets

# Apply migrations to database
dotnet ef database update --project Source/Data --startup-project Source/Assets

# Rollback to specific migration
dotnet ef database update PreviousMigrationName --project Source/Data --startup-project Source/Assets

# Remove last migration (if not applied)
dotnet ef migrations remove --project Source/Data --startup-project Source/Assets

# List all migrations
dotnet ef migrations list --project Source/Data --startup-project Source/Assets
```

### Generate SQL Scripts

```bash
# Generate SQL for all migrations
dotnet ef migrations script --project Source/Data --startup-project Source/Assets --output migration.sql

# Generate SQL for specific migration range
dotnet ef migrations script FromMigration ToMigration --project Source/Data --startup-project Source/Assets --output migration.sql

# Generate SQL for pending migrations
dotnet ef migrations script --project Source/Data --startup-project Source/Assets --idempotent --output migration.sql
```

### Database Management

```bash
# Drop database (CAUTION!)
dotnet ef database drop --project Source/Data --startup-project Source/Assets

# Get database info
dotnet ef dbcontext info --project Source/Data --startup-project Source/Assets

# Scaffold DbContext from existing database (reverse engineering)
dotnet ef dbcontext scaffold "ConnectionString" Microsoft.EntityFrameworkCore.SqlServer --project Source/Data --startup-project Source/Assets
```

---

## PowerShell Automation

### Execute Scripts

```bash
# Standard execution pattern
pwsh -ExecutionPolicy Bypass -File .claude/scripts/script-name.ps1

# With parameters
pwsh -ExecutionPolicy Bypass -File .claude/scripts/script-name.ps1 -Environment Production

# Common scripts
pwsh -ExecutionPolicy Bypass -File .claude/scripts/setup.ps1
pwsh -ExecutionPolicy Bypass -File .claude/scripts/view_logs.ps1
```

### Script Development

```powershell
# Test script syntax (PowerShell)
Test-Script -Path .claude/scripts/script-name.ps1

# Get help for script
Get-Help .claude/scripts/script-name.ps1 -Full

# Debug script
pwsh -ExecutionPolicy Bypass -File .claude/scripts/script-name.ps1 -Verbose
```

---

## Testing Commands

### Backend Tests (xUnit)

```bash
# Run all tests
dotnet test VttTools.slnx

# Run tests with code coverage
dotnet test VttTools.slnx --collect:"XPlat Code Coverage"

# Run tests in specific project
dotnet test Source/Assets.UnitTests

# Run tests with filter
dotnet test VttTools.slnx --filter "FullyQualifiedName~GameSessionService"
dotnet test VttTools.slnx --filter "Category=Integration"

# Run tests with detailed output
dotnet test VttTools.slnx --verbosity detailed

# Run tests without building
dotnet test VttTools.slnx --no-build
```

### Frontend Tests (Vitest)

```bash
# Navigate to frontend first
cd Source/WebClientApp

# Run tests (watch mode)
npm test

# Run tests once
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm test -- --ui

# Run specific test file
npm test -- LoginForm.test.tsx

# Run tests matching pattern
npm test -- --grep "GameSession"
```

### Coverage Reports

```bash
# Backend coverage (after test run)
# Results in: TestResults/*/coverage.cobertura.xml
# View with coverage tools (VS Code extensions, ReportGenerator, etc.)

# Frontend coverage (after npm run test:coverage)
# Results in: Source/WebClientApp/coverage/
# Open: Source/WebClientApp/coverage/index.html in browser
```

---

## Git Operations

### Common Git Commands

```bash
# Status
git status

# View changes
git diff
git diff --staged

# Stage changes
git add .
git add Source/Assets/

# Commit
git commit -m "Commit message"

# Push
git push
git push origin branch-name

# Pull
git pull
git pull origin main

# Branches
git branch                    # List branches
git branch feature-name       # Create branch
git checkout feature-name     # Switch branch
git checkout -b feature-name  # Create and switch

# Stash changes
git stash
git stash pop
git stash list
```

### View Git History

```bash
# Recent commits
git log --oneline -10

# Recent commits with files
git log --stat -5

# Commits by author
git log --author="Name"

# Commits in date range
git log --since="2024-01-01" --until="2024-12-31"

# View specific file history
git log --follow Source/Assets/Services/AssetService.cs
```

---

## Azure Operations

### Azure CLI

```bash
# Login
az login

# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "subscription-name"

# List resource groups
az group list --output table
```

### Blob Storage

```bash
# List containers
az storage container list --account-name accountname --output table

# Upload file
az storage blob upload --account-name accountname --container-name assets --file localfile.jpg --name remotefile.jpg

# Download file
az storage blob download --account-name accountname --container-name assets --name remotefile.jpg --file localfile.jpg

# List blobs
az storage blob list --account-name accountname --container-name assets --output table

# Delete blob
az storage blob delete --account-name accountname --container-name assets --name remotefile.jpg
```

### Health Check Testing

```bash
# Test health endpoint (local)
curl http://localhost:5000/health

# Test health endpoint (deployed)
curl https://your-app.azurewebsites.net/health

# Test with PowerShell
Invoke-WebRequest -Uri http://localhost:5000/health -Method Get
```

---

## Quick Reference Matrix

| Task | Backend Command | Frontend Command |
|------|----------------|------------------|
| Install dependencies | `dotnet restore VttTools.slnx` | `npm install` |
| Build | `dotnet build VttTools.slnx` | `npm run build` |
| Run locally | `dotnet run --project Source/Assets` | `npm run dev` |
| Run tests | `dotnet test VttTools.slnx` | `npm test` |
| Test coverage | `dotnet test --collect:"XPlat Code Coverage"` | `npm run test:coverage` |
| Clean build | `dotnet clean VttTools.slnx` | `rm -rf dist/` |

---

## Related Documentation

- **Technology Stack**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Code Examples**: `Documents/Guides/CODE_EXAMPLES.md`
- **Coding Standards**: `Documents/Guides/CODING_STANDARDS.md`
- **Testing Guide**: `Documents/Guides/TESTING_GUIDE.md`
- **Implementation Guide**: `Documents/Guides/IMPLEMENTATION_GUIDE.md`
