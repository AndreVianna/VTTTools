# Claude Code Subagents Creation Guide

This comprehensive guide covers everything you need to know about creating and managing specialized Claude Code subagents based on official documentation, community best practices, and proven patterns from production repositories.

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Architecture & Concepts](#architecture--concepts)
4. [Configuration Reference](#configuration-reference)
5. [Subagent Types & Specializations](#subagent-types--specializations)
6. [Best Practices](#best-practices)
7. [Integration Patterns](#integration-patterns)
8. [Real-World Examples](#real-world-examples)
9. [Performance & Resource Management](#performance--resource-management)
10. [Advanced Features](#advanced-features)
11. [Community Resources](#community-resources)
12. [Troubleshooting](#troubleshooting)

## Introduction

Claude Code subagents are specialized AI assistants that operate with their own context windows, custom system prompts, and specific tool permissions. They transform Claude from a single assistant into a coordinated team of domain experts, each focused on particular aspects of software development.

### Benefits

- **Context Isolation**: Each subagent maintains separate context, preventing pollution of main conversation
- **Domain Expertise**: Specialized knowledge and approaches for specific tasks
- **Parallel Processing**: Multiple subagents can work on different aspects simultaneously
- **Consistent Behavior**: Pre-configured responses and methodologies for recurring tasks
- **Team Collaboration**: Shareable expertise across development teams

### Use Cases

- **Code Review & Security**: Specialized analysis with consistent standards
- **Architecture & Design**: System design expertise and pattern recommendations
- **Testing & QA**: Automated test generation and quality assurance
- **Documentation**: Specialized technical writing and maintenance
- **DevOps & Deployment**: Infrastructure and deployment automation
- **Debugging & Analysis**: Systematic problem-solving approaches

### When to Use Subagents vs Direct Approaches

| Scenario | Subagents | Direct Claude | Slash Commands |
|----------|-----------|---------------|----------------|
| Specialized expertise needed | ✓ Best | Limited | Limited |
| Context preservation critical | ✓ Best | Poor | Good |
| Complex multi-step workflows | ✓ Best | Good | ✓ Best |
| Simple one-off tasks | Overkill | ✓ Best | Good |
| Team standardization | ✓ Best | Poor | Good |

## Quick Start

### 1. Create Your First Subagent

```bash
# Navigate to your project directory
cd your-project
mkdir -p .claude/agents

# Create a simple code reviewer subagent
cat > .claude/agents/code-reviewer.md << 'EOF'
---
name: code-reviewer
description: Specialized code review focusing on best practices, security, and maintainability
tools: file_read,git_log,git_diff
model: sonnet
---

# Code Review Specialist

You are an expert code reviewer with deep knowledge of:
- Security vulnerabilities and OWASP compliance
- Code quality and maintainability principles
- Performance optimizations and best practices
- Testing coverage and quality

## Review Process
1. Analyze code structure and architecture
2. Identify security vulnerabilities
3. Check for code quality issues
4. Suggest improvements and alternatives
5. Verify test coverage adequacy

Focus on actionable feedback with specific line references and improvement suggestions.
EOF
```

### 2. Using Your Subagent

Subagents can be invoked in two ways:

**Automatic Delegation**: Claude Code automatically routes tasks based on context

```markdown
Please review the recent changes in src/auth/login.js for security issues.
```

**Explicit Invocation**: Mention the subagent by name

```markdown
@code-reviewer please analyze the authentication logic in our login system.
```

### 3. Managing Subagents

Use the built-in `/agents` command to create, edit, and manage subagents interactively:

```markdown
/agents
```

## Architecture & Concepts

### Execution Model

Subagents operate in a sophisticated execution model designed for specialized task handling:

- **Separate Context Windows**: Each subagent maintains independent context, preventing cross-contamination
- **Task Delegation**: Claude Code intelligently routes tasks based on subagent descriptions and current context
- **Resource Isolation**: Tool access and permissions are scoped per subagent
- **Parallel Processing**: Multiple subagents can work simultaneously on different aspects

### Context Management

```markdown
Main Claude Session
├── General conversation context
├── Project overview and recent changes
└── Subagent Delegations
    ├── Code Reviewer Context (isolated)
    ├── Security Analyst Context (isolated)
    └── Test Engineer Context (isolated)
```

### Lifecycle Phases

1. **Registration**: Subagent defined and loaded from markdown file
2. **Activation**: Task context matches subagent description triggers
3. **Execution**: Subagent processes task with specialized context
4. **Response**: Results integrated back into main conversation
5. **Deactivation**: Subagent context cleaned up when task complete

### Communication Patterns

- **Upstream**: Main Claude → Subagent (task delegation)
- **Downstream**: Subagent → Main Claude (results and recommendations)
- **Lateral**: Subagent → Subagent (through main Claude coordination)

## Configuration Reference

### File Structure

Subagents are Markdown files with YAML frontmatter stored in specific directories:

```markdown
Project Structure:
├── .claude/
│   └── agents/                 # Project-level subagents (shared via git)
│       ├── code-reviewer.md
│       ├── security-analyst.md
│       └── test-engineer.md
└── ~/.claude/
    └── agents/                 # User-level subagents (personal)
        ├── personal-assistant.md
        └── debugging-expert.md
```

### YAML Frontmatter Reference

```yaml
---
# Required Fields
name: unique-subagent-identifier           # Must be unique, kebab-case
description: When this subagent should be invoked and what it specializes in

# Optional Fields
tools: tool1,tool2,tool3                   # Comma-separated list, inherits all if omitted
model: haiku|sonnet|opus                   # Model selection based on task complexity
context_mode: minimal|standard|comprehensive # Context handling preference
priority: low|normal|high                     # Delegation priority for overlapping descriptions
version: 1.0.0                            # Version for tracking changes
tags: security,review,backend              # Categories for organization
---
```

### Tool Configuration Examples

#### Minimal File Access

```yaml
tools: file_read
```

#### Tool Development Workflow

```yaml
tools: file_read,file_write,terminal,git_log,git_diff
```

#### Full Development Suite

```yaml
tools: file_read,file_write,terminal,git_commit,git_push,git_branch,docker_run,npm_install
```

#### Read-Only Analysis

```yaml
tools: file_read,git_log,terminal(read-only)
```

## Subagent Types & Specializations

### Development & Code Quality

#### Code Reviewer

```yaml
---
name: code-reviewer
description: Comprehensive code review focusing on quality, security, and maintainability
tools: file_read,git_diff,git_log
model: sonnet
---

Expert code reviewer specializing in:
- Security vulnerability detection
- Code quality and maintainability
- Performance optimization opportunities
- Best practice adherence
```

#### Security Analyst

```yaml
---
name: security-analyst
description: Security-focused analysis for vulnerabilities, compliance, and secure coding practices
tools: file_read,terminal
model: opus
---

Cybersecurity specialist focusing on:
- OWASP Top 10 vulnerability detection
- Dependency security analysis
- Secure coding pattern validation
- Compliance and regulatory requirements
```

#### Test Engineer

```yaml
---
name: test-engineer
description: Automated testing strategy, test generation, and quality assurance
tools: file_read,file_write,terminal
model: sonnet
---

Testing specialist responsible for:
- Test strategy and planning
- Automated test generation
- Coverage analysis and improvement
- Testing framework selection and setup
```

### Architecture & Design

#### System Architect

```yaml
---
name: system-architect
description: High-level system design, architecture patterns, and scalability planning
tools: file_read,terminal
model: opus
---

Senior architect specializing in:
- System design and architecture patterns
- Scalability and performance planning
- Technology stack recommendations
- Integration strategy and API design
```

#### Database Designer

```yaml
---
name: database-designer
description: Database schema design, optimization, and data modeling
tools: file_read,terminal
model: sonnet
---

Database expert focusing on:
- Schema design and normalization
- Query optimization and indexing
- Data migration strategies
- Database technology selection
```

### DevOps & Infrastructure

#### Infrastructure Specialist

```yaml
---
name: infrastructure-specialist
description: Cloud infrastructure, containerization, and deployment automation
tools: file_read,file_write,terminal,docker_run
model: sonnet
---

DevOps engineer specializing in:
- Cloud infrastructure design
- Container orchestration and deployment
- CI/CD pipeline optimization
- Monitoring and observability setup
```

#### Performance Optimizer

```yaml
---
name: performance-optimizer
description: Application performance analysis, profiling, and optimization
tools: file_read,terminal
model: opus
---

Performance engineering expert focusing on:
- Application profiling and bottleneck identification
- Resource usage optimization
- Caching strategy implementation
- Load testing and capacity planning
```

### Documentation & Communication

#### Technical Writer

```yaml
---
name: technical-writer
description: Technical documentation, API documentation, and user guides
tools: file_read,file_write
model: sonnet
---

Technical writing specialist responsible for:
- API documentation and examples
- User guides and tutorials
- Architecture documentation
- Code comment and documentation standards
```

#### Project Coordinator

```yaml
---
name: project-coordinator
description: Project planning, task coordination, and development workflow optimization
tools: file_read,git_log
model: haiku
---

Project management specialist focusing on:
- Sprint planning and task breakdown
- Development workflow optimization
- Team coordination and communication
- Progress tracking and reporting
```

## Best Practices

### Design Principles

#### Single Responsibility

Each subagent should excel at one specific domain:

```yaml
# Good - Focused responsibility
name: security-code-reviewer
description: Security-focused code review for vulnerabilities and compliance

# Avoid - Too broad
name: general-helper
description: Helps with coding, testing, documentation, and deployment
```

#### Clear Delegation Triggers

Write descriptions that clearly indicate when the subagent should be invoked:

```yaml
# Good - Specific triggers
description: Automated test generation for React components, API endpoints, and utility functions

# Avoid - Vague descriptions
description: Helps with testing stuff
```

#### Comprehensive System Prompts

Provide detailed context and examples in the system prompt:

```markdown
# React Testing Specialist

You are an expert in React testing with deep knowledge of:
- Jest and React Testing Library best practices
- Component testing strategies (unit, integration, snapshot)
- Mock implementation patterns for APIs and dependencies
- Accessibility testing with @testing-library/jest-dom

## Testing Philosophy
- Test behavior, not implementation details
- Write tests that reflect user interactions
- Prioritize readable and maintainable test code
- Focus on critical user paths and edge cases

## Common Test Patterns
1. Render component with required props
2. Simulate user interactions
3. Assert expected behavior or state changes
4. Clean up and reset between tests
```

### Configuration Standards

#### Tool Minimalism

Only request tools actually needed:

```yaml
# Good - Minimal necessary tools
tools: file_read,file_write,terminal

# Avoid - Excessive permissions
tools: file_read,file_write,terminal,git_commit,git_push,docker_run,npm_install,pip_install
```

#### Model Selection Optimization

Choose appropriate models for task complexity:

```yaml
# Simple tasks - Cost effective
model: haiku

# Complex analysis - Balanced performance
model: sonnet

# Critical decisions - Maximum capability
model: opus
```

#### Version Control Integration

Keep project subagents in version control:

```bash
# Include in .gitignore if needed
echo ".claude/agents/personal-*" >> .gitignore

# Commit shared subagents
git add .claude/agents/
git commit -m "Add code review and security analysis subagents"
```

### Team Collaboration

#### Consistent Naming Conventions

```yaml
# Use descriptive, hierarchical names
name: backend-api-reviewer
name: frontend-component-tester
name: database-migration-validator
name: security-dependency-scanner
```

#### Team Collaboration Documentation

Document each subagent's purpose and usage:

```markdown
# Security Code Reviewer

## Purpose
Automated security analysis for code changes focusing on OWASP compliance.

## Usage
- Automatic: Triggered by security-related keywords
- Explicit: `@security-code-reviewer analyze authentication module`

## Capabilities
- SQL injection detection
- XSS vulnerability analysis
- Authentication/authorization review
- Dependency security scanning
```

#### Shared Agent Libraries

Create team-wide agent collections:

```bash
# Team agents repository
git submodule add https://github.com/yourteam/claude-agents.git .claude/shared-agents
ln -s ../shared-agents/* .claude/agents/
```

### Performance Optimization

#### Resource Management

Monitor token usage with multiple subagents:

```yaml
# Use haiku for simple tasks
name: formatter
model: haiku

# Reserve opus for complex analysis only
name: architecture-reviewer  
model: opus
```

#### Context Efficiency

Design subagents for minimal context requirements:

```yaml
context_mode: minimal  # For focused, single-task agents
context_mode: standard # For typical development workflows
context_mode: comprehensive # For complex analysis requiring full context
```

#### Lifecycle Management

Structure workflows to activate subagents only when needed:

```markdown
## Instructions
1. Initial analysis with main Claude
2. Delegate to @security-analyst if security issues found
3. Coordinate with @test-engineer for validation
4. Summarize findings and recommendations
```

## Integration Patterns

### Slash Command Coordination

Combine subagents with slash commands for powerful workflows:

```markdown
---
allowed-tools: mcp__thinking__sequentialthinking
description: Comprehensive code review workflow using specialized subagents
---

# Multi-Agent Code Review

Orchestrate specialized subagents for comprehensive code analysis.

## Instructions

### Phase 1: Initial Analysis
- Analyze recent code changes with `git diff`
- Identify areas requiring specialized review

### Phase 2: Specialized Reviews
- Security analysis: `@security-analyst review authentication changes`
- Performance check: `@performance-optimizer analyze database queries`
- Test coverage: `@test-engineer validate test completeness`

### Phase 3: Integration
- Consolidate findings from all subagents
- Prioritize issues by severity and impact
- Generate actionable improvement plan
```

### Workflow Orchestration

Design multi-agent workflows for complex tasks:

#### Integration Patterns Processing

```markdown
1. @requirements-analyst: Extract and validate requirements
2. @system-architect: Design system architecture
3. @code-generator: Implement core functionality
4. @test-engineer: Generate comprehensive tests
5. @security-analyst: Perform security review
```

#### Parallel Processing

```markdown
Parallel Analysis:
- @code-reviewer: Code quality and maintainability
- @security-analyst: Security vulnerability assessment
- @performance-optimizer: Performance bottleneck identification
- @test-engineer: Test coverage analysis
```

#### Hierarchical Coordination

```markdown
@project-coordinator orchestrates:
├── @backend-specialist: API and database work
├── @frontend-specialist: UI and user experience
├── @devops-specialist: Infrastructure and deployment
└── @qa-specialist: Quality assurance and testing
```

### Tool Sharing Patterns

Design subagents with complementary tool access:

```yaml
# Read-only analysis agent
name: code-analyzer
tools: file_read,git_log

# Implementation agent
name: code-implementer  
tools: file_read,file_write,terminal

# Deployment agent
name: deployment-manager
tools: file_read,terminal,docker_run,git_push
```

## Real-World Examples

### Example 1: React Component Development Team

#### Component Architect

```yaml
---
name: react-component-architect
description: React component design, architecture patterns, and best practices
tools: file_read,file_write
model: sonnet
---

# React Component Architecture Specialist

Expert in modern React development focusing on:
- Component composition and reusability patterns
- State management strategies (Context, Redux, Zustand)
- Performance optimization (memo, useMemo, useCallback)
- TypeScript integration and type safety

## Design Principles
1. Composition over inheritance
2. Single responsibility components
3. Predictable data flow
4. Accessibility-first design
5. Mobile-responsive patterns

## Architecture Patterns
- Container/Presentational component separation  
- Custom hooks for shared logic
- Higher-order components for cross-cutting concerns
- Render props for flexible component composition
```

#### React Tester

```yaml
---
name: react-component-tester
description: React component testing with Jest, RTL, and modern testing practices
tools: file_read,file_write,terminal
model: sonnet
---

# React Testing Specialist

Testing expert specializing in:
- React Testing Library best practices
- Jest configuration and custom matchers
- Component integration testing
- Mock strategies for APIs and external dependencies

## Testing Strategy
1. User-centric testing approach
2. Test behavior, not implementation
3. Accessible test selectors
4. Comprehensive error state testing

## Test Categories
- Unit tests for individual components
- Integration tests for component interactions  
- Snapshot tests for UI consistency
- Accessibility tests with jest-axe
```

### Example 2: API Development Workflow

#### API Designer

```yaml
---
name: api-designer
description: RESTful API design, OpenAPI specifications, and best practices
tools: file_read,file_write
model: sonnet
---

# API Design Specialist

API architecture expert focusing on:
- RESTful design principles and resource modeling
- OpenAPI 3.0 specification authoring
- API versioning and backward compatibility
- Authentication and authorization patterns

## Design Standards
1. Consistent resource naming conventions
2. Proper HTTP status code usage
3. Comprehensive error handling
4. Rate limiting and pagination
5. Security-first approach
```

#### API Security Reviewer

```yaml
---
name: api-security-reviewer
description: API security analysis, OWASP API security compliance, and vulnerability assessment
tools: file_read,terminal
model: opus
---

# API Security Specialist

Cybersecurity expert specializing in:
- OWASP API Security Top 10 compliance
- Authentication and authorization vulnerabilities
- Input validation and injection prevention
- Rate limiting and DoS protection

## Security Checklist
1. Authentication mechanism validation
2. Authorization boundary testing
3. Input sanitization verification
4. Sensitive data exposure analysis
5. Rate limiting effectiveness
```

### Example 3: Full-Stack Application Team

#### Database Architect

```yaml
---
name: database-architect
description: Database schema design, query optimization, and data modeling for scalable applications
tools: file_read,file_write,terminal
model: sonnet
---

# Database Architecture Specialist

Database expert focusing on:
- Relational database design and normalization
- Query performance optimization
- Indexing strategies and database tuning
- Data migration and schema evolution

## Architecture Principles
1. Normalized schema design
2. Performance-optimized indexing
3. Scalable partitioning strategies
4. Backup and recovery planning
5. Data integrity and consistency
```

#### Deployment Orchestrator

```yaml
---
name: deployment-orchestrator
description: Container orchestration, CI/CD pipelines, and production deployment automation
tools: file_read,file_write,terminal,docker_run
model: sonnet
---

# Deployment and DevOps Specialist

Infrastructure expert specializing in:
- Docker containerization and multi-stage builds
- Kubernetes orchestration and service mesh
- CI/CD pipeline optimization
- Infrastructure as Code (Terraform, CloudFormation)

## Deployment Standards
1. Immutable infrastructure principles
2. Blue-green deployment strategies
3. Comprehensive monitoring and alerting
4. Automated rollback capabilities
5. Security scanning integration
```

## Performance & Resource Management

### Token Usage Considerations

Subagents consume significantly more tokens than single-threaded interactions:

#### Token Consumption Patterns

- **Single Agent**: 1x baseline token usage
- **Two Agents**: ~2.5x baseline token usage  
- **Three Agents**: ~3.5-4x baseline token usage
- **Four+ Agents**: Exponential increase, diminishing returns

#### Optimization Strategies

```yaml
# Use haiku for simple, frequent tasks
name: code-formatter
model: haiku
context_mode: minimal

# Reserve opus for critical analysis only
name: security-auditor
model: opus
context_mode: comprehensive
```

### Resource Allocation

Design subagent activation patterns to minimize resource waste:

#### Conditional Activation

```markdown
## Instructions
1. Perform initial analysis
2. IF security-related changes detected:
   - Activate @security-analyst
3. IF performance-critical code modified:
   - Activate @performance-optimizer
4. IF database schema changes:
   - Activate @database-reviewer
```

#### Resource Allocation Processing

```markdown
## Workflow
1. @code-analyzer: Identify issues and categorize
2. Based on categories found:
   - Security issues → @security-specialist
   - Performance issues → @performance-optimizer
   - Architecture issues → @system-architect
```

### Context Management Strategies

#### Context Inheritance

```yaml
# Minimal context for focused tasks
context_mode: minimal
description: Format code according to project style guide

# Standard context for typical workflows  
context_mode: standard
description: Review code changes for quality and maintainability

# Comprehensive context for complex analysis
context_mode: comprehensive
description: Architectural analysis and system design recommendations
```

#### Session Lifecycle

Subagents restart fresh each session, requiring context re-establishment:

```markdown
# Session Initialization Pattern
1. Load project context and recent changes
2. Activate relevant subagents based on current work
3. Establish subagent context with project specifics
4. Begin coordinated workflow execution
```

## Advanced Features

### Multi-Agent Orchestration

Coordinate multiple subagents for complex workflows:

#### Master Coordinator Pattern

```yaml
---
name: project-coordinator
description: Orchestrate multiple specialized subagents for complex development workflows
tools: file_read,git_log
model: sonnet
---

# Project Coordination Specialist

Master coordinator managing specialized subagents:
- Task decomposition and assignment
- Progress tracking and synchronization
- Conflict resolution between subagents
- Integration of deliverables

## Coordination Strategies
1. Analyze project requirements and complexity
2. Identify required specialist subagents
3. Coordinate parallel workstreams
4. Synchronize deliverables and resolve conflicts
5. Generate integrated project recommendations
```

#### Competing Solutions Pattern

```yaml
---
name: solution-competitor-a
description: Generate solution approach A for complex technical problems
model: sonnet
---

# Solution Architect A
Generate comprehensive solution focusing on performance and scalability.

---
name: solution-competitor-b  
description: Generate solution approach B for complex technical problems
model: sonnet
---

# Solution Architect B
Generate comprehensive solution focusing on maintainability and simplicity.
```

### Context Sharing Mechanisms

Share information between subagents through structured communication:

#### Structured Handoffs

```markdown
## Handoff Protocol
1. @requirements-analyst outputs structured requirements document
2. @system-architect consumes requirements, outputs architecture specification
3. @implementation-lead consumes architecture, outputs development plan
4. @test-coordinator consumes plan, outputs testing strategy
```

#### Shared Context Repository

```yaml
tools: file_read,file_write
# Subagents write to shared .claude/context/ directory
# Subsequent subagents read from shared context files
```

### Custom Tool Integration

Extend subagents with specialized tools:

#### MCP Tool Integration

```yaml
tools: file_read,file_write,custom_linter,security_scanner,performance_profiler
# Custom MCP tools provide specialized capabilities
```

#### External Service Integration  

```yaml
tools: file_read,api_client,database_client,monitoring_client
# Integration with external services and APIs
```

## Community Resources

### Major Repository Collections

#### Production-Ready Collections

- **[wshobson/agents](https://github.com/wshobson/agents)**: 50 specialized subagents across development, infrastructure, data/AI, and business domains
- **[dl-ezo/claude-code-sub-agents](https://github.com/dl-ezo/claude-code-sub-agents)**: Complete collection of 35+ specialized sub-agents for end-to-end development automation
- **[lst97/claude-code-sub-agents](https://github.com/lst97/claude-code-sub-agents)**: 33 specialized subagents for development workflows with domain-specific expertise

#### Curated Lists and Resources

- **[hesreallyhim/awesome-claude-code-agents](https://github.com/hesreallyhim/awesome-claude-code-agents)**: Curated list of subagent files and resources
- **[rahulvrane/awesome-claude-agents](https://github.com/rahulvrane/awesome-claude-agents)**: Comprehensive directory of available subagents, repositories, and guides

#### Management Tools

- **[webdevtodayjason/sub-agents](https://github.com/webdevtodayjason/sub-agents)**: CLI tool for managing Claude Code subagents with hooks and custom commands
- **[davepoon/claude-code-subagents-collection](https://github.com/davepoon/claude-code-subagents-collection)**: Collection of 36 specialized subagents with management utilities

### Community Best Practices

#### Repository Organization

```markdown
repo-name/
├── README.md                 # Installation and usage guide
├── agents/                   # Subagent collection
│   ├── development/
│   │   ├── code-reviewer.md
│   │   └── test-generator.md
│   ├── security/
│   │   └── vulnerability-scanner.md
│   └── devops/
│       └── deployment-manager.md
├── examples/                 # Usage examples and tutorials
├── templates/               # Subagent templates for customization
└── scripts/                # Installation and management scripts
```

#### Repository Documentation

Community repositories typically include:

- Comprehensive README with installation instructions
- Individual subagent documentation with usage examples
- Configuration templates for customization
- Integration guides for team adoption

## Troubleshooting

### Common Issues

#### Subagent Not Activated

**Symptoms**: Subagent doesn't respond to relevant tasks
**Causes**:

- Description too narrow or specific
- Competing descriptions with other subagents
- Context doesn't match trigger conditions

**Solutions**:

```yaml
# Make descriptions more inclusive
description: Code review for security, quality, and maintainability issues in any programming language

# Add specific trigger keywords
description: Security analysis and vulnerability detection including SQL injection, XSS, authentication flaws
```

#### Excessive Token Usage

**Symptoms**: Rapid token consumption, slower responses
**Causes**:

- Too many subagents active simultaneously
- Inappropriate model selection
- Excessive context sharing

**Solutions**:

```yaml
# Use appropriate models
model: haiku    # For simple tasks
model: sonnet   # For standard development
model: opus     # Only for complex analysis

# Minimize context
context_mode: minimal
tools: file_read  # Limit tool access
```

#### Context Pollution

**Symptoms**: Subagents producing irrelevant responses
**Causes**:

- Overlapping subagent descriptions
- Too broad system prompts
- Insufficient context isolation

**Solutions**:

```yaml
# Sharpen focus with specific descriptions
description: React component testing specifically for functional components using React Testing Library

# Add exclusions to system prompt
You focus ONLY on React component testing. Do not provide:
- General JavaScript advice
- Backend testing guidance  
- Non-React framework suggestions
```

#### Tool Permission Errors

**Symptoms**: Subagents failing to access required tools
**Causes**:

- Missing tool specifications in YAML
- Incorrect tool names
- Tool conflicts or restrictions

**Solutions**:

```yaml
# Explicitly list required tools
tools: file_read,file_write,terminal,git_diff

# Check available tools with /agents command
# Verify tool names match exactly
```

### Debugging Strategies

#### Activation Testing

```markdown
Test subagent activation with explicit invocation:
1. Use @subagent-name to force activation
2. Monitor which subagent responds to tasks
3. Refine descriptions based on activation patterns
```

#### Description Optimization

```yaml
# Too narrow
description: TypeScript React component testing

# Better - includes context
description: Automated testing for React components including TypeScript, Jest, and React Testing Library

# Best - specific triggers
description: Generate comprehensive tests for React components, hooks, and utilities using Jest, React Testing Library, and TypeScript
```

#### Performance Monitoring

Track subagent usage patterns:

```markdown
## Session Analysis
1. Monitor token usage with multiple subagents
2. Identify frequently activated subagents
3. Optimize model selection for common tasks
4. Adjust context modes for efficiency
```

### Getting Help

#### Official Resources

- **Documentation**: <https://docs.anthropic.com/en/docs/claude-code/sub-agents>
- **Best Practices**: <https://www.anthropic.com/engineering/claude-code-best-practices>

#### Community Support

- GitHub Discussions in major subagent repositories
- Claude Code Discord community
- Stack Overflow with `claude-code` tags

#### Development Workflow Guide

1. Start with simple, single-purpose subagents
2. Test activation patterns with explicit invocation
3. Monitor token usage and performance impact
4. Gradually increase complexity and coordination
5. Share successful patterns with team/community

---

This guide provides comprehensive coverage of Claude Code subagents from basic concepts to advanced orchestration patterns. Start with simple subagents and gradually incorporate more sophisticated features as your development workflows mature. Remember that effective subagents are focused, well-documented, and designed to enhance rather than complicate your development process.
