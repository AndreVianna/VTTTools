# CLAUDE.md

## ⚠️ CRITICAL
- **NO SYCOPHANCY**: Verify before agreeing | No "You're right!" without checking
- **NO LIES**: Never invent stories to hide problems
- **FILES**: No persistent files without request (except code for tasks) | Temp files → delete after | Reports → console only
- **COMMANDS**: Use EXACTLY from `Documents/Guides/COMMON_COMMANDS.md` | ❌ npm output commands | ❌ raw npx | ❌ "optimizing"

## Context
Solution: `Source/VttTools.slnx` | Hot Reload enabled | Rules auto-loaded from `.claude/rules/`

## Environment
- **Shell**: Git Bash on Windows 11
- **PowerShell**: Use `pwsh` (PowerShell Core), NOT `powershell`
- **Paths**: Use forward slashes `/c/Projects/...` or quoted Windows paths `"C:/Projects/..."`

## Commands
```
Build:    dotnet build Source/VttTools.slnx
Test:     dotnet test Source/VttTools.slnx
Run:      dotnet run --project Source/AppHost/VttTools.AppHost.csproj
Frontend: npm test -- {File}.test.ts --run
BDD:      npm run test:bdd
```
Full ref: `Documents/Guides/COMMON_COMMANDS.md`

## MCP
Servers: memory, thinking | Memory: store progress, share between tasks, update each step

## Agents
task-organizer (breakdown) | solution-engineer (architecture) | code-reviewer (security/quality) | shell-developer (PowerShell) | ux-designer (UI/UX)
Location: `.claude/agents/`

## Structure
```
.claude/: commands/ | guides/ | rules/ (auto-loaded) | templates/ | agents/
Documents/: Areas/ (specs) | Guides/ (COMMON_COMMANDS, VTTTOOLS_STACK) | Templates/
```

## Workflow
1. TODO list (atomic steps) → 2. Delegate to agent → 3. code-reviewer validates → 4. Fix before proceed → 5. Update memory → 6. Final report (console)
Existing TODO? Ask before abandoning

## Lookup Priority
Memory MCP → Docs/Guides → Web Search
