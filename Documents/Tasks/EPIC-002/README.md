# EPIC-002: Administration Application

**Quick Links**:
- [Full Task Specification](./TASK.md)
- [EPIC-001: UI Migration](../EPIC-001/TASK.md) (related world)
- [Product Backlog](../BACKLOG.md)

---

## Overview

The Administration Application (WebAdminApp) is a separate React-based administrative interface for managing VTTTools backend operations, including:

- **User Management**: Search, view, lock/unlock users, assign roles
- **Role Management**: View roles, assign users to roles
- **Audit Log Viewer**: Query, filter, and export audit logs for compliance
- **System Configuration**: Feature flags, maintenance mode, application settings
- **System Monitoring** (optional): Health checks, error logs, performance metrics

**Status**: Planned (0% complete)
**Effort**: 280-320 hours (8 weeks full-time)
**Priority**: Critical (production requirement)

---

## Strategic Importance

This world is a **production requirement** that must be completed before EPIC-001 Phase 13 (Release Preparation). Without an administration interface, critical operations would require direct database access or custom scripts.

### Why Separate from Main App?

1. **Security Isolation**: Admin functions cannot be accessed through main app
2. **Independent Deployment**: Admin app updates don't affect end users
3. **Role Segregation**: Clear separation between admin and user functionality
4. **Audit Trail**: All administrative actions logged for compliance
5. **Reduced Attack Surface**: Admin subdomain can be IP-whitelisted

---

## Phase Breakdown

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| 1 | Foundation & Infrastructure | 40h | 🔜 Planned |
| 2 | User Management | 60h | 🔜 Planned |
| 3 | Role Management | 32h | 🔜 Planned |
| 4 | Audit Log Viewer | 48h | 🔜 Planned |
| 5 | System Configuration | 40h | 🔜 Planned |
| 6 | Testing & Security | 48h | 🔜 Planned |
| 7 | System Monitoring (Optional) | 32h | 🔜 Post-Release |

---

## Technical Architecture

**Frontend**: React 19 + TypeScript + Material-UI (same as WebClientApp)
**Backend**: DDD Contracts + Service Implementation (consistent with existing backend)
**Deployment**: Separate subdomain (admin.vtttools.com)

**New Components**:
- `Source/WebAdminApp/` - React admin SPA
- `Source/Admin/` - Backend admin services and handlers
- `Source/Domain/Admin/` - Admin domain models (AuditLog, SystemConfiguration)
- `Source/Data/Admin/` - Admin data storage implementations
- `Source/Common/Middleware/` - Audit logging, maintenance mode middleware

---

## Dependencies

### Prerequisites (Blocking)
- ✅ EPIC-001 Phase 2 Complete (authentication patterns established)
- ✅ ASP.NET Core Identity Infrastructure (User/Role tables exist)
- ✅ Backend API Gateway (VttTools.WebApp project)

### Blocks
- EPIC-001 Phase 13 (Release Preparation) - cannot release without admin app

---

## Success Criteria

1. Admin can manage all users (search, lock/unlock, assign roles)
2. Admin can view and export audit logs (filter by date, user, action)
3. Admin can configure system settings (feature flags, maintenance mode)
4. Application deployed independently from main app with enhanced security
5. All admin actions are audited and logged

---

## Security Considerations

- Separate authentication from main app (Administrator role required)
- All admin API endpoints require Administrator role
- IP whitelisting recommended (infrastructure-level)
- All admin actions logged to audit trail (tamper-proof)
- HTTPS enforced, secure cookies, shorter session timeout
- OWASP Top 10 compliance (access control, injection prevention, security logging)

---

## Related Documentation

- [Full Task Specification](./TASK.md) - Complete world specification
- [EPIC-001 Task](../EPIC-001/TASK.md) - Main UI migration world
- [Authorization Requirements](../../Guides/AUTHORIZATION_REQUIREMENTS.md) - Role-based access control
- [VTTTools Stack](../../Guides/VTTTOOLS_STACK.md) - Technology stack reference
- [TypeScript Style Guide](../../Guides/TYPESCRIPT_STYLE_GUIDE.md) - Frontend coding standards
- [C# Style Guide](../../Guides/CSHARP_STYLE_GUIDE.md) - Backend coding standards

---

## Next Steps

1. Review full task specification in [TASK.md](./TASK.md)
2. Prioritize phases (recommend starting with Phase 1: Foundation)
3. Create detailed phase design documents as work progresses
4. Coordinate with EPIC-001 completion timeline

---

**Created**: 2025-10-31
**Last Updated**: 2025-10-31
