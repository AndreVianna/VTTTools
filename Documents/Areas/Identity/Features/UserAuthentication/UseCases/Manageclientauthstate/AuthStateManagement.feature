# Generated: 2025-10-11 (Phase 2 BDD Enhancement)
# Use Case: Manage Client Auth State
# Implementation: Redux authSlice, useAuth hook, cookie-based authentication
# Phase: EPIC-001 Phase 2 (State Management - Critical Missing Coverage)

@use-case @authentication @state-management @redux
Feature: Manage Client Auth State
  As a VTT Tools user
  I want my authentication state managed reliably across sessions
  So that I have a seamless experience without unexpected logouts or UI flashing

  Background:
    Given the VTT Tools application is loaded
    And Redux store is initialized

  # ═══════════════════════════════════════════════════════════════
  # REDUX AS PRIMARY SOURCE OF TRUTH
  # ═══════════════════════════════════════════════════════════════

  Rule: Redux authSlice.isAuthenticated is the primary source of truth for authentication status

    @critical @redux
    Scenario: Redux state overrides cached data after logout
      Given I am authenticated
      And RTK Query has cached user data
      When I log out
      Then Redux authSlice.isAuthenticated should be set to false FIRST
      And Redux authSlice.user should be cleared FIRST
      And THEN RTK Query cache should be reset
      And the UI should immediately reflect unauthenticated state
      And I should not see any cached authenticated UI elements flash

    @critical @redux @bug-fix
    Scenario: Logout clears Redux before navigation (prevents UI flashing)
      Given I am on the dashboard page
      And I am authenticated
      When I click logout
      Then Redux state should be cleared synchronously
      And navigation to "/login" should happen after Redux update
      And I should never see authenticated menu items flash
      And the login page should load without flashing authenticated UI

    @redux
    Scenario: Login synchronizes Redux and RTK Query
      Given I successfully log in with valid credentials
      When authentication completes
      Then Redux authSlice.isAuthenticated should be true
      And Redux authSlice.user should contain my user data
      And RTK Query should have user data in cache
      And both sources should be synchronized

  # ═══════════════════════════════════════════════════════════════
  # COOKIE-BASED SESSION RESTORATION
  # ═══════════════════════════════════════════════════════════════

  Rule: Session cookies enable auth restoration on app load

    @critical @session-restoration
    Scenario: Valid session cookie restores authentication on app load
      Given I previously logged in and closed the browser
      And a valid session cookie exists
      When I navigate to the application
      Then the app should detect the session cookie
      And Redux authSlice should be initialized to authenticated
      And my user data should be loaded from /api/auth/user
      And I should not see login/register prompts
      And I should see authenticated UI immediately

    @session-restoration
    Scenario: Expired session cookie shows unauthenticated state
      Given a session cookie exists but has expired
      When I navigate to the application
      Then the backend should return 401 Unauthorized
      And Redux authSlice.isAuthenticated should remain false
      And I should see the hero section on landing page
      And I should see login/register options

    @session-restoration
    Scenario: No session cookie returns 401 on auth check
      Given no session cookie exists
      When I navigate to the application
      Then the app should make ONE /api/auth/user call
      And the backend should return 401 Unauthorized
      And Redux authSlice.isAuthenticated should remain false
      And the landing page should show hero section
      And I should see "Start Creating" and "Explore Features" buttons

    @session-restoration @redux
    Scenario: Session restoration sets Redux overriding any cached state
      Given I have stale authenticated data in RTK Query cache from previous session
      And my session cookie has expired
      When I navigate to the application
      Then the backend returns 401 Unauthorized
      And Redux authSlice.isAuthenticated should be set to false
      And the stale cached data should be ignored
      And I should see unauthenticated UI (not cached authenticated UI)

  # ═══════════════════════════════════════════════════════════════
  # LOADING OVERLAY DURING AUTH INITIALIZATION
  # ═══════════════════════════════════════════════════════════════

  Rule: Loading states prevent jarring UI transitions during auth checks

    @critical @loading @ui
    Scenario: LoadingOverlay shown during auth initialization
      Given I navigate to the application with a session cookie
      When the app is checking authentication status
      And the /api/auth/user request is in flight
      Then I should see a full-screen LoadingOverlay
      And I should not see any page content yet
      And I should not see navigation flashing
      When authentication completes
      Then the LoadingOverlay should disappear
      And the appropriate page content should be displayed

    @loading @ui
    Scenario: LoadingOverlay hidden when auth check completes quickly
      Given auth initialization completes quickly
      When the app loads
      Then the LoadingOverlay duration should be minimal
      And the landing page should appear smoothly
      And I should not perceive any loading delay

  # NOTE: LoadingOverlay timeout not implemented - if auth hangs, LoadingOverlay persists
  # Future enhancement: Add 5-second timeout with error recovery

  # ═══════════════════════════════════════════════════════════════
  # PROTECTED ROUTE ENFORCEMENT
  # ═══════════════════════════════════════════════════════════════

  Rule: ProtectedRoute enforces authentication requirements consistently

    @protected-routes @authorization
    Scenario: ProtectedRoute redirects unauthenticated user to login
      Given I am not authenticated
      When I navigate to "/scene-editor" (requires authorization)
      Then I should be redirected to "/login"
      And the redirect should include returnUrl="/scene-editor"
      When I successfully log in
      Then I should be redirected to "/scene-editor"

    @protected-routes @authorization
    Scenario: ProtectedRoute allows access for authenticated user
      Given I am authenticated
      When I navigate to "/scene-editor"
      Then the page should load successfully
      And I should not be redirected
      And I should see the scene editor content

  # NOTE: Anonymous routes currently allow both authenticated and unauthenticated users
  # ProtectedRoute with authLevel='anonymous' does not redirect authenticated users
  # Future enhancement: May add redirect logic in later phases

  # ═══════════════════════════════════════════════════════════════
  # GLOBAL INITIALIZATION FLAG
  # ═══════════════════════════════════════════════════════════════

  @performance @initialization
  Scenario: Global auth initialized flag prevents redundant API calls
    Given the app has just loaded
    And globalAuthInitialized is false
    When the first auth check completes
    Then globalAuthInitialized should be set to true
    When another component mounts and checks auth
    Then no additional /api/auth/user calls should be made
    And the component should use existing Redux state

  # ═══════════════════════════════════════════════════════════════
  # ERROR RECOVERY & EDGE CASES
  # ═══════════════════════════════════════════════════════════════

  @error-handling @session-restoration
  Scenario: Handle corrupted session cookie gracefully
    Given a session cookie exists but is corrupted/invalid
    When the app tries to restore authentication
    Then the backend should return 401 Unauthorized
    And Redux should be set to unauthenticated
    And the corrupted cookie should be cleared
    And I should see the login page

  @edge-case @concurrency
  Scenario: Handle simultaneous auth checks from multiple components
    Given multiple components mount simultaneously
    And all components check authentication status
    When they all trigger useAuth hook
    Then only ONE /api/auth/user call should be made
    And all components should receive the same auth result
    And Redux state should be updated once

  @integration @post-login
  Scenario: Auth state persists across page navigation
    Given I am authenticated
    When I navigate between pages (/assets → /scene-editor → /)
    Then my authentication state should persist
    And I should not see LoadingOverlay on navigation
    And I should not be prompted to log in again
    And my session cookie should remain valid
