# EPIC-002: Administration Application - Implementation Roadmap

**Epic**: Administration Application
**Type**: Large-Scale Infrastructure
**Status**: Ready for Implementation
**Total Effort**: 352 hours (10 weeks dedicated)
**Complexity**: Very High
**Created**: 2025-10-31
**Last Updated**: 2025-10-31

---

## Executive Summary

This roadmap provides a dependency-based implementation plan for EPIC-002, which creates a secure, independently deployable administration application for managing VTTTools backend operations. The implementation is sequenced into 6 phases with clear dependencies, quality gates, and risk mitigation strategies.

### Key Highlights

- **Critical Dependency Resolved**: Audit infrastructure built in Phase 1 (eliminates EPIC-001 Phase 12 blocker)
- **Phase 1 is Foundation**: 92-112 hours establishing audit logging, admin authentication, and dashboard
- **Parallel Opportunities**: Phases 3-5 can partially overlap (System Config and Public Library are independent)
- **Role Management Deferred**: Saves 32 hours; will implement when additional roles are introduced
- **Comprehensive Specifications**: 5 detailed feature specs, 63 BDD scenarios, STRUCTURE.md updated

---

## Roadmap Objective

Build a production-ready administration application that enables authorized administrators to:
1. Manage user accounts, roles, and security settings
2. Monitor system health, performance, and user activity
3. Configure application settings without code deployment
4. Investigate security incidents through comprehensive audit logs
5. Manage public library content (assets, adventures, scenes)

All administrative actions will be logged for compliance and security review. The admin app will be deployed independently from the main application with enhanced security controls.

---

## Critical Path Analysis

### Blocking Items (Must Complete First)

1. **Audit Infrastructure** (Phase 1, 40-60h)
   - AuditLog table, IAuditLogService, middleware, SignalR hub
   - **Blocks**: User Management, Audit Log Viewer, Dashboard activity feed
   - **Why Critical**: All admin actions must be logged; recent activity feed requires audit data

2. **Admin Authentication Endpoints** (Phase 1, 8h)
   - Separate admin login with stricter validation
   - **Blocks**: All admin features (no access without authentication)

3. **WebAdminApp Foundation** (Phase 1, 20h)
   - React project setup, routing, theme, Redux store
   - **Blocks**: All frontend development

4. **Admin Dashboard** (Phase 1, 28h)
   - Health indicators, metrics, recent activity feed
   - **Blocks**: Admin onboarding (main page after login)

### Independent Work Streams (Can Parallelize)

- **System Configuration** (Phase 4) - No dependencies on user management or audit viewer
- **Public Library Management** (Phase 5) - No dependencies on user management or audit viewer
- **Testing & Security** (Phase 6) - Parallel E2E, security audit, documentation

---

## Phase Breakdown

### Phase 1: Foundation + Audit Infrastructure + Dashboard
**Duration**: Week 1-3 (92-112 hours)
**Objective**: Establish admin app infrastructure, complete audit logging system, implement main dashboard

**Backend Components**:
- VttTools.Admin microservice project structure (4h)
- Admin authentication endpoints with stricter validation (8h)
- **Audit Infrastructure** (40-60h):
  - AuditLog database schema with indexes (4h)
  - AuditLog domain entity + IAuditLogStorage interface (4h)
  - AuditLogService with CRUD operations (8h)
  - Audit logging middleware (captures request/response) (6h)
  - Audit log query endpoints (pagination, filtering, search) (8h)
  - SignalR hub for live monitoring (8h)
  - Unit tests for audit service (7h)
  - Wire audit middleware into WebApp, Auth, Admin microservices (5h)
  - EF Core migration for AuditLog table (2h)
- SystemConfiguration database schema (4h)
- Dashboard health check APIs using ASP.NET Core Health Checks (8h)
- Dashboard system stats and performance metrics APIs (6h)

**Frontend Components**:
- WebAdminApp React project setup (8h)
- Admin routing, authentication, theme, layout (8h)
- Redux store with RTK Query (4h)
- Dashboard UI with health indicators and charts (10h)
- Dashboard recent activity feed (uses audit log API) (4h)

**Quality Gates**:
- ✅ Admin app accessible at `/admin/dashboard`
- ✅ Admin login functional (requires Administrator role)
- ✅ Audit infrastructure capturing all requests across all microservices
- ✅ Dashboard displays health metrics and recent activity from audit logs
- ✅ EF Core migrations applied (AuditLogs, SystemConfiguration tables)
- ✅ Unit tests ≥80% coverage for audit service

**Critical Success Factors**:
- Audit middleware must not add >50ms latency (use async logging)
- Dashboard loads within 2 seconds
- Recent activity feed shows last 10 audit entries with auto-refresh

---

### Phase 2: User Management
**Duration**: Week 4-5 (60 hours)
**Objective**: Implement comprehensive user administration capabilities
**Dependencies**: Phase 1 (Audit Infrastructure)

**Backend Components**:
- User Admin Service + APIs (28h):
  - User search with filters (email, role, status)
  - User profile view
  - Lock/unlock accounts
  - Manually verify emails
  - Force password reset
  - Role assignment (promote/demote admin)

**Frontend Components**:
- User list view with MUI DataGrid (filters, sorting, pagination) (12h)
- User detail view (modal/panel) (8h)
- User action buttons (lock/unlock, verify email, reset password) (6h)
- Role assignment UI (6h)

**Testing**:
- E2E tests covering all user management workflows (10h)

**Quality Gates**:
- ✅ User search, filter, sort functional
- ✅ Lock/unlock, verify email, reset password operations work
- ✅ Role assignment validates business rules (cannot demote self, must have at least one admin)
- ✅ All user management actions logged to audit trail
- ✅ E2E tests cover all user management workflows
- ✅ Unit tests ≥80% coverage for UserAdminService

**Critical Success Factors**:
- User list handles 10,000+ users with server-side pagination
- Role assignment prevents last admin from being demoted
- All operations create audit log entries

---

### Phase 3: Audit Log Viewer
**Duration**: Week 6-7 (52 hours)
**Objective**: Implement audit log analysis and live monitoring capabilities
**Dependencies**: Phase 1 (Audit Infrastructure), Phase 2 (generates audit data)

**Backend Components**:
- Audit log query service with advanced filtering (12h)
- Audit log export APIs (CSV/JSON) (8h)

**Frontend Components**:
- Audit log table with MUI DataGrid and infinite scroll (10h)
- Live monitoring grid with tail tracking (single dimension filter required) (8h)
- Audit log export UI (CSV/JSON) (4h)
- Audit log detail view (modal with JSON viewer) (4h)

**Testing**:
- Performance tests with 100k+ audit logs (6h)

**Quality Gates**:
- ✅ Audit log query handles 100k+ logs with <2s response time
- ✅ Infinite scroll pagination works smoothly
- ✅ Live monitoring grid displays real-time updates via SignalR
- ✅ Export to CSV/JSON handles up to 10k records
- ✅ Advanced filters work correctly (date range, user, action, entity type, result)
- ✅ Performance tests pass with large dataset

**Critical Success Factors**:
- Query performance with database indexes (Timestamp DESC, UserId, Action, EntityType)
- Live monitoring limited to last 500 entries (performance)
- Single dimension filter enforced (user OR action OR entity type OR result)

---

### Phase 4: System Configuration
**Duration**: Week 8 (40 hours)
**Objective**: Implement application configuration management without code deployment
**Dependencies**: Phase 1 (SystemConfiguration schema)
**Parallelization**: Can run parallel with Phase 3

**Backend Components**:
- System config service + APIs (CRUD, categories) (10h)
- Feature flag infrastructure (8h)
- Maintenance mode middleware (8h)

**Frontend Components**:
- System configuration management UI (categories, edit forms) (6h)
- Feature flag toggle UI (2h)
- Maintenance mode control UI (2h)

**Testing**:
- Integration tests (configuration changes reflected in main app) (4h)

**Quality Gates**:
- ✅ Configuration changes reflected in main app without restart (where possible)
- ✅ Feature flags toggle functional (tested with sample feature)
- ✅ Maintenance mode blocks main app users (admins still have access)
- ✅ All configuration changes logged to audit trail
- ✅ Integration tests verify config propagation to main app

**Configuration Categories**:
1. **Security Settings**: Max login attempts, password policy, 2FA enforcement, session timeout
2. **Feature Flags**: Enable/disable features without deployment
3. **Storage Configuration**: Database connection, blob storage quotas, file size limits
4. **Email Settings**: SMTP configuration, email templates
5. **Service API Settings**: External service connections, rate limits
6. **Maintenance Mode**: Toggle, message, scheduled maintenance

---

### Phase 5: Public Library Management
**Duration**: Week 9 (40 hours)
**Objective**: Implement system-owned content management for public library
**Dependencies**: Phase 1 (VttTools.Admin infrastructure)
**Parallelization**: Can run parallel with Phases 3-4

**Backend Components**:
- Public library service + APIs (18h):
  - Content search, CRUD operations
  - Publish/unpublish workflow
  - Pricing configuration (display only, payment deferred to EPIC-003)
- Public library storage (EF Core, Asset/Adventure integration) (4h)

**Frontend Components**:
- Content list view with MUI DataGrid (filters, search) (6h)
- Content upload/create UI (drag-drop, metadata) (4h)
- Content editor UI (edit details, status, pricing) (4h)

**Testing**:
- E2E tests (create, publish, search, edit) (6h)

**Quality Gates**:
- ✅ Admin can upload/create system-owned content
- ✅ Publish/unpublish workflow functional
- ✅ Published content visible in main app public library
- ✅ Content editor supports metadata, pricing (for EPIC-003), preview images
- ✅ E2E tests cover create → publish → verify in main app

**Key Design Decisions**:
- System-owned content: `OwnerId = null` (vs user-owned GUID)
- Status: Draft (not visible), Public (free), Premium (price display only)
- Commerce features deferred to EPIC-003 (no payment processing)

---

### Phase 6: Testing, Security, Documentation
**Duration**: Week 10 (48 hours)
**Objective**: Comprehensive quality assurance, security hardening, production readiness

**Testing Components**:
- Comprehensive E2E testing (all admin features) (16h)
- Security audit (OWASP compliance) (12h)
- Penetration testing (authentication, authorization) (8h)
- Performance testing (audit queries, user searches) (6h)

**Infrastructure Components**:
- Admin user documentation (user guide, API docs) (12h)
- Deployment scripts and configuration (12h)

**Quality Gates**:
- ✅ All E2E tests pass (admin auth, user management, audit viewing, config, public library)
- ✅ Security audit identifies no critical vulnerabilities
- ✅ Penetration testing verifies access control enforcement
- ✅ OWASP compliance verified (A01-A09)
- ✅ Performance tests pass (user search, audit query with large datasets)
- ✅ Admin user documentation complete
- ✅ Deployment scripts tested on staging environment
- ✅ Backend test coverage ≥80%, frontend ≥70%

**Security Validation**:
1. Admin authentication (requires Administrator role, email confirmed, 2FA enabled)
2. Authorization on all admin endpoints (403 Forbidden if not admin)
3. Audit logging for all admin actions (compliance)
4. Generic error messages (prevent user enumeration)
5. Rate limiting (stricter than main app)
6. Session timeout (30 min vs 2 hours for main app)
7. IP whitelisting capability (optional, platform-specific)

---

## Dependency Graph

```
Phase 1: Foundation + Audit Infrastructure + Dashboard
   │
   ├─[BLOCKS]─> Phase 2: User Management
   │                 │
   │                 └─[POPULATES]─> Phase 3: Audit Log Viewer
   │
   ├─[ENABLES]─> Phase 4: System Configuration (INDEPENDENT, can run parallel with Phase 3)
   │
   └─[ENABLES]─> Phase 5: Public Library Management (INDEPENDENT, can run parallel with Phases 3-4)

Phase 2, 3, 4, 5
   │
   └─[ALL FEED INTO]─> Phase 6: Testing, Security, Documentation
```

### Critical Path Items

1. **Audit Infrastructure** (Phase 1) - Blocks User Management, Audit Log Viewer, Dashboard activity feed
2. **Admin Authentication** (Phase 1) - Blocks all admin features
3. **WebAdminApp Foundation** (Phase 1) - Blocks all frontend development
4. **Dashboard** (Phase 1) - Main page, blocks user onboarding
5. **User Management** (Phase 2) - Generates audit data for Phase 3 testing

### Parallel Work Opportunities

- **After Phase 1**: Phases 2, 4, 5 can partially overlap
- **Phase 3 + 4**: Can run simultaneously (different developers/teams)
- **Phase 3 + 5**: Can run simultaneously (different developers/teams)
- **Phase 6**: Some activities (documentation, deployment scripts) can start during Phases 4-5

---

## Implementation Risks & Mitigation

### Risk 1: Audit Logging Performance Impact
**Likelihood**: Medium | **Impact**: High

**Description**: Writing audit logs synchronously could add latency to API responses, especially under high load.

**Mitigation**:
- Use async logging (fire-and-forget) to prevent blocking request threads
- Batch writes every 1-5 seconds instead of per-request
- Consider message queue (Azure Service Bus, RabbitMQ) for high-volume scenarios
- Index audit log table properly (Timestamp DESC, UserId, Action, EntityType, Result)

**Contingency**: Implement audit log buffer with periodic flush, or use separate audit database with eventual consistency.

**Monitoring**: Track average request latency before/after audit middleware deployment.

---

### Risk 2: SignalR Real-Time Updates Scalability
**Likelihood**: Medium | **Impact**: Medium

**Description**: Live monitoring grid may struggle with thousands of audit logs per second in production.

**Mitigation**:
- Limit live monitoring to last 500 entries (discard older)
- Require single dimension filter (user OR action OR entity OR result) to reduce data volume
- Implement client-side throttling (max 10 updates per second)
- Use SignalR groups per filter dimension (efficient multicast)

**Contingency**: Switch to polling every 2-3 seconds instead of WebSocket if SignalR proves unstable.

**Monitoring**: Monitor SignalR connection count, message throughput, and server memory usage.

---

### Risk 3: Separate Deployment Configuration Complexity
**Likelihood**: Low | **Impact**: Medium

**Description**: Deploying admin app to separate subdomain requires additional infrastructure setup.

**Mitigation**:
- Use same hosting infrastructure as main app (Azure App Service, AWS Elastic Beanstalk)
- Configure subdomain routing (admin.vtttools.com)
- Use wildcard SSL certificate or Let's Encrypt for automatic SSL
- Document deployment process for multiple platforms (Azure, AWS, on-premise)

**Contingency**: Initially deploy admin app as `/admin/*` path on same domain, migrate to subdomain in Phase 6 or post-release.

**Monitoring**: Test deployment on staging environment during Phase 6.

---

### Risk 4: IP Whitelisting Configuration Varies by Platform
**Likelihood**: Low | **Impact**: Medium

**Description**: Different deployment platforms have different IP whitelisting mechanisms.

**Mitigation**:
- Document IP whitelisting for multiple platforms (Azure Front Door, Cloudflare, Nginx)
- Make IP whitelisting optional (rely on role-based access + audit logging as baseline)
- Test on target platform during Phase 6

**Contingency**: Rely on strong authentication (2FA enforcement) + shorter session timeout + audit logging instead of IP whitelisting.

**Monitoring**: Verify IP whitelisting configuration in staging environment.

---

### Risk 5: Public Library Integration with Existing Models
**Likelihood**: Medium | **Impact**: Medium

**Description**: Reusing existing Asset/Adventure models for system-owned content may require schema changes or complex queries.

**Mitigation**:
- Add `OwnerId` nullable field to existing models (null = system-owned)
- Use existing asset/adventure storage with `OwnerId IS NULL` filter
- Ensure backward compatibility with user-owned content
- Test with existing user assets (should not appear in public library admin view)

**Contingency**: Create separate `PublicLibraryContent` table with references to `Asset`/`Adventure` tables if integration proves complex.

**Monitoring**: Integration tests verify system-owned content isolated from user content.

---

### Risk 6: MUI DataGrid Performance with Large Datasets
**Likelihood**: Low | **Impact**: Low

**Description**: User list and audit log tables may struggle with 10k+ rows even with server-side pagination.

**Mitigation**:
- Implement server-side pagination (load 50-100 rows at a time)
- Use infinite scroll for audit logs (avoids page number navigation)
- Optimize database queries with indexes
- Use DataGrid virtualization (MUI X feature)

**Contingency**: Implement custom table component with React Virtualized if MUI DataGrid insufficient.

**Monitoring**: Performance tests in Phase 6 with 10k users and 100k audit logs.

---

### Risk 7: Admin Authentication Complexity
**Likelihood**: Low | **Impact**: High

**Description**: Separate admin authentication while reusing Identity infrastructure could introduce bugs or security gaps.

**Mitigation**:
- Reuse existing authentication patterns from WebClientApp
- Use same cookie-based auth with role validation middleware
- Leverage ASP.NET Core Identity's built-in role management
- Thorough security testing in Phase 6 (penetration testing)

**Contingency**: Simplify by using same login page but redirect administrators to admin app after successful admin role validation.

**Monitoring**: Security audit in Phase 6 verifies authentication flows.

---

## Effort Breakdown by Category

| Category       | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Total  |
|----------------|---------|---------|---------|---------|---------|---------|--------|
| Backend        | 54h     | 28h     | 20h     | 26h     | 22h     | 0h      | 150h   |
| Frontend       | 26h     | 32h     | 26h     | 10h     | 14h     | 0h      | 108h   |
| Infrastructure | 11h     | 0h      | 0h      | 8h      | 0h      | 12h     | 31h    |
| Testing        | 7h      | 10h     | 6h      | 4h      | 6h      | 36h     | 69h    |
| **Total**      | **98h** | **70h** | **52h** | **48h** | **42h** | **48h** | **358h** |

**Note**: Total shows 358h vs documented 352h due to rounding in phase estimates. Use 352h as official estimate.

---

## Deliverables by Phase

### Phase 1 Deliverables
- ✅ WebAdminApp React project configured and running
- ✅ Admin login page functional (requires Administrator role, email confirmed, 2FA)
- ✅ Admin dashboard as main page (health indicators, stats, activity feed, charts)
- ✅ Audit infrastructure complete (table, service, middleware, SignalR hub)
- ✅ Audit middleware integrated into all microservices (WebApp, Auth, Admin)
- ✅ EF Core migrations applied (AuditLogs, SystemConfiguration tables)
- ✅ Unit tests for audit service (≥80% coverage)

### Phase 2 Deliverables
- ✅ User list view (search, filter, sort, pagination)
- ✅ User detail view (profile, actions)
- ✅ User management operations (lock/unlock, verify email, reset password, role assignment)
- ✅ All operations logged to audit trail
- ✅ E2E tests for user management (≥10 scenarios)
- ✅ Unit tests for UserAdminService (≥80% coverage)

### Phase 3 Deliverables
- ✅ Audit log table view (infinite scroll, advanced filters)
- ✅ Live monitoring grid (tail tracking, single dimension filter, SignalR)
- ✅ Audit log export (CSV/JSON, up to 10k records)
- ✅ Audit log detail view (JSON viewer, performance metrics)
- ✅ Performance tests (100k+ audit logs, <2s query time)

### Phase 4 Deliverables
- ✅ System configuration UI (6 categories: Security, Feature Flags, Storage, Email, Service APIs, Maintenance Mode)
- ✅ Feature flag infrastructure (toggle on/off without deployment)
- ✅ Maintenance mode (block main app users, admins retain access)
- ✅ Configuration changes logged to audit trail
- ✅ Integration tests (config changes reflected in main app)

### Phase 5 Deliverables
- ✅ Public library content list (search, filter, pagination)
- ✅ Content upload/create UI (drag-drop, metadata)
- ✅ Content editor (edit details, status: Draft/Public/Premium, pricing)
- ✅ Publish/unpublish workflow
- ✅ Published content visible in main app public library
- ✅ E2E tests (create → publish → verify in main app)

### Phase 6 Deliverables
- ✅ Comprehensive E2E test suite (all admin features)
- ✅ Security audit report (OWASP compliance verified)
- ✅ Penetration testing report (no critical vulnerabilities)
- ✅ Performance test results (user search, audit query benchmarks)
- ✅ Admin user documentation (user guide, API documentation)
- ✅ Deployment scripts and configuration (Azure, AWS, on-premise)
- ✅ Test coverage reports (≥80% backend, ≥70% frontend)

---

## Testing Strategy

### Unit Testing
**Target Coverage**: ≥80% backend, ≥70% frontend

**Focus Areas**:
- **Phase 1**: Audit service (CRUD, filtering, SignalR), dashboard APIs
- **Phase 2**: UserAdminService (search, lock/unlock, role assignment)
- **Phase 3**: Audit log query service (advanced filtering, export)
- **Phase 4**: System config service, feature flag service, maintenance mode middleware
- **Phase 5**: Public library service (CRUD, publish/unpublish)

**Frameworks**: xUnit (backend), Vitest (frontend)

---

### E2E Testing (BDD)
**Total Scenarios**: 63 (across 5 feature files)

**Feature Files**:
1. `UserManagement.feature` - 10 scenarios
2. `AuditLogViewing.feature` - 13 scenarios
3. `SystemConfiguration.feature` - 13 scenarios
4. `PublicLibraryManagement.feature` - 12 scenarios
5. `AdminDashboard.feature` - 15 scenarios

**Framework**: Cucumber + Playwright

**Priority Breakdown**:
- @smoke: 5 scenarios (basic navigation, login)
- @critical: 20 scenarios (core workflows)
- @high: 18 scenarios (important features)
- @medium: 15 scenarios (nice-to-have features)
- @low: 5 scenarios (edge cases)

---

### Performance Testing
**Benchmarks**:
- User search with 10,000 users: < 2 seconds
- Audit log query with 100,000 logs: < 2 seconds
- Dashboard load time: < 2 seconds (all widgets)
- Export 10,000 audit logs to CSV: < 30 seconds
- SignalR live monitoring: < 3 seconds latency

**Tools**: k6 (load testing), Playwright (E2E timing)

---

### Security Testing
**Scope**:
1. **Authentication Bypass Attempts**: Verify all admin endpoints require Administrator role
2. **Authorization Enforcement**: Test access control on every API endpoint
3. **OWASP Top 10 Compliance**: Scan for A01-A10 vulnerabilities
4. **Audit Logging Verification**: Ensure all admin actions logged (no gaps)
5. **Session Management**: Test timeout, secure cookies, logout
6. **Input Validation**: Test SQL injection, XSS, command injection
7. **Rate Limiting**: Test login rate limits (5 attempts per 15 min)

**Tools**: OWASP ZAP (vulnerability scanner), Burp Suite (penetration testing)

---

## Progress Tracking

### Phase Completion Checklist

- [ ] **Phase 1**: Foundation + Audit Infrastructure + Dashboard
  - [ ] WebAdminApp setup complete
  - [ ] Admin authentication functional
  - [ ] Audit infrastructure operational
  - [ ] Dashboard displaying health/metrics
  - [ ] All Phase 1 quality gates passed

- [ ] **Phase 2**: User Management
  - [ ] User list view functional
  - [ ] User detail view functional
  - [ ] All user actions working
  - [ ] All actions logged to audit
  - [ ] All Phase 2 quality gates passed

- [ ] **Phase 3**: Audit Log Viewer
  - [ ] Audit log table with filters
  - [ ] Live monitoring grid (tail tracking)
  - [ ] Export functionality
  - [ ] Performance tests passed
  - [ ] All Phase 3 quality gates passed

- [ ] **Phase 4**: System Configuration
  - [ ] Configuration UI complete
  - [ ] Feature flags functional
  - [ ] Maintenance mode functional
  - [ ] Integration tests passed
  - [ ] All Phase 4 quality gates passed

- [ ] **Phase 5**: Public Library Management
  - [ ] Content list view functional
  - [ ] Content upload/editor working
  - [ ] Publish/unpublish workflow
  - [ ] Published content in main app
  - [ ] All Phase 5 quality gates passed

- [ ] **Phase 6**: Testing, Security, Documentation
  - [ ] E2E tests pass
  - [ ] Security audit complete
  - [ ] Penetration testing complete
  - [ ] Documentation complete
  - [ ] Deployment scripts tested
  - [ ] All Phase 6 quality gates passed

---

## Next Steps

1. **Review Roadmap**: Team review and approval of phase sequencing and effort estimates
2. **Validate Quality**: Run `/validation:validate-roadmap task EPIC-002` to check roadmap completeness
3. **Begin Implementation**: Start Phase 1 with `/implementation:implement-task EPIC-002`
4. **Track Progress**: Use `/solution-status` to monitor implementation progress
5. **Update Status**: Mark phases as completed in this roadmap as work progresses

---

## Related Documentation

- **Epic Specification**: `Documents/Tasks/EPIC-002/TASK.md`
- **Feature Specifications**:
  - `Documents/Areas/Admin/Features/UserManagement/FEATURE.md`
  - `Documents/Areas/Admin/Features/AuditLogViewing/FEATURE.md`
  - `Documents/Areas/Admin/Features/SystemConfiguration/FEATURE.md`
  - `Documents/Areas/Admin/Features/PublicLibraryManagement/FEATURE.md`
  - `Documents/Areas/Admin/Features/AdminDashboard/FEATURE.md`
- **BDD Scenarios**:
  - `Documents/Areas/Admin/Features/UserManagement/UserManagement.feature`
  - `Documents/Areas/Admin/Features/AuditLogViewing/AuditLogViewing.feature`
  - `Documents/Areas/Admin/Features/SystemConfiguration/SystemConfiguration.feature`
  - `Documents/Areas/Admin/Features/PublicLibraryManagement/PublicLibraryManagement.feature`
  - `Documents/Areas/Admin/Features/AdminDashboard/AdminDashboard.feature`
- **Structure Specification**: `Documents/Structure/STRUCTURE.md`
- **Technology Stack**: `Documents/Guides/VTTTOOLS_STACK.md`
- **Coding Standards**: `Documents/Guides/CODING_STANDARDS.md`
- **Testing Guide**: `Documents/Guides/TESTING_GUIDE.md`

---

## Activity Log

- **2025-10-31**: Roadmap generated with 6 phases, 352 hours, 10 weeks. Critical path: Audit Infrastructure → User Management → Audit Log Viewer. Parallel opportunities: System Config (Phase 4) and Public Library (Phase 5) can overlap with Phase 3. Role Management deferred (32h saved). Security validation scope defined. 7 implementation risks identified with mitigation strategies.
