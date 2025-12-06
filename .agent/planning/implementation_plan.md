# Environment Setup Plan

The goal is to configure the "Antigravity" agent to work effectively with the VTTTools repository, replicating the capabilities provided by the existing Claude Code configuration.

## Proposed Changes

### Workflows
Create the following workflow files in `.agent/workflows/` to provide quick access to common commands defined in `Documents/Guides/COMMON_COMMANDS.md`.

#### [NEW] [build.md](file:///C:/Users/andre.vianna/.gemini/antigravity/brain/df2c68f9-21fb-48e7-8f28-d5cb9a72cf05/.agent/workflows/build.md)
 Workflow to build the backend solution.
 - Command: `dotnet build Source/VttTools.slnx`

#### [NEW] [test-backend.md](file:///C:/Users/andre.vianna/.gemini/antigravity/brain/df2c68f9-21fb-48e7-8f28-d5cb9a72cf05/.agent/workflows/test-backend.md)
 Workflow to run backend unit tests.
 - Command: `dotnet test Source/VttTools.slnx`

#### [NEW] [test-frontend.md](file:///C:/Users/andre.vianna/.gemini/antigravity/brain/df2c68f9-21fb-48e7-8f28-d5cb9a72cf05/.agent/workflows/test-frontend.md)
 Workflow to run frontend unit tests.
 - Command: `cd Source/WebClientApp` then `npm test -- --run`

#### [NEW] [run-frontend.md](file:///C:/Users/andre.vianna/.gemini/antigravity/brain/df2c68f9-21fb-48e7-8f28-d5cb9a72cf05/.agent/workflows/run-frontend.md)
 Workflow to start the frontend development server.
 - Command: `cd Source/WebClientApp` then `npm run dev`

### Configuration
- Review `task.md` to ensure it reflects the ongoing work structure.
- Rely on `CLAUDE.md` as the primary source of truth for project rules and architecture (already analyzed).

## Verification Plan

### Automated Verification
- Run `dotnet --version` to verify .NET environment.
- Run `npm --version` to verify Node.js environment.
- Execute the `build` workflow (or equivalent command) to verify the build process works.

### Manual Verification
- User can verify that the workflows are available and functional.

# Standards Upgrade (.NET 10 / C# 14)

## Goal
Update project documentation to enforce the use of .NET 10 and C# 14 features, treating them as the current standard.

## Documentation Updates

### [MODIFY] [VTTTOOLS_STACK.md](file:///c:/Projects/Personal/VTTTools/Documents/Guides/VTTTOOLS_STACK.md)
- Update Backend Technology from .NET 9 to **.NET 10**.
- Update Language version to **C# 14**.

### [MODIFY] [CODING_STANDARDS.md](file:///c:/Projects/Personal/VTTTools/Documents/Guides/CODING_STANDARDS.md)
- Reflect new version requirements in Overview and Tech Stack sections.

### [MODIFY] [CSHARP_STYLE_GUIDE.md](file:///c:/Projects/Personal/VTTTools/Documents/Guides/CSHARP_STYLE_GUIDE.md)
- Update language version references.
- Add hypothetical/anticipated C# 14 features if relevant (e.g., `field` keyword for auto-properties).

