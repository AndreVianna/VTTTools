# EPIC-001 Implementation Notes

Use this file to track implementation progress, discoveries, and decisions.

## Current Focus
- Scene Editor: Grid rendering and token placement system (Phase 4 complete)

## Key Discoveries
- Konva performs excellently for tactical map rendering
- Material-UI theming works well with VTT brand colors
- Redux Toolkit significantly reduces boilerplate vs traditional Redux
- **Phase 1-2 Bugs**: Found and fixed registration field mapping, duplicate error displays, premature error messages

## Open Questions
None - All questions answered (see Decisions Made section)

## Phase 1-2 Fixes Applied (2025-10-03)

**Registration Bug Fixes**:
1. **Field Mapping**: Removed separate Username field, use Email as UserName
2. **DisplayName Field**: Added Name field that maps to DisplayName in backend
3. **Request Mapping**: Email → email + name, Name field → displayName
4. **Error Handling**: Fixed duplicate error messages (NetworkStatus + GlobalErrorDisplay conflict)
5. **Error Display**: Only show errors after submit attempt, not on page load
6. **Validation**: DisplayName 1-32 chars (matches backend StringLength constraint)
7. **Password Fields**: Removed confirm password, added visibility toggle (👁️ eye icon)
8. **Remember Me**: Added checkbox, fixed auth restoration from cookies on page load
9. **Forgot Password**: Added link to SimpleLoginForm, fixed PasswordResetRequestForm layout

**Login Form Enhancements**:
- Password visibility toggle (👁️ eye icon)
- Remember Me checkbox (working - persists auth after browser close/reopen)
- Forgot Password link (navigates to reset form)
- Error cleared on mount (no premature errors)

**Registration Form Enhancements**:
- Removed Confirm Password field (only 1 password field now)
- Password visibility toggle (👁️ eye icon)
- Fields: Email, Name (DisplayName), Password (3 total)

**Password Reset Form Enhancements**:
- Fixed layout (matches login/register professional styling)
- Removed Confirm Password field
- Password visibility toggle on New Password field
- Error cleared on mount

**Logout Fix**:
- Clear Redux state before API call (immediate UI update)
- Fixed isAuthenticated logic to handle effectiveUser properly

**Files Modified**:
- SimpleLoginForm.tsx: Password toggle, Remember Me, Forgot Password, error clearing
- SimpleRegistrationForm.tsx: Password toggle, removed confirm password, error clearing
- PasswordResetRequestForm.tsx: Fixed layout, error clearing
- PasswordResetConfirmForm.tsx: Removed confirm password
- useAuth.ts: Auth restoration useEffect, logout order, isAuthenticated logic
- domain.ts: Updated RegisterRequest interface
- App.tsx: Disabled GlobalErrorDisplay, added DashboardPage route
- LandingPage.tsx: Dashboard Preview with action cards

**Result**: Phase 2 COMPLETE and VALIDATED ✅
- ✅ Login working with Remember Me
- ✅ Logout working correctly
- ✅ Registration working (3 fields)
- ✅ Password reset accessible (not fully tested - email send requires SMTP)
- ✅ Dashboard Preview with action cards
- ✅ All password fields have visibility toggle
- ⚠️ 2FA components exist but untestable until Phase 10

## Decisions Made
- Using React-Konva wrapper instead of raw Konva API for better React integration
- Implementing grid as separate Konva Layer for independent rendering
- Token placement via drag-and-drop with snap-to-grid logic
- **Undo/Redo**: Implement with configurable history depth (default: 100 levels)
- **Offline Mode**: Save changes to localStorage on connection loss, block UI with "Connection Lost" message, submit pending changes on reconnect or app startup
- **Performance Target**: Scene editor must work smoothly with up to 100 tokens (requirement subject to future revision)

## Next Steps
1. Complete grid overlay rendering with configurable size/color
2. Implement token placement with asset library integration
3. Add layer management (background, grid, tokens, fog of war)
4. Implement undo/redo system with 100-level default history
5. Build offline mode with localStorage persistence and connection monitoring
6. Performance test with 100-token scenes and optimize as needed
