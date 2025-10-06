# Agent Usage Guide

Comprehensive guide for using Claude Code agents effectively. All agents are **generic + project-aware** and automatically discover your project's technology stack, patterns, and standards.

## Agent Overview

### **Core Principle: Automatic Project Discovery**
- **ALL agents read CLAUDE.md, README.md, and Documents/ to understand YOUR project**
- **Agents adapt to YOUR technology stack, patterns, and standards**
- **No configuration needed - agents discover everything automatically**
- **MANDATORY: Agents MUST follow YOUR discovered project requirements exactly**

## Agent Specializations

### **Planning & Strategy Agents**

#### **task-organizer**
- **Use for**: Complex multi-step requests, feature planning, dependency coordination
- **Capabilities**: Requirement analysis, task breakdown, dependency mapping, agent coordination
- **Discovers**: Project workflow patterns, planning methodologies, coordination preferences
- **Adapts to**: Any project management approach (Agile, waterfall, etc.)

#### **solution-engineer**
- **Use for**: Technical analysis, architecture decisions, solution design
- **Capabilities**: Requirements analysis, technical design, technology evaluation, integration planning
- **Discovers**: Project architecture patterns, technology constraints, integration requirements
- **Adapts to**: Any technology stack and architectural pattern

### **Development Implementation Agents**

#### **backend-developer**
- **Use for**: Server-side code, APIs, databases, services
- **Capabilities**: Backend development, database integration, API design, performance optimization
- **Discovers**: Backend technology stack, coding standards, testing frameworks, build systems
- **Adapts to**: Any backend technology (Java, Python, C#, Node.js, Go, Rust, etc.)

#### **frontend-developer** 
- **Use for**: UI components, styling, client-side interactions
- **Capabilities**: Component development, styling, state management, frontend testing
- **Discovers**: Frontend frameworks, styling approaches, build systems, testing tools
- **Adapts to**: Any frontend technology (React, Vue, Angular, Svelte, vanilla JS, etc.)

#### **shell-developer**
- **Use for**: Automation scripts, CLI tools, build scripts
- **Capabilities**: Cross-platform scripting, CLI design, automation, system configuration
- **Discovers**: Platform requirements, scripting preferences, automation patterns
- **Adapts to**: Any platform (Windows PowerShell, Linux bash, macOS zsh, etc.)

### **Quality & Operations Agents**

#### **test-automation-developer**
- **Use for**: Automated tests, BDD scenarios, coverage improvement
- **Capabilities**: Test automation, BDD implementation, quality assurance, coverage analysis
- **Discovers**: Testing frameworks, methodology preferences, coverage targets, CI/CD integration
- **Adapts to**: Any testing framework (JUnit, pytest, Jest, MSTest, Cucumber, etc.)

#### **code-reviewer**
- **Use for**: Code quality analysis, security review, best practices enforcement
- **Capabilities**: Security analysis, quality assessment, performance review, standards compliance
- **Discovers**: Quality standards, security requirements, compliance needs, review processes
- **Adapts to**: Any quality standards, security frameworks, compliance requirements

#### **ux-designer**
- **Use for**: User interface design, accessibility, design systems
- **Capabilities**: UI/UX design, accessibility compliance, user research, design system development
- **Discovers**: Design systems, accessibility standards, user requirements, UI frameworks
- **Adapts to**: Any application domain, design system, accessibility requirements

#### **devops-specialist**
- **Use for**: CI/CD pipelines, deployment automation, infrastructure
- **Capabilities**: Build optimization, containerization, deployment automation, monitoring
- **Discovers**: Build systems, infrastructure patterns, CI/CD requirements, deployment preferences
- **Adapts to**: Any DevOps stack (Maven/npm/pip, Docker/Podman, Jenkins/GitHub Actions, etc.)

## Agent Coordination Patterns

### **Standard Workflows**

#### **Complex Feature Development**
```
1. task-organizer: Break down feature into phases and dependencies
2. solution-engineer: Analyze technical approach and architecture for YOUR stack
3. [development agents]: Implement using YOUR discovered technology patterns
4. test-automation-developer: Create comprehensive tests using YOUR testing framework
5. code-reviewer: Validate quality and security using YOUR standards
6. devops-specialist: Setup deployment using YOUR infrastructure patterns
```

#### **Quick Code Changes**
```
1. solution-engineer: Analyze change requirements within YOUR project context
2. [specific agent]: Implement changes using YOUR discovered patterns
3. code-reviewer: Validate changes meet YOUR quality standards
```

#### **Performance Optimization**
```
1. solution-engineer: Analyze performance issues in YOUR technology stack
2. code-reviewer: Identify bottlenecks using YOUR performance standards
3. [backend/frontend]-developer: Implement optimizations for YOUR specific stack
4. test-automation-developer: Add performance tests using YOUR testing framework
5. devops-specialist: Optimize deployment using YOUR DevOps tools
```

#### **Full-Stack Development**
```
Parallel execution:
- backend-developer: Server-side using YOUR backend technology
- frontend-developer: Client-side using YOUR frontend framework

Sequential:
- test-automation-developer: Integration tests using YOUR testing approach
- code-reviewer: Cross-stack validation using YOUR quality standards
```

## Technology Adaptation Examples

### **Java Spring Boot Project**
- **backend-developer** discovers: Java, Spring Boot, JPA, Maven, JUnit, application.properties
- **frontend-developer** discovers: React, TypeScript, npm, Jest, webpack
- **test-automation-developer** discovers: JUnit, Mockito, Spring Boot Test, TestContainers
- **devops-specialist** discovers: Maven, Docker, Spring profiles, actuator endpoints

### **Python Django Project**
- **backend-developer** discovers: Python, Django, SQLAlchemy, pip, pytest, settings.py
- **frontend-developer** discovers: Vue.js, JavaScript, npm, webpack, Vue Test Utils
- **test-automation-developer** discovers: pytest, Django Test Framework, factory_boy
- **devops-specialist** discovers: pip, Docker, Django settings, gunicorn

### **C# .NET Project** 
- **backend-developer** discovers: C#, ASP.NET Core, Entity Framework, NuGet, MSTest
- **frontend-developer** discovers: Angular, TypeScript, npm, Karma, Angular CLI
- **test-automation-developer** discovers: MSTest, Moq, .NET Test Framework, SpecFlow
- **devops-specialist** discovers: dotnet CLI, Docker, appsettings.json, IIS/Kestrel

### **Node.js Express Project**
- **backend-developer** discovers: Node.js, Express, MongoDB/PostgreSQL, npm, Mocha
- **frontend-developer** discovers: React/Vue/Angular, JavaScript/TypeScript, webpack
- **test-automation-developer** discovers: Mocha, Jest, Supertest, Cypress
- **devops-specialist** discovers: npm, Docker, PM2, nginx

## Best Practices

### **Agent Selection Guidelines**
- **Start with task-organizer** for complex multi-step requests
- **Use solution-engineer** for technical analysis before implementation
- **Choose specific agents** based on the domain (backend, frontend, testing, etc.)
- **Always include code-reviewer** for quality assurance
- **Include devops-specialist** for deployment and infrastructure concerns

### **Quality Assurance Workflow**
- **NEVER skip code-reviewer** after significant changes
- **Include test-automation-developer** for comprehensive coverage
- **Use solution-engineer** for architectural validation
- **Ensure agents follow YOUR discovered project standards exactly**

### **Coordination Tips**
- **Parallel execution**: Use multiple agents simultaneously for independent work
- **Sequential validation**: Code review and testing after implementation
- **Architecture first**: Solution analysis before detailed implementation
- **Quality gates**: Regular code review checkpoints throughout development

## Common Mistakes to Avoid

### ❌ **Don't Assume Technology Stack**
- **Wrong**: "Use the backend-developer for Java development"
- **Right**: "Use the backend-developer - it will discover your backend technology"

### ❌ **Don't Skip Project Discovery**
- **Wrong**: Asking agents to use specific frameworks without discovery
- **Right**: Let agents discover your project patterns first

### ❌ **Don't Skip Quality Steps**
- **Wrong**: Implementation without code review
- **Right**: Always include code-reviewer for quality assurance

### ❌ **Don't Over-Coordinate**
- **Wrong**: Using task-organizer for simple single-agent tasks
- **Right**: Use task-organizer only for complex multi-step coordination

## Agent Limitations

### **What Agents DON'T Do**
- **No manual configuration**: Agents discover everything automatically
- **No technology assumptions**: Agents never assume your tech stack
- **No shortcuts**: Agents always follow discovered project standards
- **No generic solutions**: All solutions adapted to YOUR specific project

### **When to Use Multiple Agents**
- **Complex features**: Requiring coordination across multiple domains
- **Full-stack work**: Backend + frontend + testing + deployment
- **Quality assurance**: Implementation + review + testing validation
- **Architecture changes**: Analysis + implementation + validation

## Troubleshooting

### **If Agents Don't Follow Your Patterns**
- **Check CLAUDE.md**: Ensure your standards are clearly documented
- **Check README.md**: Verify technology stack and workflow information
- **Check Documents/**: Ensure relevant guides and patterns are available
- **Be explicit**: Remind agents to discover and follow your project standards

### **If Agent Coordination Fails**
- **Use task-organizer**: For complex coordination and breakdown
- **Be specific**: Clearly define what each agent should accomplish
- **Sequential execution**: Avoid complex parallel coordination for critical work
- **Quality checkpoints**: Regular code review and validation steps

This guide provides comprehensive agent usage information while keeping the core CLAUDE_TEMPLATE.md lean and properly engineered.