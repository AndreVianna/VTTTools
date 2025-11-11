# Phase 11: Account Management

**Status**: 🚧 Partial (Backend ✅ Complete | Frontend 🚧 70%)
**Estimated**: 20h total | **Actual**: 16h | **Remaining**: 4-6h
**Backend**: ✅ COMPLETE (27 endpoints, 134 tests)
**Frontend**: 🚧 70% COMPLETE

---

## Objective

Implement profile settings, security settings, 2FA setup, password change pages

---

## Backend Status ✅ COMPLETE

**Location**: `/home/user/VTTTools/Source/Auth/`

**Delivered**:
- 27 API endpoints across 5 mappers:
  - Auth: 9 endpoints
  - Profile: 4 endpoints
  - Security: 1 endpoint
  - 2FA: 3 endpoints
  - Recovery: 2 endpoints
- Services: AuthService, ProfileService, SecurityService, TwoFactorAuthenticationService, RecoveryCodeService
- 134 unit tests in Auth.UnitTests
- Files: AuthEndpointsMapper, ProfileEndpointsMapper, SecurityEndpointsMapper, TwoFactorEndpointsMapper, RecoveryCodeEndpointsMapper

---

## Frontend Status 🚧 70% COMPLETE

**Completed**:
- ✅ ProfilePage with avatar upload/edit
- ✅ SecuritySettingsPage with 2FA status
- ✅ TwoFactorSetupForm (QR code + verification)
- ✅ RecoveryCodesManager (display + download)
- ✅ 4 RTK Query API slices (profileApi, securityApi, twoFactorApi, recoveryCodesApi)

**Remaining** (4-6h):
- 🔜 Password change dialog (2h)
- 🔜 Integration tests (2h)
- 🔜 UI polish (2h)

---

## Deliverables

- **Page**: ProfileSettingsPage
  - Description: User profile editing (name, email, preferences)
  - Complexity: Medium
  - Status: ✅ Complete

- **Page**: SecuritySettingsPage
  - Description: Security overview with 2FA status, recent activity
  - Complexity: Medium
  - Status: ✅ Complete

- **Component**: TwoFactorSetupDialog
  - Description: QR code display, verification, recovery codes generation (COMPLETES Phase 2's 2FA integration)
  - Complexity: High
  - Status: ✅ Complete

- **Component**: TwoFactorVerificationForm
  - Description: Verify 2FA code during login (component exists in Phase 2, flow testable after this phase)
  - Complexity: Medium
  - Status: ✅ Complete (from Phase 2)

- **Component**: RecoveryCodeForm
  - Description: Login with recovery code as 2FA alternative (component exists in Phase 2, flow testable after this phase)
  - Complexity: Low
  - Status: ✅ Complete (from Phase 2)

- **Component**: PasswordChangeDialog
  - Description: Current/new password form with validation and password visibility toggle
  - Complexity: Low
  - Status: 🔜 Pending (2h)

- **Component**: RecoveryCodesDisplay
  - Description: Secure display and download of recovery codes
  - Complexity: Low
  - Status: ✅ Complete

---

## Implementation Sequence

1. **Account API Extensions** (UI) - 2h ✅
   - Add profile, security, 2FA endpoints to auth API slice

2. **ProfileSettingsPage** (UI) - 4h ✅
   - Material-UI form for profile editing

3. **SecuritySettingsPage** (UI) - 3h ✅
   - Security overview page with 2FA section

4. **TwoFactorSetupDialog** (UI) - 5h ✅
   - QR code + verification + recovery codes flow

5. **PasswordChangeDialog** (UI) - 2h 🔜
   - Password change form with validation

---

## Success Criteria

- ✅ Profile updates persist correctly
- ✅ 2FA setup generates QR code and verifies
- ✅ Recovery codes display and download
- 🔜 Password change enforces validation rules

---

## Dependencies

- **Prerequisites**: Phase 2 (auth working)
- **Blocks**: None (independent from other phases)

**NOTE**: Can run in PARALLEL with Phases 4-9 (encounter editor/asset/content track) BUT COMPLETES Phase 2 auth features (2FA setup enables full 2FA testing). Not fully independent - it's auth feature completion.

---

## Validation

- Validate after phase: Profile update, 2FA setup, password change flows
- Quality gate: All account operations functional, security validated

---

## Related Documentation

- [CHANGELOG.md](../CHANGELOG.md#2025-10-31) - Version history
- [Main Roadmap](../ROADMAP.md) - Overall progress
