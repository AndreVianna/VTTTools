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

- dotnet CLI:
  - location "/home/andre/.dotnet/dotnet" or "~/.dotnet/dotnet"
  - use the folloing solution file: `VTTTools.sln`
  - migrations folder: `VTTTools.Data/Migrations`

# Memory

100% Test Success Strategy - Test Code Only Changes

CRITICAL CONSTRAINT: NO SOURCE CODE CHANGES

Only modify: Test files, helper classes, mock objects in UnitTests projects
Never modify: Any files in main Source projects (except UnitTests folders)

Current Status: 140/166 passing (26 failing tests) - TARGET: 166/166 (100%)

Phase 1: NavigationManager Infrastructure Fix (11 AdventureHandler tests)

Problem: NavigationManagerProxy has not been initialized + Expected EnsureInitialized() call

Test-Only Solution:
1. Remove Custom NavigationManager Substitute: Stop creating Substitute.For<NavigationManager>()
2. Use ComponentTestContext NavigationManager: Leverage existing FakeNavigationManager from base class
3. Proper Mock Setup: Configure NavigationManager state in test constructor without affecting source code

Changes in AdventureHandlerTests.cs:
- Remove _mockNavigationManager field
- Use NavigationManager from ComponentTestContext base class
- Configure FakeNavigationManager properly in constructor
- Update assertion patterns to work with FakeNavigationManager

Phase 2: Component Service Registration Fix (7 AdventurePage tests)

Problem: Cannot provide a value for property 'HttpContextAccessor' during component rendering

Test-Only Solution:
1. Enhanced ComponentTestContext: Modify test infrastructure to register IHttpContextAccessor for component pipeline
2. Component-Specific Registration: Add services required for component instantiation
3. Registration Timing: Ensure services available before component rendering

Changes in ComponentTestContext.cs:
- Add component-specific service registrations
- Ensure IHttpContextAccessor available for component DI pipeline
- Add any missing service registrations for component tests

Phase 3: EmailPage AccountOwner Fix (8 EmailPage tests)

Problem: AccountOwner.EmailConfirmed NullReferenceException in component rendering

Test-Only Solution:
1. Component Parameter Injection: Provide AccountOwner directly to components in test
2. Enhanced Mock Configuration: Configure UserManager/cascading parameters properly
3. Test Data Setup: Ensure proper user data flow without source changes

Changes in EmailPageTests.cs:
- Modify RenderComponent calls to provide AccountOwner parameter
- Configure cascading parameters properly
- Enhance UserManager mock setup

Implementation Principles - Test Code Only

Allowed Changes:

✅ Modify any files in *UnitTests projects
✅ Update ComponentTestContext.cs
✅ Change test setup, mocks, assertions
✅ Add test helper methods/classes
✅ Modify test infrastructure

Forbidden Changes:

❌ Any Source project files (except UnitTests)
❌ Production component code
❌ Handler implementation
❌ Service implementations
❌ Domain/Business logic

Execution Strategy

1. Incremental Fixes: Fix one test category at a time
2. Validation: Run tests after each change to ensure no regressions
3. Pattern Application: Use working test patterns as templates
4. Test Infrastructure: Enhance ComponentTestContext to support all scenarios

Success Criteria

- 166/166 tests passing (100%)
- Zero source code modifications
- Only test infrastructure and test code changes
- Maintainable test patterns
