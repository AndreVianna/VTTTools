---
allowed-tools: [mcp__memory__create_entities, mcp__memory__delete_entities, mcp__memory__create_relations, mcp__memory__delete_relations, mcp__memory__add_observations, mcp__memory__delete_observations, mcp__memory__read_graph, mcp__memory__search_nodes, mcp__memory__open_nodes, Task, Read, Write, Edit, Glob, Grep, Bash, TodoWrite]
description: Extract Areas, Features, and Use Cases from existing codebase into specification files
argument-hint: {area_filter:string:optional} {feature_filter:string:optional} {dry_run:flag:optional(false)} {test_session_limit:flag:optional(false)}
---

# Extract Features Command

Discover and extract Areas, Features, and Use Cases from existing codebase, generating comprehensive specification files using established templates. Supports batch processing for large codebases with user approval workflow.

**Platform**: Cross-platform (Windows/Linux/macOS)

## Usage Examples

**Basic extraction (all areas):**
```
/extract-features
```

**Extract specific area:**
```
/extract-features "Authentication & Authorization"
```

**Extract specific feature:**
```
/extract-features "" "Asset Management"
```

**Dry run preview (no files created):**
```
/extract-features "" "" true
```

**Dry run with session limit test:**
```
/extract-features "" "" true true
```

## Parameters

- `{area_filter}` - Optional area name to filter extraction (e.g., "Asset Management")
- `{feature_filter}` - Optional feature name to filter extraction
- `{dry_run}` - Optional flag (true/false) to simulate extraction without creating files
- `{test_session_limit}` - Optional flag (true/false) to test session limit handling in dry run mode

## Features

### Scope Management
- **Automatic feasibility assessment** for large extractions (>50 files)
- **Script generation** for area-by-area extraction to avoid session limits
- **First area extraction** provides immediate progress while script handles rest

### Safe Testing
- **Dry run mode** previews extraction without creating files
- **Session limit testing** validates retry logic works correctly
- **Batch breakdown preview** shows execution plan before committing

### Intelligent Discovery
- **Technology detection** informs discovery process (C#, React, etc.)
- **Frontend classification rules** prevent monolithic "Frontend Application" features
- **Domain assignment review** catches misclassified components before generation

### Structural Validation
- **Automatic file placement validation** after generation
- **Auto-correction** moves misplaced files to correct nested structure
- **Comprehensive reporting** shows what was corrected and why

## Large Codebase Handling

When extracting >50 files, the command will:
1. Display warning with scope assessment
2. Offer three options:
   - **A) Generate script + extract first area** (recommended)
   - **B) Dry run preview** (safe testing)
   - **C) Continue with full extraction** (risky, uses retry logic)

**Option A** is recommended because:
- Each area extraction is atomic (no partial failures)
- No session limit issues (separate sessions per area)
- Immediate progress (first area extracted right away)
- Clear completion path (run script for remaining areas)

## Phase 0: Validation & Setup

- **STEP 0A**: Validate current directory is project root
  - Use Bash tool: "pwd" to confirm current directory
  - Set {project_folder} = current working directory
- **STEP 0B**: Ensure output directory structure exists
  - Use Bash tool: "mkdir -p Documents/Areas" to create base directory
- **STEP 0C**: Validate templates exist
  - Use Read tool to load ".claude/templates/FEATURE_TEMPLATE.md" - abort if missing
  - Use Read tool to load ".claude/templates/USE_CASE_TEMPLATE.md" - abort if missing
  - Store template contents for reference: {feature_template}, {use_case_template}
- **STEP 0D**: Parse optional filters
  <if ({area_filter} is not empty)>
  - Set {filter_mode} = "area"
  - Display: "Filtering by area: {area_filter}"
  </if>
  <if ({feature_filter} is not empty)>
  - Set {filter_mode} = "feature"
  - Display: "Filtering by feature: {feature_filter}"
  </if>
  <if ({area_filter} is empty and {feature_filter} is empty)>
  - Set {filter_mode} = "all"
  - Display: "Discovering all areas, features, and use cases"
  </if>

## Phase 0E: Technology Detection

- **STEP 0E1**: Detect project technologies
  - Use Glob to find technology indicators:
    - Backend: "**/*.csproj" (C#/.NET), "**/pom.xml" (Java), "**/package.json" (Node.js)
    - Frontend: Check package.json for: react, vue, angular, svelte
    - Database: grep for DbContext, JpaRepository, models.Model
  - Store detected technologies for discovery guidance

## Phase 0F: Feasibility Assessment & Scope Planning

- **STEP 0F1**: Calculate extraction scope (skip if dry_run mode or area/feature filter active)
  <if ({filter_mode} equals "all" and {dry_run} equals false)>
  - Set {total_files} = calculated from discovery (will be known after Phase 1)
  - Note: This assessment happens AFTER discovery, before user approval
  </if>

- **STEP 0F2**: Assess feasibility (performed after Phase 2 discovery presentation)
  - Calculate: {total_files} = {total_features} + {total_use_cases}
  - Calculate: {estimated_context} = {total_files} * 800 (rough average tokens per file)
  - Calculate: {estimated_time_seconds} = {total_files} * 45 (seconds per file)
  - Calculate: {estimated_time_minutes} = {estimated_time_seconds} / 60

  <if ({total_files} is greater than 50 OR {estimated_context} is greater than 100000)>
    - Set {scope_warning} = true
    - Set {recommended_approach} = "script_generation"
  <else>
    - Set {scope_warning} = false
    - Set {recommended_approach} = "single_session"
  </if>

- **STEP 0F3**: Display scope assessment and options (if large scope detected)
  <if ({scope_warning} is true AND {filter_mode} equals "all")>
    ```
    ⚠️  LARGE SCOPE DETECTED
    ═══════════════════════════════════════════════════════════
    Total Files: {total_files} ({total_features} features + {total_use_cases} use cases)
    Estimated Context: {estimated_context} tokens
    Estimated Time: {estimated_time_minutes} minutes
    Risk Level: HIGH - Session limits likely

    RECOMMENDED APPROACH:
    A) Generate extraction script + extract first area now (safest, recommended)
       - Script will contain area-by-area commands
       - First area extracted immediately for instant progress
       - Run script at your convenience for remaining areas

    B) Dry run preview (safe testing, no files created)
       - See execution plan without creating files
       - Validate batch breakdown and timings
       - Test session limit handling (optional)

    C) Continue with full extraction (risky)
       - Attempt all {total_files} files in single session
       - May hit session limits (retry logic will help)
       - Partial completion possible

    ═══════════════════════════════════════════════════════════

    Your choice (A/B/C):
    ```

    - Wait for user input
    - <case {user_choice}>
      <is "A" or "a">
        - Set {extraction_mode} = "script_generation"
        - Display: "Generating extraction script and extracting first area..."
        - Proceed to script generation (Phase 0F4)
      </is>
      <is "B" or "b">
        - Set {dry_run} = true
        - Display: "Entering dry run mode - no files will be created"
        - Proceed to Phase 1
      </is>
      <is "C" or "c">
        - Set {extraction_mode} = "full_extraction"
        - Display: "⚠️  Proceeding with high-risk full extraction. Retry logic active if session limits hit."
        - Proceed to Phase 1 (normal flow)
      </is>
      <otherwise>
        - Display: "Invalid choice. Defaulting to option A (script generation)"
        - Set {extraction_mode} = "script_generation"
      </otherwise>
    </case>
  <else>
    - Set {extraction_mode} = "single_session"
    - Display: "Scope feasible for single session extraction"
  </if>

- **STEP 0F4**: Generate extraction script (if script_generation mode selected)
  <if ({extraction_mode} equals "script_generation")>
    - Detect platform using Bash tool: "uname -s" (or check OSTYPE on Windows)
    - <case {platform}>
      <is "win32" or "Windows">
        - Set {script_name} = "extract_all_features.ps1"
        - Set {script_lang} = "PowerShell"
        - Generate PowerShell script (see template below)
      </is>
      <otherwise>
        - Set {script_name} = "extract_all_features.sh"
        - Set {script_lang} = "Bash"
        - Generate Bash script (see template below)
      </otherwise>
    </case>

    - **PowerShell Script Template:**
      ```powershell
      # Generated Extraction Script for {project_folder}
      # Created: {current_date}
      # Total: {total_files} files across {total_areas} areas

      Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
      Write-Host "VttTools Feature Extraction - Area-by-Area Execution" -ForegroundColor Cyan
      Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
      Write-Host ""

      $areas = @(
        <foreach {area} in {discovery_structure}>
        @{Name="{area.area_name}"; Features={area.feature_count}; UseCases={area.use_case_count}; Total={area.feature_count + area.use_case_count}},
        </foreach>
      )

      $totalAreas = $areas.Count
      $currentArea = 0

      foreach ($area in $areas) {
        $currentArea++
        Write-Host "[$currentArea/$totalAreas] Extracting: $($area.Name) ($($area.Total) files)" -ForegroundColor Yellow

        # Run extract-features for this area
        & claude /extract-features "$($area.Name)"

        if ($LASTEXITCODE -ne 0) {
          Write-Host "ERROR: Failed to extract $($area.Name)" -ForegroundColor Red
          Write-Host "You can resume by running this script again or manually running:" -ForegroundColor Red
          Write-Host "  /extract-features '$($area.Name)'" -ForegroundColor Red
          exit 1
        }

        Write-Host "✓ Completed: $($area.Name)" -ForegroundColor Green
        Write-Host ""
      }

      Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
      Write-Host "All areas extracted successfully!" -ForegroundColor Green
      Write-Host "Running final validation..." -ForegroundColor Cyan

      & claude /validate-solution

      Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
      Write-Host "Extraction complete!" -ForegroundColor Green
      ```

    - **Bash Script Template:**
      ```bash
      #!/bin/bash
      # Generated Extraction Script for {project_folder}
      # Created: {current_date}
      # Total: {total_files} files across {total_areas} areas

      echo "═══════════════════════════════════════════════════════════"
      echo "VttTools Feature Extraction - Area-by-Area Execution"
      echo "═══════════════════════════════════════════════════════════"
      echo ""

      areas=(
        <foreach {area} in {discovery_structure}>
        "{area.area_name}:{area.feature_count + area.use_case_count}"
        </foreach>
      )

      total_areas=${#areas[@]}
      current_area=0

      for area_info in "${areas[@]}"; do
        current_area=$((current_area + 1))
        area_name="${area_info%%:*}"
        file_count="${area_info##*:}"

        echo "[$current_area/$total_areas] Extracting: $area_name ($file_count files)"

        claude /extract-features "$area_name"

        if [ $? -ne 0 ]; then
          echo "ERROR: Failed to extract $area_name"
          echo "You can resume by running this script again or manually running:"
          echo "  /extract-features '$area_name'"
          exit 1
        fi

        echo "✓ Completed: $area_name"
        echo ""
      done

      echo "═══════════════════════════════════════════════════════════"
      echo "All areas extracted successfully!"
      echo "Running final validation..."

      claude /validate-solution

      echo "═══════════════════════════════════════════════════════════"
      echo "Extraction complete!"
      ```

    - Write script to file: ".claude/scripts/{script_name}"
    - <if ({script_lang} equals "Bash")>
      - Make executable: "chmod +x .claude/scripts/{script_name}"
    </if>

    - Display script location and instructions:
      ```
      ✓ Extraction script generated!
      ═══════════════════════════════════════════════════════════
      Location: .claude/scripts/{script_name}

      To complete extraction, run:
      <if ({script_lang} equals "PowerShell")>
      pwsh .claude/scripts/{script_name}
      </if>
      <if ({script_lang} equals "Bash")>
      bash .claude/scripts/{script_name}
      </if>

      The script will extract each area separately to avoid session limits.
      ═══════════════════════════════════════════════════════════

      Extracting first area now to provide immediate progress...
      ```

    - Identify largest area (most files): {first_area}
    - Set {area_filter} = {first_area}
    - Set {filter_mode} = "area"
    - Display: "Starting extraction: {first_area} ({first_area_file_count} files)"
    - Continue to Phase 1 with area filter set
  </if>

## Phase 1: Codebase Discovery

- **STEP 1A**: Initialize discovery memory entity
  - Use mcp__memory__create_entities to create:
    - name: "feature_extraction_{timestamp}"
    - entityType: "extraction_session"
    - observations: ["status: discovery_started", "discovery_complete: false", "filter_mode: {filter_mode}", "area_filter: {area_filter}", "feature_filter: {feature_filter}"]
- **STEP 1B**: Use Task tool with solution-engineer agent with EXACT prompt:
  ```markdown
  ROLE: Codebase Structure Discovery Analyst

  TASK: Systematically analyze codebase to discover functional Areas, Features, and Use Cases

  PROJECT FOLDER: {project_folder}
  FILTER MODE: {filter_mode}
  <if ({filter_mode} equals "area")>
  AREA FILTER: Only discover features and use cases in area matching "{area_filter}"
  </if>
  <if ({filter_mode} equals "feature")>
  FEATURE FILTER: Only discover use cases for feature matching "{feature_filter}"
  </if>

  DISCOVERY METHODOLOGY:

  1. **AREA DISCOVERY** (Domain Boundaries):
     - Analyze folder structure for logical domain groupings
     - Identify modules, packages, or namespaces representing bounded contexts
     - Look for: src/[AreaName]/, app/domains/[AreaName]/, modules/[AreaName]/
     - Common areas: User Management, Budget Management, Transaction Management, Reporting, etc.
     - Extract area name from folder structure or namespace

  2. **FEATURE DISCOVERY** (Major Capabilities):
     - Within each area, identify major feature sets or capabilities
     - Look for: feature folders, service groups, controller groups, major components
     - Features are collections of related use cases serving a business goal
     - Example: "SmartBudgeting" feature contains "AnalyzeSpending", "GenerateRecommendations" use cases
     - Extract from: folder names, service class names, feature flags, documentation

  3. **USE CASE DISCOVERY** (Specific Operations):
     - Within each feature, identify specific operations or behaviors
     - Look for: service methods, controller actions, command handlers, API endpoints
     - Use cases are concrete operations users or systems perform
     - Extract from: method names, endpoint paths, command names, operation handlers
     - Example: "CreateBudget", "UpdateBudget", "DeleteBudget", "AnalyzeSpending"

  ANALYSIS GUIDELINES:

  - **Use code structure as primary source**: Folder organization, namespaces, class names
  - **Look for documentation**: README files, code comments, API docs for feature descriptions
  - **Identify patterns**: RESTful endpoints, CQRS commands/queries, service operations
  - **Infer relationships**: Group use cases by shared domain entities or business purpose
  - **Apply filters**: Honor area_filter and feature_filter to limit discovery scope
  - **Use Title Case**: "Budget Management" not "budget-management"

  CRITICAL FRONTEND COMPONENT CLASSIFICATION RULES:

  **DOMAIN-SPECIFIC UI (Assign to Business Domain, NOT Infrastructure):**
  - Login/Registration/Password Reset UI → Authentication & Authorization area
  - User Profile/Settings/Security UI → Authentication & Authorization area (Account Management feature)
  - Two-Factor Authentication UI → Authentication & Authorization area (Two Factor Authentication feature)
  - Asset Editors/Viewers/Lists → Asset Management area
  - Scene Editors/Canvas/Viewers → Adventure Library / Scene Management area
  - Game Session Controls/Chat/Dice → Game Session Management area
  - Landing Page (unauthenticated) → Onboarding area (separate area for marketing/entry)

  **INFRASTRUCTURE UI (Assign to Platform Infrastructure ONLY if truly cross-cutting):**
  - App Shell/Layout/Navigation (AppLayout, Navbar, Sidebar) → Platform Infrastructure
  - Theme System (ThemeProvider, useTheme, color schemes) → Platform Infrastructure
  - Error Boundaries (ErrorBoundary, ErrorFallback) → Platform Infrastructure
  - Network Status Indicators → Platform Infrastructure
  - Loading Spinners/Skeletons (global, not domain-specific) → Platform Infrastructure

  **FRONTEND DISCOVERY METHODOLOGY:**
  1. For each React/Vue/Angular component:
     - Read component code to identify purpose
     - Check what API endpoints it calls (e.g., /api/auth/login → Authentication)
     - Check what domain entities it displays (e.g., Asset → Asset Management)
     - Check component name patterns (LoginPage, AssetCard → infer domain)
     - Check imports (imports AuthService types → Authentication)

  2. DO NOT create monolithic "Frontend Application" feature
     - Frontend components belong to their BUSINESS DOMAINS
     - Only cross-cutting UI infrastructure goes to Platform Infrastructure
     - Landing page gets its own area (Onboarding)

  3. Backend-Frontend Pairing:
     - If backend has IAuthenticationService, frontend MUST have Authentication UI in same area
     - If backend has IAssetService, frontend MUST have Asset UI in same area
     - Pair backend services with frontend components in same domain area

  DISCOVERY SCOPE:

  <case {filter_mode}>
  <is "all">
  - Discover ALL areas in the codebase
  - Discover ALL features within each area
  - Discover ALL use cases within each feature
  </is>
  <is "area">
  - Find area matching "{area_filter}"
  - Discover ALL features within matched area
  - Discover ALL use cases within each feature
  </is>
  <is "feature">
  - Find feature matching "{feature_filter}" across all areas
  - Discover parent area for matched feature
  - Discover ALL use cases within matched feature
  </is>
  </case>

  OUTPUT FORMAT (Hierarchical JSON):

  ```json
  {
    "discovery_complete": true,
    "total_areas": 4,
    "total_features": 12,
    "total_use_cases": 38,
    "structure": [
      {
        "area_name": "Budget Management",
        "area_description": "Manages budget creation, tracking, and optimization",
        "feature_count": 3,
        "use_case_count": 9,
        "features": [
          {
            "feature_name": "SmartBudgeting",
            "feature_description": "AI-powered budget optimization with predictive analytics",
            "feature_type": "Enhancement",
            "use_case_count": 3,
            "use_cases": [
              {
                "use_case_name": "AnalyzeSpendingPatterns",
                "use_case_description": "Analyze historical spending to identify patterns and trends",
                "use_case_type": "Core Operation"
              },
              {
                "use_case_name": "GenerateBudgetRecommendations",
                "use_case_description": "Generate AI-powered budget optimization recommendations",
                "use_case_type": "Core Operation"
              }
            ]
          }
        ]
      }
    ]
  }
  ```

  IMPORTANT:
  - Return ONLY the JSON structure, no additional commentary
  - Ensure all names use proper Title Case
  - Provide brief descriptions for areas and features
  - Set discovery_complete to true when finished
  - Include accurate counts at all levels
  ```
- **STEP 1C**: Parse agent response to extract discovery JSON
  - Validate JSON structure is complete
  - Extract {total_areas}, {total_features}, {total_use_cases}
  - Store {discovery_structure} for next phase

## Phase 1D: Domain Assignment Review & Validation

- **STEP 1D1**: Analyze frontend component assignments
  - Identify all UI-related use cases in discovery structure
  - Check for monolithic "Frontend Application" or "Platform Infrastructure" features with many use cases
  - Flag suspicious patterns:
    - Feature with >10 use cases (likely needs splitting)
    - Use case names starting with "Render" not in their business domain
    - UI components grouped under "Infrastructure" that serve specific domains

- **STEP 1D2**: Generate domain assignment report
  - Display frontend component assignments grouped by area
  - Highlight potentially misclassified components
  - Suggest corrections based on component names and patterns

- **STEP 1D3**: Display assignment review to user:
  ```
  ═══════════════════════════════════════════════════════════
  DOMAIN ASSIGNMENT REVIEW
  ═══════════════════════════════════════════════════════════

  Please review frontend component assignments:

  ✓ CORRECTLY ASSIGNED (Likely):
  Authentication & Authorization:
    - User Authentication: Login, Logout, Register, GetCurrentUser
    - Account Management: ChangePassword, UpdateProfile

  Asset Management:
    - Asset Templates: GetAssets, CreateAsset, UpdateAsset

  ⚠️ REVIEW NEEDED:
  Platform Infrastructure → Frontend Application (13 use cases):
    - RenderLoginPage → Should be: Authentication & Authorization / User Authentication
    - RenderRegistrationForm → Should be: Authentication & Authorization / User Authentication
    - RenderProfileSettings → Should be: Authentication & Authorization / Account Management
    - RenderLandingPage → Should be: Onboarding (new area) / Landing Page
    - HandleAssetLoadingError → Should be: Asset Management / Asset Templates
    - HandleSceneRecovery → Should be: Adventure Library / Scene Management
    ✓ RenderAppLayout → Correctly in Platform Infrastructure
    ✓ ApplyTheme → Correctly in Platform Infrastructure
    ✓ HandleErrorBoundary → Correctly in Platform Infrastructure
    ✓ DisplayNetworkStatus → Correctly in Platform Infrastructure

  SUGGESTED CORRECTIONS:
  1. Create "Onboarding" area with "Landing Page" feature
  2. Move authentication UI to Authentication & Authorization area
  3. Move domain-specific error handlers to their respective areas
  4. Keep only cross-cutting UI in Platform Infrastructure

  ═══════════════════════════════════════════════════════════

  Options:
  A) Accept discovery as-is and proceed to generation
  B) Apply suggested corrections automatically
  C) Cancel and manually edit discovery structure

  Your choice (A/B/C):
  ```

- **STEP 1D4**: Process user response
  <if (user chooses "A")>
    - Proceed with current discovery structure (no changes)
    - Add observation to memory: "domain_review: accepted_as_is"
  </if>

  <if (user chooses "B")>
    - Apply suggested corrections to discovery structure:
      - Create Onboarding area if Landing Page detected
      - Move UI components to their proper domains based on naming patterns
      - Split monolithic Frontend features into domain-specific features
      - Update {discovery_structure} with corrections
    - Display: "✓ Corrections applied. Updated structure will be used for generation."
    - Add observation to memory: "domain_review: corrections_applied"
  </if>

  <if (user chooses "C")>
    - Display: "Extraction cancelled. Please review discovery structure and re-run command."
    - Add observation to memory: "domain_review: cancelled_by_user"
    - Abort command execution
  </if>

## Phase 2: Discovery Presentation & User Approval

- **STEP 2A**: Display discovered structure to user:
  ```
  ═══════════════════════════════════════════════════════════
  DISCOVERED STRUCTURE
  ═══════════════════════════════════════════════════════════

  Total: {total_areas} Areas, {total_features} Features, {total_use_cases} Use Cases

  <foreach {area} in {discovery_structure}>
  Area: {area.area_name} ({area.feature_count} features, {area.use_case_count} use cases)
    <foreach {feature} in {area.features}>
    ✓ {feature.feature_name} ({feature.use_case_count} use cases)
      <foreach {use_case} in {feature.use_cases}>
      - {use_case.use_case_name}
      </foreach>
    </foreach>
  </foreach>

  ═══════════════════════════════════════════════════════════
  GENERATION PLAN
  ═══════════════════════════════════════════════════════════

  <if ({total_features} is less than or equal to 5)>
  Strategy: Single batch generation
  </if>
  <if ({total_features} is greater than 5)>
  Strategy: Batch processing (5 features per batch, organized by area)
  Estimated batches: {calculated_batch_count}
  </if>

  Files to create:
  - Area specifications: {total_areas} files
  - Feature specifications: {total_features} files
  - Use case specifications: {total_use_cases} files

  Output location: Documents/Areas/{area_name}/Features/ and UseCases/
  ```
- **STEP 2B**: Wait for user confirmation
  - Display: "Proceed with extraction? (Y/N)"
  - <if (user responds with anything other than Y or yes)>
    - Display: "Extraction cancelled by user"
    - Abort command
  </if>

## Phase 3: Batch Generation Planning

- **STEP 3A**: Calculate batch strategy:
  <if ({total_features} is less than or equal to 5)>
  - Set {batch_strategy} = "single"
  - Set {batch_list} = single batch containing all areas
  </if>
  <if ({total_features} is greater than 5)>
  - Set {batch_strategy} = "area_based"
  - Create batches by area, splitting areas with >5 features into sub-batches
  </if>
- **STEP 3B**: Build batch todo list:
  ```
  {batch_todos:list} = []
  <foreach {area} in {discovery_structure}>
    <if ({area.feature_count} is less than or equal to 5)>
      Add to batch_todos: "Extract Area: {area.area_name} ({area.feature_count} features, {area.use_case_count} use cases)"
    <else>
      {batch_number:number} = 1
      {features_remaining:number} = {area.feature_count}
      <while ({features_remaining} is greater than 0)>
        {batch_size:number} = minimum of ({features_remaining}, 5)
        {start_index:number} = ({batch_number} - 1) * 5 + 1
        {end_index:number} = {start_index} + {batch_size} - 1
        Add to batch_todos: "Extract {area.area_name} - Batch {batch_number} (Features {start_index}-{end_index})"
        {features_remaining} = {features_remaining} - 5
        {batch_number} = {batch_number} + 1
      </while>
    </if>
  </foreach>
  ```
- **STEP 3C**: Create initial todo list using TodoWrite tool:
  - Convert {batch_todos} list to todo items with status "pending"
  - All todos have activeForm describing what's being extracted

## Phase 4: Sequential Batch Execution

<if ({dry_run} equals true)>
## DRY RUN MODE - Simulated Execution (No Files Created)

- **STEP 4-DR1**: Display dry run header
  ```
  ═══════════════════════════════════════════════════════════
  DRY RUN MODE - No files will be created
  ═══════════════════════════════════════════════════════════
  Simulating extraction process to preview execution plan...
  ```

- **STEP 4-DR2**: Simulate batch execution
  <foreach {batch_todo} in {batch_todos}>
    - Display: "Batch {current}/{total}: {batch_name}"
    - Display: "  Would generate: {feature_count} features, {use_case_count} use cases"
    - Calculate: {estimated_seconds} = ({feature_count} + {use_case_count}) * 45
    - Display: "  Estimated time: {estimated_seconds}s (~{estimated_seconds/60} minutes)"
    - Display: "  Estimated context: {(feature_count + use_case_count) * 800} tokens"

    <if ({test_session_limit} equals true AND {current} equals 2)>
      - Display: "  ⚠️  TEST MODE: Simulating session limit on this batch"
      - Display: "  📋 Would add to retry queue"
      - Set {has_retry} = true
    <else>
      - Display: "  ✓ Would complete successfully"
    </if>

    - Sleep 1 second (simulate processing time)
    - Display: ""
  </foreach>

- **STEP 4-DR3**: Simulate retry queue processing
  <if ({has_retry} equals true)>
    - Display: "═══════════════════════════════════════════════════════════"
    - Display: "TEST: Processing retry queue (1 batch)..."
    - Display: "  ⏱️  Would wait 30 seconds for session cooldown"
    - Display: "  (Simulated as 2 seconds in dry run)"
    - Sleep 2 seconds
    - Display: "  ✓ Retry would succeed: Batch 2"
    - Display: ""
  </if>

- **STEP 4-DR4**: Display dry run summary
  - Calculate totals from all batches
  - Display:
    ```
    ═══════════════════════════════════════════════════════════
    DRY RUN SUMMARY
    ═══════════════════════════════════════════════════════════

    Would Create:
    - Features: {total_features} files
    - Use Cases: {total_use_cases} files
    - Total: {total_files} specification files

    Estimated Resources:
    - Total Context: {estimated_context} tokens
    - Total Time: ~{estimated_time_minutes} minutes
    - Batches: {batch_count}

    <if ({test_session_limit})>
    Test Scenario Results:
    - ✓ Session limit detection: Working
    - ✓ Retry queue: Working
    - ✓ Cooldown period: Working
    </if>

    Validation:
    - ✓ Batch breakdown: Appropriate
    - ✓ No individual batch >50 files
    - ✓ Structure validation would run after generation

    ═══════════════════════════════════════════════════════════

    Dry run complete! No files were created.

    To execute actual extraction:
    <if ({filter_mode} equals "all")>
    - Run: /extract-features
    - Or use generated script (if available)
    </if>
    <if ({filter_mode} equals "area")>
    - Run: /extract-features "{area_filter}"
    </if>
    <if ({filter_mode} equals "feature")>
    - Run: /extract-features "" "{feature_filter}"
    </if>

    ═══════════════════════════════════════════════════════════
    ```

  - Skip to Phase 5 (final report showing dry run was performed)

</if>

<if ({dry_run} equals false)>
## LIVE EXECUTION MODE - Files Will Be Created

- **STEP 4A**: Initialize batch execution tracking
  - Set {failed_batches} = []
  - Set {retry_queue} = []

- **STEP 4B**: Execute batches sequentially with failure detection:
  <foreach {batch_todo} in {batch_todos}>
  - Mark current batch as "in_progress" using TodoWrite
  - Extract area name from batch_todo text
  - Get features for this batch from {discovery_structure}

  - **Attempt batch generation:**
    <foreach {feature} in {batch_features}>
    - **STEP 4A1**: Extract and generate feature specification
    - **STEP 4A2**: Extract and generate use case specifications for feature
    - **STEP 4A3**: Update memory graph with entities and relationships
    </foreach>

  - **Check for failures:**
    <if (any agent returned "Session limit reached" or "Session limit exceeded")>
      - Display: "⚠️ Batch {batch_name} hit session limit - adding to retry queue"
      - Add batch to {retry_queue}
      - Mark batch as "failed" with reason "session_limit"
      - Continue to next batch (don't mark as completed)
    <else>
      - Mark batch as "completed" using TodoWrite
      - Report: "✓ Completed batch {current_batch}/{total_batches}: {area_name}"
    </if>
  </foreach>

- **STEP 4C**: Process retry queue
  <if ({retry_queue} is not empty)>
    - Display: "Processing {retry_queue.length} failed batches..."
    - Wait 30 seconds for session cooldown

    <foreach {failed_batch} in {retry_queue}>
      - Display: "Retrying batch: {failed_batch.name}"
      - Mark batch as "in_progress" using TodoWrite
      - Retry batch generation (same as STEP 4B)

      <if (retry succeeds)>
        - Mark batch as "completed"
        - Report: "✓ Retry successful: {failed_batch.name}"
      <else>
        - Add to {failed_batches}
        - Display: "❌ Retry failed: {failed_batch.name}"
      </if>
    </foreach>
  </if>

- **STEP 4D**: Report batch execution results
  <if ({failed_batches} is not empty)>
    ```
    ⚠️  WARNING: Some batches failed after retry
    ═══════════════════════════════════════════════════════════
    Failed Batches ({failed_batches.length}):
    <foreach {batch} in {failed_batches}>
    - {batch.name} (Reason: {batch.reason})
    </foreach>

    Recommendation: Re-run command with area filter for failed batches
    Example: /extract-features "{failed_batch_area}"
    ═══════════════════════════════════════════════════════════
    ```
  </if>

### Phase 4A1: Feature Specification Generation

- **For each feature in batch**:
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: Feature Specification Extraction Analyst

    TASK: Extract detailed feature specification from codebase implementation

    FEATURE: {feature.feature_name}
    AREA: {area.area_name}
    PROJECT FOLDER: {project_folder}

    TEMPLATE VARIABLES TO EXTRACT:

    From FEATURE_TEMPLATE.md, populate these variables by analyzing the codebase:

    1. **{feature_name}**: {feature.feature_name} (already known)
    2. **{original_description}**: Brief description of what this feature does
    3. **{feature_type}**: "Enhancement" | "New Feature" | "Infrastructure" (infer from nature)
    4. **{description}**: Detailed description of feature purpose
    5. **{primary_area}**: {area.area_name} (already known)
    6. **{target_users}**: Who uses this feature (from docs/comments)
    7. **{user_value}**: What value does this provide to users
    8. **{user_benefit}**: Specific benefits users gain
    9. **{business_objective}**: Business goal this feature supports
    10. **{success_criteria}**: How success is measured (from tests/docs)
    11. **{secondary_areas}**: Other areas impacted (from code dependencies)
    12. **{cross_area_impact}**: Description of cross-area effects
    13. **{affected_areas}**: List of areas with impact descriptions
    14. **{feature_use_cases}**: List of use cases (from {feature.use_cases})
    15. **{new_interfaces}**: New interfaces/APIs introduced
    16. **{external_dependencies}**: External systems/libraries used
    17. **{implementation_order}**: Suggested implementation sequence
    18. **{area_interactions}**: How areas interact for this feature
    19. **{data_sharing_needs}**: Data shared between components
    20. **{interface_contracts}**: API contracts defined
    21. **{dependency_strategy}**: How dependencies are managed
    22. **{development_approach}**: Development methodology used/recommended
    23. **{testing_requirements}**: Testing strategy needed
    24. **{architecture_validation}**: Architecture compliance notes
    25. **{implementation_phases}**: Phased rollout plan
    26. **{technical_prerequisites}**: Technical dependencies needed first
    27. **{area_prerequisites}**: Area dependencies required
    28. **{external_prerequisites}**: External dependencies needed

    ANALYSIS APPROACH:

    1. **Find feature code**: Search for classes, services, controllers related to {feature.feature_name}
    2. **Extract documentation**: Read docstrings, comments, README sections
    3. **Analyze dependencies**: Check imports, references, API calls
    4. **Infer purpose**: From method names, operations, data flows
    5. **Map relationships**: Identify cross-area dependencies and data flows

    Use Glob, Grep, and Read tools to analyze codebase.

    OUTPUT FORMAT (JSON):

    Return ONLY valid JSON with all template variables:

    ```json
    {
      "feature_name": "...",
      "original_description": "...",
      "feature_type": "...",
      "description": "...",
      "primary_area": "...",
      "target_users": "...",
      ...
    }
    ```

    For variables that cannot be determined from code, use:
    - "N/A - Not documented in codebase" for missing information
    - "To be determined" for items requiring further analysis
    ```
  - Parse agent JSON response
  - Load FEATURE_TEMPLATE.md using Read tool
  - Apply DSL template substitution with extracted variables
  - Ensure output directory exists: Use Bash "mkdir -p 'Documents/Areas/{area_name}/Features/{feature_name}'"
  - Write feature specification to: "Documents/Areas/{area_name}/Features/{feature_name}/{feature_name}.md"
  - Report: "Created: Documents/Areas/{area_name}/Features/{feature_name}/{feature_name}.md"

### Phase 4A2: Use Case Specification Generation

- **For each use case in feature**:
  - Use Task tool with solution-engineer agent with EXACT prompt:
    ```markdown
    ROLE: Use Case Specification Extraction Analyst

    TASK: Extract detailed use case specification from codebase implementation

    USE CASE: {use_case.use_case_name}
    FEATURE: {feature.feature_name}
    AREA: {area.area_name}
    PROJECT FOLDER: {project_folder}

    TEMPLATE VARIABLES TO EXTRACT:

    From USE_CASE_TEMPLATE.md, populate these variables by analyzing the codebase:

    1. **{use_case_name}**: {use_case.use_case_name} (already known)
    2. **{original_description}**: {use_case.use_case_description} (already known)
    3. **{use_case_type}**: "Core Operation" | "Query" | "Management" | "Reporting" (infer)
    4. **{description}**: Detailed description of operation
    5. **{owning_area}**: {area.area_name} (already known)
    6. **{target_users}**: Who performs this operation
    7. **{user_operation}**: What user accomplishes
    8. **{parent_feature}**: {feature.feature_name} (already known)
    9. **{business_value}**: Business value this operation provides
    10. **{user_benefit}**: Specific benefit to user
    11. **{primary_actor}**: Who initiates this operation
    12. **{use_case_scope}**: Scope of operation (single entity, batch, etc.)
    13. **{abstraction_level}**: "User goal" | "Subfunction" | "Summary"
    14. **{application_service_name}**: Application service handling this
    15. **{domain_entities_involved}**: Domain entities used
    16. **{domain_services_used}**: Domain services invoked
    17. **{infrastructure_needs}**: Infrastructure requirements
    18. **{primary_port_method}**: Primary port operation name
    19. **{secondary_port_requirements}**: Secondary ports needed
    20. **{adapter_specifications}**: Adapter requirements
    21. **{domain_terminology}**: Domain terms used
    22. **{business_rules_enforced}**: Business rules applied
    23. **{domain_events_published}**: Domain events raised
    24. **{input_specification}**: Input data structure
    25. **{input_validation_rules}**: Input validation logic
    26. **{preconditions_required}**: Preconditions needed
    27. **{business_rules_applied}**: Business rules in processing
    28. **{processing_workflow}**: Step-by-step processing
    29. **{domain_entity_interactions}**: Entity interactions
    30. **{business_validation_rules}**: Business validation logic
    31. **{output_specification}**: Output data structure
    32. **{output_format_requirements}**: Output format details
    33. **{postconditions_guaranteed}**: Postconditions ensured
    34. **{error_scenarios}**: Error conditions and handling
    35. **{interface_definition}**: Interface contract
    36. **{data_access_requirements}**: Data access patterns
    37. **{external_system_interactions}**: External system calls
    38. **{performance_expectations}**: Performance requirements
    39. **{layer_responsibility_mapping}**: Layer responsibilities
    40. **{dependency_flow_requirements}**: Dependency directions
    41. **{abstraction_requirements}**: Abstraction needs
    42. **{simplicity_justification}**: KISS principle compliance
    43. **{unit_test_requirements}**: Unit testing needs
    44. **{integration_test_scenarios}**: Integration test cases
    45. **{acceptance_test_conditions}**: Acceptance criteria
    46. **{bdd_test_outline}**: BDD scenario outline
    47. **{acceptance_criteria}**: List of acceptance criteria with Given/When/Then
    48. **{implementation_pattern}**: Implementation pattern used
    49. **{code_structure_guidance}**: Code organization guidance
    50. **{testing_implementation_strategy}**: Testing approach
    51. **{technical_dependencies}**: Technical dependencies
    52. **{area_coordination_needs}**: Area coordination requirements
    53. **{external_system_dependencies}**: External dependencies
    54. **{area_boundary_compliance}**: Area boundary respect notes
    55. **{interface_design_guidance}**: Interface design notes
    56. **{error_handling_strategy}**: Error handling approach

    ANALYSIS APPROACH:

    1. **Locate use case code**: Find method, function, handler for {use_case.use_case_name}
    2. **Analyze implementation**: Read code to understand logic, validation, processing
    3. **Extract business rules**: Identify constraints, validations, invariants
    4. **Map data flow**: Input → Processing → Output
    5. **Find error handling**: Exception handling, error responses
    6. **Check tests**: Unit tests, integration tests for acceptance criteria
    7. **Identify dependencies**: Services called, repositories used, external APIs

    Use Glob, Grep, and Read tools to analyze codebase.

    OUTPUT FORMAT (JSON):

    Return ONLY valid JSON with all template variables:

    ```json
    {
      "use_case_name": "...",
      "original_description": "...",
      "use_case_type": "...",
      "description": "...",
      "owning_area": "...",
      "target_users": "...",
      "acceptance_criteria": [
        {
          "id": "01",
          "description": "...",
          "precondition": "...",
          "action": "...",
          "expected_result": "..."
        }
      ],
      "error_scenarios": [
        {
          "condition": "...",
          "handling_strategy": "..."
        }
      ],
      ...
    }
    ```

    For variables that cannot be determined from code, use:
    - "N/A - Not documented in codebase"
    - "To be determined"
    ```
  - Parse agent JSON response
  - Load USE_CASE_TEMPLATE.md using Read tool
  - Apply DSL template substitution with extracted variables
  - Ensure output directory exists: Use Bash "mkdir -p 'Documents/Areas/{area_name}/Features/{feature_name}/UseCases'"
  - Write use case specification to: "Documents/Areas/{area_name}/Features/{feature_name}/UseCases/{use_case_name}.md"
  - Report: "Created: Documents/Areas/{area_name}/Features/{feature_name}/UseCases/{use_case_name}.md"

### Phase 4A3: Memory Graph Update

- **After feature and all its use cases are generated**:
  - Use mcp__memory__create_entities to create feature entity:
    ```json
    {
      "entities": [
        {
          "name": "{feature.feature_name}",
          "entityType": "feature",
          "observations": [
            "feature_type: {feature_type}",
            "primary_area: {area.area_name}",
            "description: {description}",
            "use_case_count: {use_case_count}",
            "specification_path: Documents/Areas/{area_name}/Features/{feature_name}/{feature_name}.md"
          ]
        }
      ]
    }
    ```
  - <foreach {use_case} in {feature.use_cases}>
    - Use mcp__memory__create_entities to create use case entity:
      ```json
      {
        "entities": [
          {
            "name": "{use_case.use_case_name}",
            "entityType": "use_case",
            "observations": [
              "use_case_type: {use_case_type}",
              "parent_feature: {feature.feature_name}",
              "owning_area: {area.area_name}",
              "description: {use_case.use_case_description}",
              "specification_path: Documents/Areas/{area_name}/Features/{feature_name}/UseCases/{use_case_name}.md"
            ]
          }
        ]
      }
      ```
    - Use mcp__memory__create_relations to link use case to feature:
      ```json
      {
        "relations": [
          {
            "from": "{feature.feature_name}",
            "to": "{use_case.use_case_name}",
            "relationType": "contains_use_case"
          }
        ]
      }
      ```
  </foreach>

</if>

## Phase 4B: Structure Validation & Auto-Correction

- **STEP 4B1**: Generate file manifest from discovery structure
  - For each area, feature, and use case in {discovery_structure}:
    - Expected feature path: `Documents/Areas/{area}/Features/{feature}/{feature}.md`
    - Expected use case path: `Documents/Areas/{area}/Features/{feature}/UseCases/{use_case}.md`
  - Store manifest with expected paths: {file_manifest}

- **STEP 4B2**: Validate all files exist at expected locations
  ```
  Validating file structure...
  ```
  - For each entry in {file_manifest}:
    - Check if file exists at expected path
    - If exists: Mark as ✓ VERIFIED
    - If missing: Mark as ⚠️ MISSING and search for file

- **STEP 4B3**: Search for misplaced files
  - For each MISSING file:
    - Search entire Documents/Areas/ tree for filename
    - If found elsewhere: Mark as 🔄 MISPLACED
    - If not found anywhere: Mark as ❌ NOT_CREATED

- **STEP 4B4**: Detect structural violations
  - Find flat structure violations: `Documents/Areas/{area}/UseCases/*.md` (should be nested under Features)
  - Find files outside Features folders
  - Find orphaned UseCases folders not under a feature

- **STEP 4B5**: Auto-correct misplaced files
  ```
  Auto-correcting misplaced files...
  ```
  - For each MISPLACED file:
    - Read file content to extract "Parent Feature" and "Owning Area"
    - Calculate correct path from metadata
    - Create correct directory structure if needed
    - Move file to correct location
    - Report: `Moved: {old_path} → {new_path}`

- **STEP 4B6**: Report validation results
  ```
  ═══════════════════════════════════════════════════════════
  STRUCTURE VALIDATION RESULTS
  ═══════════════════════════════════════════════════════════

  Total Expected Files: {expected_count}
  ✓ Correctly Placed: {correct_count}
  🔄 Auto-Corrected: {corrected_count}
  ❌ Missing: {missing_count}

  <if ({corrected_count} > 0)>
  Auto-Corrections Applied:
  <foreach {correction} in {corrections}>
  - {correction.filename}
    FROM: {correction.old_path}
    TO:   {correction.new_path}
    REASON: {correction.reason}
  </foreach>
  </if>

  <if ({missing_count} > 0)>
  ⚠️  WARNING: Missing Files Detected:
  <foreach {missing} in {missing_files}>
  - {missing.path} (Expected but not created)
  </foreach>

  This may indicate generation failures. Check agent logs for errors.
  </if>

  <if ({missing_count} == 0 and {corrected_count} == 0)>
  ✓ ALL FILES VERIFIED - Perfect structure compliance!
  </if>

  ═══════════════════════════════════════════════════════════
  ```

- **STEP 4B7**: Update memory with validation results
  - Use mcp__memory__add_observations to record:
    - "validation_status: {complete|partial|failed}"
    - "files_expected: {expected_count}"
    - "files_verified: {correct_count}"
    - "files_corrected: {corrected_count}"
    - "files_missing: {missing_count}"

## Phase 5: Final Report & Summary

- **STEP 5A**: Calculate final statistics:
  - Count total files created (features + use cases)
  - Count memory entities created
  - Count memory relationships created
- **STEP 5B**: Display comprehensive completion report:
  ```
  ═══════════════════════════════════════════════════════════
  ✓ EXTRACTION COMPLETED SUCCESSFULLY
  ═══════════════════════════════════════════════════════════

  Scope: {filter_mode}
  <if ({filter_mode} equals "area")>
  Area Filter: {area_filter}
  </if>
  <if ({filter_mode} equals "feature")>
  Feature Filter: {feature_filter}
  </if>

  Files Generated:
  - Areas: {total_areas}
  - Features: {total_features} files
  - Use Cases: {total_use_cases} files
  - Total: {total_files} specification files

  Memory Graph Updated:
  - Entities created: {entity_count} ({total_features} features + {total_use_cases} use cases)
  - Relationships created: {relationship_count}

  Output Location:
  Documents/Areas/{area_names}/
    └── Features/
        └── {feature_name}/
            ├── {feature_name}.md
            └── UseCases/
                └── {use_case_name}.md

  ═══════════════════════════════════════════════════════════
  NEXT STEPS
  ═══════════════════════════════════════════════════════════

  1. Review generated specification files for accuracy
  2. Add manual refinements where "N/A" or "To be determined" appear
  3. Update SOLUTION.md if not already done:
     Run: /extract-solution
  4. Generate BDD feature files for testing:
     Run: /generate-bdd
  5. Validate project structure:
     Run: /validate-solution

  ═══════════════════════════════════════════════════════════
  ```
- **STEP 5C**: Update extraction session memory:
  - Use mcp__memory__add_observations to finalize extraction session:
    - "status: extraction_complete"
    - "files_created: {total_files}"
    - "entities_created: {entity_count}"
    - "completion_time: {current_timestamp}"

**IMPORTANT NOTES**:
- This command performs reverse engineering of existing code into specifications
- Extracted information is based on code analysis, not design intent
- "N/A" entries indicate information not found in codebase - this is expected
- Manual review and refinement recommended after extraction
- Batch processing ensures large codebases can be processed efficiently
- TodoWrite provides real-time progress visibility
- Memory graph enables future commands to query project structure