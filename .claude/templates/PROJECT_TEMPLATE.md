# {project_name} - AI Development Specification

**Original Request**: {original_description}

**{project_name}** is a {product_type} for {description}. The system enables {target_user_type} to {primary_user_workflow} through {interaction_method} interface.

---

## Change Log
<foreach {change} IN {change_log}>
- *{CHANGE_DATE}* — **{CHANGE_VERSION}** — {SHORT_DESCRIPTION}
</foreach>
<examples>
- *2025‑03‑14* — **1.0.0** — Created initial draft.
- *2025‑03‑20* — **1.1.0** — Updated Summary Section
</examples>
---

### User Experience
- **Target Users**: {target_user_type}
- **Primary Workflow**: {primary_user_workflow}
- **Interface Type**: {interface_type}
- **Interaction Method**: {interaction_method}
---

## Features
<foreach {feature} IN {project_features}>
### {feature.name}
- **Area**: {feature.primary_area}
- **Type**: {feature.type}
- **Description**: {feature.description}
- **Use Cases**: {feature.use_case_count} identified
- **Specification**: {feature.specification_path}
</foreach>
<examples>
### SmartBudgeting
- **Area**: Budget Management
- **Type**: Enhancement
- **Description**: AI-powered budget optimization with predictive analytics
- **Use Cases**: 6 identified
- **Specification**: Documents/Areas/Budget Management/Features/SmartBudgeting.md
</examples>
---

## Domain Architecture (DDD FOUNDATION)

### Bounded Contexts
<foreach {context} IN {bounded_contexts}>
- **{context.name}**: {context.short_description}
</foreach>
<examples>
- **TaskManagement**: Core task operations and business logic
- **UserInterface**: User interaction and presentation logic
- **DataPersistence**: Storage and retrieval operations
- **Authentication**: User management and security (if needed)
- **Notification**: Alerts and communication (if needed)
</examples>
---

### Domain Interactions
<foreach {interaction} IN {domain_interactions}>
- **{interaction.name}**: {interaction.definition}
</foreach>
<examples>
- **TaskToUI**: Task state changes trigger UI updates
- **TaskToPersistence**: Task operations require data persistence
- **UIToTask**: User actions initiate task operations
- **AuthToTask**: Authentication context affects task permissions
</examples>
---

### Ubiquitous Language
<foreach {term} IN {ubiquitous_language}>
- **{term.concept}**: {term.definition}
</foreach>
<examples>
- **Task**: Individual work item with title, description, due date, priority
- **Category**: Organizational grouping for tasks with name and color
- **Priority**: Urgency level (Low, Medium, High, Critical) with ordering rules
- **Status**: Current state (Draft, In Progress, Completed, Archived)
- **Due Date**: Completion deadline with validation constraints
</examples>
---

## Clean Architecture Layers

### Domain Layer (Core Business Logic)
<foreach {context} IN {bounded_contexts}>
#### {context.name} Domain
- **Entities**: {context.entities}
- **Value Objects**: {context.value_objects}
- **Domain Services**: {context.domain_services}
- **Business Rules**: {context.business_rules}
- **Domain Events**: {context.domain_events}
</foreach>
<examples>
</examples>
---

### Application Layer (Use Cases)
<foreach {usecase} IN {application_layer}>
- **{usecase.name}**: {usecase.short_description}
</foreach>
<examples>
- **CreateTask**: Create new task with validation
- **UpdateTaskStatus**: Manage task state transitions
- **SetTaskPriority**: Assign priority levels to tasks
- **FilterTasks**: Query and filter task collections
- **CompleteTask**: Mark tasks as finished with business rules
</examples>
---

### Infrastructure Layer (External Concerns)
<foreach {adapter} IN {infrastructure_layer}>
- **{adapter.name}**: {adapter.short_description}
</foreach>
<examples>
</examples>
---

### UI Layer (User Interface)
<foreach {component} IN {ui_layer}>
- **{component.name}**: {component.short_description}
</foreach>
<examples>
</examples>
---

## Hexagonal Architecture (Ports & Adapters)

### Primary Ports (Inbound Interfaces)
<foreach {port} IN {primary_ports}>
- **{port.name}**: {port.short_description}
</foreach>
<examples>
- **TaskManagementPort**: Inbound interface for task CRUD operations
- **TaskQueryPort**: Inbound interface for task filtering and searching
- **UserInterfacePort**: Inbound interface for UI interaction coordination
</examples>
---

### Secondary Ports (Outbound Interfaces)
<foreach {port} IN {secondary_ports}>
- **{port.name}**: {port.short_description}
</foreach>
<examples>
- **TaskRepositoryPort**: Outbound interface for task persistence
- **NotificationPort**: Outbound interface for user notifications
- **ExternalAPIPort**: Outbound interface for external service integration
</examples>
---

### Primary Adapters (Inbound)
<foreach {adapter} IN {primary_adapters}>
- **{adapter.name}**: {adapter.short_description}
</foreach>
<examples>
- **WebAPIAdapter**: REST API adapter for web client interactions
- **GraphQLAdapter**: GraphQL adapter for flexible data queries
- **CLIAdapter**: Command-line interface adapter for scripting and automation
</examples>
---

### Secondary Adapters (Outbound)
<foreach {adapter} IN {secondary_adapters}>
- **{adapter.name}**: {adapter.short_description}
</foreach>
<examples>
- **DatabaseAdapter**: SQL/NoSQL database integration for data persistence
- **EmailAdapter**: Email service integration for notifications
- **FileSystemAdapter**: Local file storage adapter for document management
- **ExternalAPIAdapter**: Third-party service integration adapter
</examples>
---

## Architecture Principles & Standards

### Mandatory Architecture Standards
- **Domain-Driven Design**: Bounded contexts with clear domain boundaries and ubiquitous language
- **Hexagonal Architecture**: Ports and adapters pattern with strict dependency inversion
- **Clean Architecture**: Layer separation following the dependency rule (Domain ← Application ← Infrastructure)
- **Separation of Concerns**: Single responsibility principle enforced at all levels
- **Well-Defined Contracts**: Clear interfaces between all components and layers
- **KISS Principle**: Simple implementation avoiding unnecessary complexity

### Architecture Decisions
- **Domain Boundaries**: <foreach {context} IN {bounded_contexts}>{context.name} handles {context.purpose}</foreach>
- **Dependency Flow**: UI → Application → Domain ← Infrastructure (inward dependency only)
- **Communication Patterns**: {domain_interactions}
- **Complexity Justification**: {complexity_justification}
- **Simplification Applied**: {simplification_opportunities}

## Technical Architecture

### Technology Stack
<foreach {technology} IN {tech_stack}>
- **{technology.name} {technology.version}**: {technology.short_description}
</foreach>
<examples>
- **React 18.2**: Frontend UI framework for component-based interfaces
- **Node.js 18.x**: Backend runtime for API services and business logic
- **PostgreSQL 15**: Database for persistent data storage
- **TypeScript 5.x**: Type-safe development for both frontend and backend
- **Jest 29.x**: Testing framework for unit and integration tests
</examples>
---

### Application Structure
- **Application Type**: {application_type}
- **Architecture Pattern**: Clean Architecture with Hexagonal pattern and DDD principles
---

### System Components

<if ({has_frontend})>
#### Frontend Component (UI Layer)
- **Technology**: {frontend_tech}
- **UI Framework**: {ui_framework}
- **Purpose**: User interface and interaction layer following Clean Architecture UI layer
- **Responsibilities**: User interaction, data presentation, client-side validation
- **Architecture Role**: Primary Adapter implementing inbound ports

### UI Architecture & Design System

#### UI Framework & Technology
- **UI Framework**: {ui_framework} {ui_framework_version}
- **UI Pattern**: {ui_pattern}
- **Routing Library**: {routing_library}
- **State Management**: {state_management}
- **Component Library**: {component_library}
- **Form Handling**: {form_library}
- **Styling Approach**: {styling_approach}
<examples>
- **UI Framework**: React 18.2
- **UI Pattern**: Single Page Application (SPA)
- **Routing Library**: React Router 6.x
- **State Management**: Redux Toolkit with RTK Query
- **Component Library**: Material-UI v5
- **Form Handling**: React Hook Form
- **Styling Approach**: CSS-in-JS with MUI styled components
</examples>

#### UI Structure & Layout
- **Layout Pattern**: {layout_pattern}
- **Navigation Type**: {navigation_type}
- **Responsive Strategy**: {responsive_strategy}
- **Theme System**: {theme_system}
<examples>
- **Layout Pattern**: App shell with sidebar navigation
- **Navigation Type**: Collapsible sidebar with top header
- **Responsive Strategy**: Mobile-first with breakpoints at 768px, 1024px
- **Theme System**: Material Design with custom color palette
</examples>

#### UI Presentation Modes Supported
- **Supported UI Types**: {supported_ui_types}
<examples>
- FULL_PAGE (for main features like login, dashboard, adventure editor)
- MODAL (for quick actions like delete confirmation, image viewer)
- FORM (for data entry like profile settings, create asset)
- WIDGET (for reusable components like user avatar, chat message)
- BUTTON (for actions like logout, export, refresh)
- MENU_ITEM (for navigation like main menu, context menus)
</examples>

#### Routing Structure
- **Route Pattern**: {route_pattern}
- **Route Organization**: {route_organization}
<examples>
- **Route Pattern**: Hierarchical with nested routes
- **Route Organization**:
  - /auth/* (authentication pages: login, register, reset)
  - /app/* (authenticated app shell)
    - /app/dashboard (main dashboard)
    - /app/adventures (adventure management)
    - /app/adventures/:id (adventure details)
    - /app/assets (asset library)
    - /app/sessions (game session management)
    - /app/settings/* (user settings)
</examples>
---

</if>

<if ({has_backend})>
#### Backend Component (Application & Infrastructure Layers)
- **Technology**: {backend_tech}
- **Purpose**: Business logic and external integrations following Clean Architecture
- **Responsibilities**: Use case orchestration, domain coordination, external service integration
- **Architecture Role**: Application layer with Infrastructure adapters
---

</if>

<if ({has_database})>
#### Storage Component (Infrastructure Layer)
- **Technology**: {database_tech}
- **Purpose**: Persistent data storage implementing repository pattern
- **Data Entities**: {data_entities}
- **Storage Requirements**: {storage_requirements}
- **Architecture Role**: Secondary Adapter implementing outbound storage ports
---

</if>

### Authentication & Security
<if ({needs_auth})>
- **Authentication Required**: Yes
- **Authentication Method**: {auth_method}
- **Security Considerations**: Implement secure authentication following Clean Architecture security principles
- **Architecture Integration**: Security as cross-cutting concern in Infrastructure layer
<else>
- **Authentication Required**: No - Open access system
- **Security Model**: Simplified security model appropriate for single-user applications
</if>
---

### Real-time Features
<if ({needs_realtime})>
- **Real-time Capabilities**: Required
- **Implementation**: WebSocket connections or Server-Sent Events for live updates
- **Architecture Integration**: Real-time as Infrastructure layer concern with domain event publishing
<else>
- **Real-time Capabilities**: Not required - Standard request/response pattern
- **Architecture Benefit**: Simplified architecture without event-driven complexity
</if>
---

## External Integration

### APIs and Services
<if ({external_apis} is not empty)>
- **External Integrations**: {external_apis}
- **Integration Purpose**: Connect with external systems following Hexagonal adapter pattern
- **Architecture Role**: Secondary Adapters implementing outbound integration ports
<else>
- **External Integrations**: None - Self-contained system
- **Architecture Benefit**: Simplified architecture without external dependencies
</if>
---

### Deployment Configuration
- **Deployment Target**: {deployment_target}
- **Infrastructure Requirements**: Suitable for {deployment_target} deployment
- **Architecture Considerations**: Deployment strategy aligned with Clean Architecture principles
- **Scalability**: Designed for maintainable scaling following architectural patterns
---

## Development Guidance for AI Agents

### Implementation Priority (Architecture-First)
1. **Domain Layer Implementation**: Establish {bounded_contexts} with entities, value objects, domain services
2. **Application Layer Implementation**: Implement use cases following {application_layer} specifications
3. **Infrastructure Layer Implementation**: Create adapters for {secondary_adapters} following port contracts
4. **UI Layer Implementation**: Build {primary_adapters} implementing inbound port interfaces
5. **Integration Testing**: Verify architectural boundaries and contracts are maintained
---

### Architecture Implementation Guidelines

#### Domain Layer Implementation
<foreach {context} IN {bounded_contexts}>
- **{context.name} Domain**: Implement {context.entities} with {context.business_rules}
  - Create domain entities with business invariants
  - Implement {context.domain_services} for complex business logic
  - Define {context.value_objects} for domain concepts
  - Ensure ubiquitous language consistency: {context.language_terms}
</foreach>
<examples>
</examples>
---

#### Application Layer Implementation
<foreach {usecase} IN {application_layer}>
- **{usecase.name}**: Orchestrate domain objects to fulfill {usecase.description}
  - Input validation and transformation: {usecase.input}
  - Domain coordination and business workflow: {usecase.flow}
  - Output preparation and formatting: {usecase.output}
</foreach>
<examples>
</examples>
---

#### Infrastructure Layer Implementation
<foreach {adapter} IN {secondary_adapters}>
- **{adapter.name}**: Implement {adapter.port_interface} using {adapter.technology}
  - Handle external system integration: {adapter.responsibilities}
  - Manage {adapter.dependencies} connections
  - Provide clean abstraction for domain layer
</foreach>
<examples>
</examples>
---

<if ({has_frontend})>
#### UI Layer Implementation
- **UI Framework**: {ui_framework} for component-based interface following Clean Architecture UI patterns
- **User Experience**: Focus on {primary_user_workflow} optimization with architectural separation
- **Responsive Design**: Adapt to different screen sizes while maintaining architectural boundaries
- **Controller Pattern**: Implement controllers that delegate to application layer use cases
---

</if>

### Quality Requirements (Architecture-Aligned)
- **Testing Strategy**:
  - Unit tests for Domain layer business logic (isolated from infrastructure)
  - Integration tests for Application layer use cases
  - Adapter tests for Infrastructure layer components
  - UI tests for presentation layer components
- **Code Quality**: Follow architectural patterns and {tech_stack} best practices
  - Domain layer: Pure business logic, no external dependencies
  - Application layer: Use case orchestration, dependency injection
  - Infrastructure layer: External concern implementation, configuration
  - UI layer: Presentation logic, user interaction handling
- **Documentation**: Document architectural decisions, domain boundaries, and interface contracts
- **Performance**: Optimize within architectural constraints, maintain separation of concerns
---

## Development Workflow for AI Agents (Architecture-First)

### Phase 1: Domain Foundation
1. **Domain Modeling**: Implement {bounded_contexts} with proper domain boundaries
2. **Entity Creation**: Build domain entities with business invariants and rules
3. **Value Objects**: Create immutable value objects for domain concepts
4. **Domain Services**: Implement domain services for complex business logic
5. **Ubiquitous Language**: Ensure consistent terminology throughout domain implementation
---

### Phase 2: Application Layer
1. **Use Case Implementation**: Create application services for {application_layer} use cases
2. **Port Definitions**: Define {primary_ports} and {secondary_ports} interface contracts
3. **Dependency Injection**: Set up inversion of control for clean dependency management
4. **Application Services**: Coordinate domain objects to fulfill business workflows
---

### Phase 3: Infrastructure Layer
1. **Secondary Adapters**: Implement {secondary_adapters} following port contracts
2. **Configuration**: Set up {database_tech} storage and external service connections
3. **Repository Pattern**: Implement data persistence following domain repository interfaces
4. **External Integrations**: <if ({external_apis} is not empty)>Connect to {external_apis} through adapter pattern</if>
---

<if ({has_frontend})>
### Phase 4: UI Layer
1. **Primary Adapters**: Build {primary_adapters} implementing inbound port interfaces
2. **User Interface**: Implement {interface_type} using {ui_framework} with architectural separation
3. **User Workflow**: Create user experience for {primary_user_workflow} following presentation patterns
4. **Controller Layer**: Implement controllers that delegate to application layer use cases
---

</if>

### Phase 5: Integration & Testing
1. **Architecture Validation**: Verify Clean Architecture dependency rule compliance
2. **Domain Boundary Testing**: Ensure bounded contexts maintain proper separation
3. **Contract Testing**: Validate port/adapter contracts and interface compliance
4. **End-to-End Testing**: Test complete workflows while respecting architectural boundaries
5. **Deployment Preparation**: Package for {deployment_target} deployment maintaining architecture
---

This {project_name} specification provides AI development agents with comprehensive architectural guidance for building a {product_type} that serves {target_user_type} through {interface_type} interface. The specification enforces DDD principles, Clean Architecture patterns, and Hexagonal Architecture to ensure maintainable, testable, and scalable code structure focusing on {core_purpose} with proper architectural foundations.

<!--
═══════════════════════════════════════════════════════════════
PROJECT SPECIFICATION QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════

## Project Identity & Value (15 points)
□ 5pts: Product type clearly defined (SaaS, desktop app, mobile app, etc.)
□ 5pts: Target user type and primary workflow explicit
□ 5pts: Interface type and interaction method specified

## UI Architecture (check if has_frontend = yes)
□ UI framework and version specified
□ Routing library and state management defined
□ Layout pattern and navigation type documented
□ Supported UI types listed (FULL_PAGE, MODAL, FORM, etc.)
□ Route organization structure defined

## Domain Architecture (DDD) (30 points)
□ 10pts: Bounded contexts identified with clear responsibilities
□ 5pts: Domain interactions documented with direction
□ 5pts: Ubiquitous language defined (10+ core domain terms minimum)
□ 5pts: Domain entities, value objects, services specified per context
□ 5pts: Domain events identified for state changes

## Clean Architecture (25 points)
□ 10pts: Domain layer complete (entities, value objects, domain services, business rules)
□ 5pts: Application layer defined (use cases with clear responsibilities)
□ 5pts: Infrastructure layer specified (adapters, external integrations)
□ 5pts: Dependency rule compliance validated (inward dependencies only)

## Hexagonal Architecture (Ports & Adapters) (15 points)
□ 5pts: Primary ports defined (inbound interfaces)
□ 5pts: Secondary ports defined (outbound interfaces)
□ 3pts: Primary adapters specified (UI, API, CLI, etc.)
□ 2pts: Secondary adapters specified (database, email, external APIs)

## Implementation Guidance (15 points)
□ 5pts: Technology stack specified with versions
□ 5pts: Implementation priority follows architecture-first approach
□ 5pts: Development phases documented (Domain → Application → Infrastructure → UI)

## Target Score: 80/100 minimum

### Common Issues to Avoid:
❌ Less than 3 bounded contexts (over-simplified domain)
❌ Missing ubiquitous language (need 10+ terms)
❌ Undefined domain events for state changes
❌ Circular dependencies between contexts
❌ Missing port/adapter contracts
❌ No clear primary/secondary port distinction
❌ Technology stack without version numbers
❌ Implementation phases not architecture-aligned
-->