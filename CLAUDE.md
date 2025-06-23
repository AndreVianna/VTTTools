This file provides guidance on how to working with the project in this repository.

# Project Description
- This project is .NET 9 C# Aspire Solution called VTTTools.
It creates a Virtual Table Top (VTT) RPG Game interface for online play. It provides tools to help Dungeon Masters (DMs) and players set up and play tabletop role-playing games online, including maps, tokens, dice rolling, and chat functionality.

# Key Files (**IMPORTANT!** YOU MUST READ THESE FILES)
@Design/INSTRUCTIONS.md - Agent instructions and coding standards
@Design/ROADMAP.md - Project roadmap with implementation phases
@Design/PROJECT_DEFINITION.md - Project description, structure and design.
@Design/PROJECT_STRUCTURE.md - Current file/folder structure of the project.

# Tools

## Aspire Application Launcher (Primary Development Tool)
- **runapp.sh** - Two-phase Aspire development launcher that solves Podman/WSL environment issues:
  - **Full development startup**: `./runapp.sh`
  - **Quick restart (no build)**: `./runapp.sh --no-build`
  - **Build and test validation**: `./runapp.sh --build-only --run-tests`
  - **Development with testing**: `./runapp.sh --run-tests`
  - **Preserve containers (debugging)**: `./runapp.sh --no-cleanup`

### Script Benefits:
- Solves mount propagation issues in WSL/Podman environments
- Automatic cleanup of stale containers and networks
- Reliable two-phase build and run process
- Access to Aspire dashboard for service monitoring
- Health check endpoint testing across all services

## dotnet CLI (Alternative/Component Commands):
  - use the following solution file: `VTTTools.sln`
  - migrations folder: `VTTTools.Data/Migrations`
  - commands:
    - Build: cd Source && dotnet build VTTTools.sln && cd -
    - Test: cd Source && dotnet test VTTTools.sln && cd -
    - Add Migrations: cd Source/Data && dotnet ef migrations add {Migration_Name} -o Migrations

## Health Check Endpoints (Available when running with runapp.sh)
All services provide detailed JSON health responses:
- **Assets Service**: `https://localhost:7001/health` - Database connectivity
- **Game Service**: `https://localhost:7002/health` - Database connectivity  
- **Library Service**: `https://localhost:7003/health` - Database connectivity
- **Media Service**: `https://localhost:7004/health` - Database + Azure Blob Storage
- **WebApp Service**: `https://localhost:7005/health` - Database connectivity
- **Aspire Dashboard**: Available at URL shown in runapp.sh output for service monitoring

# Available MCP Servers

Claude Code has access to several Model Context Protocol (MCP) servers that extend capabilities beyond basic functionality:

## 1. Thinking MCP Server IMPORTANT!!
- **Purpose**: Advanced reasoning and problem-solving through structured thought processes
- **Use Cases**:
- Complex analysis and multi-step reasoning
- Architectural decisions and design planning
- Debugging complex logic and troubleshooting
- **When to Use**: Breaking down complex problems, planning development phases, analyzing system architecture

## 2. Memory MCP Server IMPORTANT!!
- **Purpose**: Knowledge graph management for persistent information storage
- **Use Cases**:
- Project documentation and context preservation across sessions
- Tracking entity relationships and project structure
- Information retrieval from previous conversations
- **When to Use**: Documenting architecture, maintaining development context, remembering complex project details
- **IMPORTANT!!**: Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
- Always refer to your knowledge graph as your "memory"

## 3. Microsoft Docs MCP Server
- **Purpose**: Search official Microsoft documentation and learning resources
- **Use Cases**:
- .NET development questions and API references
- Azure documentation lookup and service guidance
- Blazor, Entity Framework, and C# best practices
- **When to Use**: Need authoritative Microsoft documentation for .NET 9, C#, Blazor, Azure, or any other Microsoft technologies

## 4. Playwright MCP Server
- **Purpose**: Web browser automation and testing
- **Use Cases**:
- Automated web testing and UI verification
- Screenshot capture and form filling
- Generating automated test scripts
- **When to Use**: Testing Blazor applications, automating browser interactions, capturing UI states

## 5. Calculator MCP Server
- **Purpose**: Mathematical calculations and expression evaluation
- **Use Cases**:
- Mathematical problem solving and formula evaluation
- Unit conversions and computational needs
- **When to Use**: Any mathematical calculations or formula verification

