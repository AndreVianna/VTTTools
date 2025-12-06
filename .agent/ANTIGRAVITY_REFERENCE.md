# Antigravity Reference: VTTTools

> [!IMPORTANT]
> This is the **authoritative quick reference** for the VTTTools agentic workflow. Adhere to these rules strictly.

## 1. Coding Rules (Non-Negotiable)

### Backend (C# 14 / .NET 10)
- **Formatting**: K&R braces, file-scoped namespaces, 4-space indent.
- **Language Features**:
  - Always use `var` for locals.
  - Use primary constructors: `class Service(IDep dep)`.
  - Use collection expressions: `List<int> x = [];`.
  - Use pattern matching: `if (x is null)`.
  - **NEW**: Use `field` keyword for auto-properties needing validation.
- **Architecture (DDD Strict Flow)**:
  - **Endpoint**: Configures routes & Auth (`RequiresAuthorization`). **NO LOGIC**.
  - **Handlers**: Maps Request -> Data, calls Service, maps Result -> HTTP.
  - **Services**: **ALL Business Logic**, permissions, policies, & persistence calls.
  - **Infrastructure**: Storage/Cloud implementation. **NO BUSINESS LOGIC**.
- **Testing**: xUnit + FluentAssertions. Coverage ≥ 80%.

### Frontend (React 18 / TS 5)
- **Strict Mode**: No `any`, strict null checks.
- **Components**: Functional components only. Props interface suffix `Props`.
- **State**: Redux Toolkit (global) + RTK Query (API).
- **Theme (CRITICAL)**:
  - **MANDATORY**: All components MUST use `useTheme()` and support dark/light modes.
  - Use `sx` prop for styling.
  - No hardcoded hex colors (use `theme.palette.*`).
- **Testing**: Vitest + Testing Library. Coverage ≥ 70%.

### PowerShell Protocols
- **Shell**: `pwsh` (PowerShell Core) ONLY.
- **Paths**: Use `Join-Path` (never hardcode `\` or `/`).
- **Safety**: `$ErrorActionPreference = "Stop"` at top of scripts.

---

## 2. Agent Personas

Invoke these personas proactively based on the task type.

| Persona | Trigger / Responsibility | Key Tools/Actions |
| :--- | :--- | :--- |
| **`solution-engineer`** | **Architecture & Complexity**<br>Use for detailed analysis, design patterns, technology decisions, and gap analysis. | `mcp__thinking__sequentialthinking`<br>Analyzes `VttTools.slnx`, `DOCS/Guides/*` |
| **`task-organizer`** | **Planning & Breakdown**<br>Use to break massive user requests into tracked tasks in `task.md`. | `task_boundary`, `task.md`<br>Creates roadmap, manages dependencies. |
| **`code-reviewer`** | **Quality & Security**<br>Use after drafting code to verify standards, security (OWASP), and test coverage. | `grep`, `lint`<br>Checks K&R braces, `var` usage, theme support. |
| **`backend-developer`** | **Core Implementation (C#)**<br>Implementing features, services, EF Core migrations, and backend tests. | `dotnet build`, `dotnet test`<br>Uses `Result<T>`, Primary Constructors. |
| **`frontend-developer`** | **UI Implementation (React)**<br>Building components, hooks, and managing Redux state. | `npm run dev`, `vitest`<br>Ensures `useTheme()` usage, RTK Query integration. |
| **`ux-designer`** | **Visual Design & Accessibility**<br>Designing layouts, ensuring accessibility (WCAG), and selecting MUI components. | `generate_image`, `theme.palette`<br>Focuses on Dark/Light mode, WCAG AA. |
| **`test-automation-developer`** | **QA & BDD**<br>Writing comprehensive test suites, BDD scenarios, and integration tests. | `dotnet test`, `npm test`<br>Enforces AAA pattern, FluentAssertions. |
| **`devops-specialist`** | **CI/CD & Infrastructure**<br>Build automation, Azure deployment, and cross-platform scripting. | `pwsh`, `Azure CLI`<br>Maintains `VttTools.slnx` builds, `health-checks`. |
| **`shell-developer`** | **Scripting & Automation**<br>Creating robust, cross-platform PowerShell maintenance scripts. | `pwsh`<br>Uses `Join-Path`, colored output. |

---

## 3. Essential Commands

### Backend (.NET 10)
```bash
# Build (Always use solution file)
dotnet build VttTools.slnx

# Test (Backend)
dotnet test VttTools.slnx --collect:"XPlat Code Coverage"

# EF Core Migrations
dotnet ef migrations add <Name> --project Source/Data --startup-project Source/Assets
dotnet ef database update --project Source/Data --startup-project Source/Assets
```

### Frontend (NPM)
```bash
cd Source/WebClientApp
npm install
npm run dev        # Hot reload dev server
npm test -- --run  # Run unit tests once
npm run lint       # Verify standards
```

### Automation
```powershell
# Run cross-platform script
pwsh -ExecutionPolicy Bypass -File .claude/scripts/setup.ps1
```

---

## 4. Common Pitfalls (DO NOT DO)

- ❌ **Do not** use `VttTools.sln` (Use `.slnx`).
- ❌ **Do not** create "utils" classes (Use extension methods).
- ❌ **Do not** return Exceptions from services (Use `Result<T>`).
- ❌ **Do not** hardcode colors in React (Use `theme.palette`).
- ❌ **Do not** use `console.log` in production code.
- ❌ **Do not** hardcode file paths (Use `Join-Path` or `Path.Combine`).
