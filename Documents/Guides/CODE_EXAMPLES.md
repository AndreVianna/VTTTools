# VTTTools Code Examples

**Last Updated**: January 2025

This document contains all standard code patterns and examples for VTTTools. All agents reference these examples instead of duplicating them.

---

## Table of Contents

1. [Backend C# Examples](#backend-c-examples)
2. [Frontend React/TypeScript Examples](#frontend-reacttypescript-examples)
3. [Testing Examples](#testing-examples)
4. [PowerShell Script Examples](#powershell-script-examples)
5. [Database Migration Examples](#database-migration-examples)

---

## Backend C# Examples

### Domain Model (Anemic Record)

```csharp
// Domain Layer - Anemic record with init-only properties
namespace VttTools.Game;

public record GameSession {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Title { get; init; } = string.Empty;
    public Guid OwnerId { get; init; }
    public List<Participant> Players { get; init; } = [];
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public bool IsActive { get; init; } = true;
}

public record Participant {
    public Guid UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public PlayerRole Role { get; init; }
}

public enum PlayerRole {
    GameMaster,
    Player,
    Observer
}
```

### Service Interface and Implementation

```csharp
// Service Contract Interface
namespace VttTools.Game.Contracts;

public interface IGameSessionService {
    Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TypedResult<HttpStatusCode, GameSession>> CreateAsync(
        Guid userId, CreateGameSessionData data, CancellationToken ct = default);
    Task<TypedResult<HttpStatusCode>> UpdateAsync(
        Guid id, UpdateGameSessionData data, CancellationToken ct = default);
    Task<TypedResult<HttpStatusCode>> DeleteAsync(Guid id, CancellationToken ct = default);
}

// Service Implementation with Primary Constructor
namespace VttTools.Game.Services;

public class GameSessionService(IGameSessionStorage storage) : IGameSessionService {
    public async Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        return await storage.GetByIdAsync(id, ct);
    }

    public async Task<TypedResult<HttpStatusCode, GameSession>> CreateAsync(
        Guid userId, CreateGameSessionData data, CancellationToken ct = default) {

        // Validate using FluentValidation pattern
        var result = data.Validate();
        if (result.HasErrors) {
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors])
                .WithNo<GameSession>();
        }

        var session = new GameSession {
            Title = data.Title,
            OwnerId = userId
        };

        await storage.AddAsync(session, ct);
        return TypedResult.As(HttpStatusCode.Created, session);
    }

    public async Task<TypedResult<HttpStatusCode>> UpdateAsync(
        Guid id, UpdateGameSessionData data, CancellationToken ct = default) {

        var session = await storage.GetByIdAsync(id, ct);
        if (session is null) {
            return TypedResult.As(HttpStatusCode.NotFound);
        }

        var result = data.Validate();
        if (result.HasErrors) {
            return TypedResult.As(HttpStatusCode.BadRequest, [.. result.Errors]);
        }

        var updated = session with { Title = data.Title };
        await storage.UpdateAsync(updated, ct);

        return TypedResult.As(HttpStatusCode.NoContent);
    }

    public async Task<TypedResult<HttpStatusCode>> DeleteAsync(
        Guid id, CancellationToken ct = default) {

        var session = await storage.GetByIdAsync(id, ct);
        if (session is null) {
            return TypedResult.As(HttpStatusCode.NotFound);
        }

        await storage.DeleteAsync(id, ct);
        return TypedResult.As(HttpStatusCode.NoContent);
    }
}
```

### Storage Interface and Implementation

```csharp
// Storage Contract Interface
namespace VttTools.Game.Storage;

public interface IGameSessionStorage {
    Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<GameSession>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(GameSession session, CancellationToken ct = default);
    Task UpdateAsync(GameSession session, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

// EF Core Storage Implementation with Primary Constructor
namespace VttTools.Data.Game;

public class GameSessionStorage(ApplicationDbContext context) : IGameSessionStorage {
    public async Task<GameSession?> GetByIdAsync(Guid id, CancellationToken ct = default) {
        return await context.GameSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<List<GameSession>> GetAllAsync(CancellationToken ct = default) {
        return await context.GameSessions
            .AsNoTracking()
            .ToListAsync(ct);
    }

    public async Task AddAsync(GameSession session, CancellationToken ct = default) {
        context.GameSessions.Add(session);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(GameSession session, CancellationToken ct = default) {
        context.GameSessions.Update(session);
        await context.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) {
        var session = await context.GameSessions.FindAsync([id], ct);
        if (session is not null) {
            context.GameSessions.Remove(session);
            await context.SaveChangesAsync(ct);
        }
    }
}
```

### API Handlers (Minimal API)

```csharp
// Static API Handlers
namespace VttTools.Game.Handlers;

public static class GameSessionHandlers {
    public static async Task<Results<Ok<GameSession>, NotFound>> GetById(
        Guid id, IGameSessionService service, CancellationToken ct) {

        var session = await service.GetByIdAsync(id, ct);
        return session is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(session);
    }

    public static async Task<Results<Created<GameSession>, BadRequest<string[]>>> Create(
        Guid userId, CreateGameSessionRequest request, IGameSessionService service, CancellationToken ct) {

        var data = request.ToData();
        var result = await service.CreateAsync(userId, data, ct);

        return result.Is<GameSession>(out var session)
            ? TypedResults.Created($"/api/sessions/{session.Id}", session)
            : TypedResults.BadRequest(result.GetErrors());
    }

    public static async Task<Results<NoContent, NotFound, BadRequest<string[]>>> Update(
        Guid id, UpdateGameSessionRequest request, IGameSessionService service, CancellationToken ct) {

        var data = request.ToData();
        var result = await service.UpdateAsync(id, data, ct);

        if (result.StatusCode == HttpStatusCode.NotFound) {
            return TypedResults.NotFound();
        }

        return result.IsError
            ? TypedResults.BadRequest(result.GetErrors())
            : TypedResults.NoContent();
    }

    public static async Task<Results<NoContent, NotFound>> Delete(
        Guid id, IGameSessionService service, CancellationToken ct) {

        var result = await service.DeleteAsync(id, ct);

        return result.StatusCode == HttpStatusCode.NotFound
            ? TypedResults.NotFound()
            : TypedResults.NoContent();
    }
}
```

### API Contracts (DTOs)

```csharp
// Request DTOs
namespace VttTools.Game.ApiContracts;

public record CreateGameSessionRequest {
    public required string Title { get; init; }
    public string? Description { get; init; }
}

public record UpdateGameSessionRequest {
    public required string Title { get; init; }
}

// Extension methods for mapping
public static class GameSessionMappingExtensions {
    public static CreateGameSessionData ToData(this CreateGameSessionRequest request) {
        return new CreateGameSessionData {
            Title = request.Title
        };
    }

    public static UpdateGameSessionData ToData(this UpdateGameSessionRequest request) {
        return new UpdateGameSessionData {
            Title = request.Title
        };
    }
}
```

---

## Frontend React/TypeScript Examples

### React Component with MUI Theme Support

```tsx
// Component with MANDATORY theme support
import { Box, Button, Typography, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

interface GameSessionCardProps {
    title: string;
    description: string;
    playerCount: number;
    onJoin: () => void;
}

export const GameSessionCard: React.FC<GameSessionCardProps> = ({
    title,
    description,
    playerCount,
    onJoin
}) => {
    const theme = useTheme(); // REQUIRED for theme access

    return (
        <Card
            sx={{
                padding: theme.spacing(2),
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                },
            }}
        >
            <CardContent>
                <Typography
                    variant="h5"
                    color="primary"
                    gutterBottom
                >
                    {title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginBottom: theme.spacing(2) }}
                >
                    {description}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', marginBottom: theme.spacing(2) }}
                >
                    Players: {playerCount}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onJoin}
                    fullWidth
                >
                    Join Session
                </Button>
            </CardContent>
        </Card>
    );
};
```

### Redux Toolkit Slice with RTK Query

```tsx
// RTK Query API definition
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface GameSession {
    id: string;
    title: string;
    ownerId: string;
    players: Participant[];
    isActive: boolean;
}

export interface CreateGameSessionRequest {
    title: string;
    description?: string;
}

export const gameSessionApi = createApi({
    reducerPath: 'gameSessionApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['GameSession'],
    endpoints: (builder) => ({
        getGameSession: builder.query<GameSession, string>({
            query: (id) => `/sessions/${id}`,
            providesTags: (result, error, id) => [{ type: 'GameSession', id }],
        }),
        getAllGameSessions: builder.query<GameSession[], void>({
            query: () => '/sessions',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'GameSession' as const, id })),
                          { type: 'GameSession', id: 'LIST' },
                      ]
                    : [{ type: 'GameSession', id: 'LIST' }],
        }),
        createGameSession: builder.mutation<GameSession, CreateGameSessionRequest>({
            query: (data) => ({
                url: '/sessions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'GameSession', id: 'LIST' }],
        }),
        deleteGameSession: builder.mutation<void, string>({
            query: (id) => ({
                url: `/sessions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'GameSession', id }],
        }),
    }),
});

export const {
    useGetGameSessionQuery,
    useGetAllGameSessionsQuery,
    useCreateGameSessionMutation,
    useDeleteGameSessionMutation,
} = gameSessionApi;
```

### Redux Slice for Local State

```tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GameSessionState {
    selectedSessionId: string | null;
    isLoading: boolean;
}

const initialState: GameSessionState = {
    selectedSessionId: null,
    isLoading: false,
};

export const gameSessionSlice = createSlice({
    name: 'gameSession',
    initialState,
    reducers: {
        selectSession: (state, action: PayloadAction<string>) => {
            state.selectedSessionId = action.payload;
        },
        clearSelection: (state) => {
            state.selectedSessionId = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { selectSession, clearSelection, setLoading } = gameSessionSlice.actions;
export default gameSessionSlice.reducer;
```

### Custom Hook Pattern

```tsx
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useGetGameSessionQuery } from '@store/gameSessionApi';

export const useGameSession = (sessionId: string | null) => {
    const dispatch = useAppDispatch();
    const [isReady, setIsReady] = useState(false);

    const { data: session, isLoading, error } = useGetGameSessionQuery(
        sessionId ?? '',
        { skip: !sessionId }
    );

    useEffect(() => {
        setIsReady(!!session && !isLoading);
    }, [session, isLoading]);

    const canJoin = session?.isActive && isReady;

    return {
        session,
        isLoading,
        error,
        isReady,
        canJoin,
    };
};
```

### Form Component with Validation

```tsx
import { TextField, Button, Box, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';

interface CreateSessionFormProps {
    onSubmit: (title: string, description: string) => void;
    isLoading?: boolean;
}

export const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
    onSubmit,
    isLoading = false
}) => {
    const theme = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [titleError, setTitleError] = useState('');

    const validateTitle = (value: string) => {
        if (!value.trim()) {
            setTitleError('Title is required');
            return false;
        }
        if (value.length < 3) {
            setTitleError('Title must be at least 3 characters');
            return false;
        }
        setTitleError('');
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateTitle(title)) {
            onSubmit(title, description);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(2),
                padding: theme.spacing(3),
                backgroundColor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius,
            }}
        >
            <TextField
                label="Session Title"
                value={title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    validateTitle(e.target.value);
                }}
                error={!!titleError}
                helperText={titleError}
                fullWidth
                required
            />
            <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
            />
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading || !!titleError}
                fullWidth
            >
                {isLoading ? 'Creating...' : 'Create Session'}
            </Button>
        </Box>
    );
};
```

---

## Testing Examples

### xUnit Backend Test with FluentAssertions

```csharp
using FluentAssertions;
using NSubstitute;
using VttTools.Game.Services;
using VttTools.Game.Storage;
using Xunit;

namespace VttTools.Game.UnitTests.Services;

public class GameSessionServiceTests {
    private readonly IGameSessionStorage _storage;
    private readonly GameSessionService _sut; // System Under Test

    public GameSessionServiceTests() {
        // Arrange - setup mocks
        _storage = Substitute.For<IGameSessionStorage>();
        _sut = new GameSessionService(_storage);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsSession() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        var expectedSession = new GameSession {
            Id = sessionId,
            Title = "Test Session"
        };
        _storage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>())
            .Returns(expectedSession);

        // Act
        var result = await _sut.GetByIdAsync(sessionId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedSession);
        await _storage.Received(1).GetByIdAsync(sessionId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentId_ReturnsNull() {
        // Arrange
        var sessionId = Guid.CreateVersion7();
        _storage.GetByIdAsync(sessionId, Arg.Any<CancellationToken>())
            .Returns((GameSession?)null);

        // Act
        var result = await _sut.GetByIdAsync(sessionId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsCreatedSession() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new CreateGameSessionData { Title = "New Session" };

        // Act
        var result = await _sut.CreateAsync(userId, data);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.StatusCode.Should().Be(HttpStatusCode.Created);
        result.Is<GameSession>(out var session).Should().BeTrue();
        session!.Title.Should().Be("New Session");
        session.OwnerId.Should().Be(userId);
        await _storage.Received(1).AddAsync(
            Arg.Is<GameSession>(s => s.Title == "New Session"),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task CreateAsync_WithInvalidData_ReturnsBadRequest() {
        // Arrange
        var userId = Guid.CreateVersion7();
        var invalidData = new CreateGameSessionData { Title = "" }; // Invalid empty title

        // Act
        var result = await _sut.CreateAsync(userId, invalidData);

        // Assert
        result.IsError.Should().BeTrue();
        result.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        result.GetErrors().Should().NotBeEmpty();
        await _storage.DidNotReceive().AddAsync(
            Arg.Any<GameSession>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Theory]
    [InlineData("Session 1")]
    [InlineData("My Game Session")]
    [InlineData("Test")]
    public async Task CreateAsync_WithValidTitles_ReturnsCreatedSession(string title) {
        // Arrange
        var userId = Guid.CreateVersion7();
        var data = new CreateGameSessionData { Title = title };

        // Act
        var result = await _sut.CreateAsync(userId, data);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Is<GameSession>(out var session).Should().BeTrue();
        session!.Title.Should().Be(title);
    }
}
```

### Vitest Frontend Test with Testing Library

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CreateSessionForm } from './CreateSessionForm';

describe('CreateSessionForm', () => {
    let mockOnSubmit: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnSubmit = vi.fn();
    });

    it('should call onSubmit with title and description when form is submitted', async () => {
        // Arrange
        render(<CreateSessionForm onSubmit={mockOnSubmit} />);

        // Act
        const titleInput = screen.getByLabelText(/session title/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const submitButton = screen.getByRole('button', { name: /create session/i });

        fireEvent.change(titleInput, { target: { value: 'My Game Session' } });
        fireEvent.change(descriptionInput, { target: { value: 'A fun session' } });
        fireEvent.click(submitButton);

        // Assert
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith('My Game Session', 'A fun session');
        });
    });

    it('should display error message when title is empty', async () => {
        // Arrange
        render(<CreateSessionForm onSubmit={mockOnSubmit} />);

        // Act
        const titleInput = screen.getByLabelText(/session title/i);
        const submitButton = screen.getByRole('button', { name: /create session/i });

        fireEvent.change(titleInput, { target: { value: '' } });
        fireEvent.click(submitButton);

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        });
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should display error message when title is too short', async () => {
        // Arrange
        render(<CreateSessionForm onSubmit={mockOnSubmit} />);

        // Act
        const titleInput = screen.getByLabelText(/session title/i);
        fireEvent.change(titleInput, { target: { value: 'ab' } });

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
        });
    });

    it('should disable submit button when isLoading is true', () => {
        // Arrange & Act
        render(<CreateSessionForm onSubmit={mockOnSubmit} isLoading={true} />);

        // Assert
        const submitButton = screen.getByRole('button', { name: /creating/i });
        expect(submitButton).toBeDisabled();
    });
});
```

---

## PowerShell Script Examples

### Standard VTTTools Script Template

```powershell
#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Brief description of script purpose

.DESCRIPTION
    Detailed description of what the script does

.PARAMETER Environment
    Target environment (Development, Staging, Production)

.PARAMETER Configuration
    Build configuration (Debug, Release)

.EXAMPLE
    pwsh -ExecutionPolicy Bypass -File script.ps1
    pwsh -ExecutionPolicy Bypass -File script.ps1 -Environment Production

.NOTES
    Author: VTTTools Development Team
    Requires: PowerShell Core 7.0+
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Development', 'Staging', 'Production')]
    [string]$Environment = 'Development',

    [Parameter(Mandatory=$false)]
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Ensure script stops on errors
$ErrorActionPreference = "Stop"

# Set encoding for cross-platform compatibility
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

#region Functions

function Write-Header {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Success {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-ErrorMessage {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Invoke-BuildSolution {
    Write-Header "Building VTTTools Solution"

    # CRITICAL: Use VttTools.slnx
    dotnet restore VttTools.slnx
    if ($LASTEXITCODE -ne 0) {
        throw "Restore failed with exit code $LASTEXITCODE"
    }

    dotnet build VttTools.slnx --configuration $Configuration --no-restore
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }

    Write-Success "Solution built successfully"
}

function Invoke-RunTests {
    Write-Header "Running Tests"

    dotnet test VttTools.slnx --no-build --configuration $Configuration --collect:"XPlat Code Coverage"
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed with exit code $LASTEXITCODE"
    }

    Write-Success "All tests passed"
}

function Invoke-BuildFrontend {
    Write-Header "Building Frontend"

    $frontendPath = Join-Path $PSScriptRoot ".." "Source" "WebClientApp"
    Push-Location $frontendPath
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }

        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "npm build failed"
        }

        Write-Success "Frontend built successfully"
    }
    finally {
        Pop-Location
    }
}

#endregion

#region Main Execution

try {
    Write-Header "VTTTools Build Script"
    Write-Host "Environment: $Environment" -ForegroundColor Yellow
    Write-Host "Configuration: $Configuration" -ForegroundColor Yellow

    # Execute main logic
    Invoke-BuildSolution
    Invoke-RunTests
    Invoke-BuildFrontend

    Write-Host "`n" -NoNewline
    Write-Success "Script completed successfully"
    exit 0
}
catch {
    Write-Host "`n" -NoNewline
    Write-ErrorMessage "Script failed: $_"
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    exit 1
}

#endregion
```

### Cross-Platform Path Handling Examples

```powershell
# ✅ CORRECT: Cross-platform path handling
$scriptRoot = $PSScriptRoot
$sourcePath = Join-Path $scriptRoot "Source" "Assets"
$configPath = Join-Path $sourcePath "appsettings.json"

# ❌ INCORRECT: Windows-specific (breaks on Linux/macOS)
# $sourcePath = "$scriptRoot\Source\Assets"
# $configPath = "$sourcePath\appsettings.json"

# ✅ CORRECT: Platform-agnostic file operations
$content = Get-Content $configPath -Raw -Encoding UTF8
$json = $content | ConvertFrom-Json
$json.ConnectionString = $newConnectionString
$json | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

# ✅ CORRECT: Check command exists
$dotnetCmd = Get-Command dotnet -ErrorAction SilentlyContinue
if (-not $dotnetCmd) {
    throw ".NET SDK not found in PATH"
}

# ✅ CORRECT: Check exit codes
dotnet build VttTools.slnx
if ($LASTEXITCODE -ne 0) {
    throw "Build failed with exit code $LASTEXITCODE"
}
```

---

## Database Migration Examples

### Creating a Migration

```bash
# Create new migration
dotnet ef migrations add CreateGameSessions --project Source/Data --startup-project Source/Assets

# View migration SQL without applying
dotnet ef migrations script --project Source/Data --startup-project Source/Assets --output migration.sql
```

### Migration Configuration

```csharp
// EF Core Migration Builder Pattern
public partial class CreateGameSessions : Migration {
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateTable(
            name: "GameSessions",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false)
            },
            constraints: table => {
                table.PrimaryKey("PK_GameSessions", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_GameSessions_OwnerId",
            table: "GameSessions",
            column: "OwnerId");
    }

    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(name: "GameSessions");
    }
}
```

---

## Related Documentation

- **Technology Stack**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Common Commands**: `Documents/Guides/COMMON_COMMANDS.md`
- **Coding Standards**: `Documents/Guides/CODING_STANDARDS.md`
- **Testing Guide**: `Documents/Guides/TESTING_GUIDE.md`
