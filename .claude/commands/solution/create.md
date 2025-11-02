---
allowed-tools: mcp__memory__*, mcp__thinking__*, Task, Read, Write, Bash, TodoWrite
description: Create solution specification via guided Q&A process
argument-hint: {solution_name:string:optional}
---

# Create Solution

Generate comprehensive solution specification through interactive Q&A covering architecture, bounded contexts, and technical foundations.

## 1. Initialization
- Validate solution_name (or use current directory name if empty)
- Check for existing SOLUTION.md (offer to overwrite with confirmation)
- Verify SOLUTION_TEMPLATE.md exists in .claude/templates/
- Initialize solution entity in memory with status: analyzing

## 2. Solution Analysis
Delegate to solution-engineer:
```
ROLE: Solution Architect

TASK: Design solution "{solution_name}" through interactive Q&A

QUESTION SEQUENCE:
1. IDENTITY: Product type, description, target users, primary workflow, interface type, interaction method
2. ARCHITECTURE: Architecture patterns (Clean, Hexagonal, DDD), bounded contexts (min 3), domain interactions
3. TECHNOLOGY STACK: Backend platform, frontend platform, database, deployment target, external integrations
4. FEATURES: Core business capabilities (high-level feature list)
5. DOMAINS: Bounded contexts with entities, aggregates, ubiquitous language terms (10+ per context)

OUTPUT:
STATUS: [analysis_needed|ready]
VARIABLES: {all extracted variables for template}
QUESTIONS: [if analysis_needed]
```

**If analysis_needed**: Collect user input (max 5 questions per iteration), iterate
**If ready**: Extract variables, store observations in memory

## 3. Architecture Validation
- Verify bounded contexts clearly defined (minimum 3)
- Check domain interactions documented
- Validate ubiquitous language defined (10+ terms)
- Ensure architecture patterns specified (Clean + Hexagonal + DDD)
- Validate technology stack complete with versions

## 4. Generate Solution Specification
- Load SOLUTION_TEMPLATE.md
- Apply DSL variable substitution
- Write to: Documents/SOLUTION.md
- Create Documents/ folder structure if not exists
- Create Documents/Areas/ folder for each bounded context

## 5. Generate Solution Status Tracker
- Load SOLUTION_STATUS_TEMPLATE.md
- Apply DSL substitution with initial values:
  - last_updated: {current_date}
  - solution_version: 1.0.0
  - overall_percent: 0%
  - overall_grade: N/A (not started)
  - Phase 1/2/3 progress: 0%
- Write to: Documents/SOLUTION_STATUS.md

## 6. Memory Storage
- Create solution entity in memory
- Store all extracted variables as observations
- Create bounded context entities
- Create solution→context relationships
- Mark status: specification_ready

## 7. Description Refinement
- Use solution-engineer to create refined description from complete spec
- Update solution document with refined description
- Update memory observations

## 8. Completion
Report:
```
✓ SOLUTION CREATED: {solution_name}

Architecture: {architecture_patterns}
Bounded Contexts: {context_count}
Tech Stack: {platform_summary}

Created:
- Documents/SOLUTION.md
- Documents/SOLUTION_STATUS.md

Next Steps:
- Review specification
- Add domain models: /domain:add {area_name}
- Add features: /feature:add {feature_name}
- Validate: /solution:validate
- Track progress: /solution:display
```

**Note**: Establishes architectural foundation for entire project. Run once at project inception.
