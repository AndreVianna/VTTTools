# TokenManager v2.0 CLI - E2E Manual Test Scenarios

**Project**: VTTTools.TokenManager v2.0
**Phase**: Phase 6 - Manual Testing & Documentation
**Purpose**: Comprehensive end-to-end validation with progressive complexity
**Date Started**: 2025-11-17
**Test Count**: 35 scenarios
**Estimated Duration**: 5-7 hours total

## ⚠️ ARCHITECTURE CHANGE - Two-Phase Workflow

**IMPORTANT**: The TokenManager now uses a two-phase workflow:

1. **Phase 1 - Prepare** (`token prepare`):
   - Validates entity definitions
   - Shows variant preview
   - Asks user confirmation
   - Creates folder structure
   - Enhances prompts via OpenAI
   - Saves prompts as `.prompt` files (e.g., `token_1.prompt`)

2. **Phase 2 - Generate** (`token generate`):
   - Reads `.prompt` files (REQUIRED)
   - Generates images using pre-enhanced prompts
   - No OpenAI calls during generation
   - Fails if `.prompt` files are missing
   - Uses semantic file names: `top-down.png`, `miniature.png`, `photo.png`, `portrait.png`

**User Benefits**:
- Review and edit prompts before image generation
- Separate prompt costs from image generation costs
- Full control over final prompts

---

## Progress Summary

**Completed**: 0/35 scenarios (0%)
**Status**: ⚠️ SCENARIOS INVALIDATED - Architecture changed, retesting required
**Current Phase**: Phase 1 - Environment & Setup
**Next Test**: Scenario 1 - Doctor Command - Full Diagnostics

### Previously Completed (NOW INVALID):
- ⚠️ ~~Scenario 1: Doctor Command - Full Diagnostics~~ (Still valid, retest recommended)
- ⚠️ ~~Scenario 2: Doctor Command - API Keys Configured~~ (Still valid, retest recommended)
- ⚠️ ~~Scenario 3: Doctor Command - Offline Mode~~ (Still valid, retest recommended)
- ❌ ~~Scenario 4: Prepare Command - Simple Validation~~ (INVALID - workflow changed)
- ❌ ~~Scenario 5: Prepare Command - Cartesian Product Preview~~ (INVALID - workflow changed)
- ❌ ~~Scenario 6: Prepare Command - Large Variant Set Warning~~ (INVALID - workflow changed)

**Recommendation**: Retest all scenarios starting from Scenario 1.

---

## Test Execution Strategy

**Reorganized by Feature Workflow** (Doctor → Prepare → Generate → List/Show):

### Session 1: Environment & Setup (30-45 minutes)
- **Phase 1**: Doctor Command (Scenarios 1-3)
- Validate configuration, API keys, filesystem
- Fix any critical issues before proceeding

### Session 2: Prepare Command - Validation & Prompt Generation (1.5-2 hours)
- **Phase 2**: Prepare Workflow Testing (Scenarios 4-10)
- Test entity validation, variant expansion, prompt enhancement
- Verify `.prompt` file creation and overwrite handling

### Session 3: Generate Command - Token Generation (2-3 hours)
- **Phase 3**: Token Generation Workflows (Scenarios 11-22)
- Single entities, variants, cartesian products
- Batch processing, filtering, limits
- Reading `.prompt` files and image generation

### Session 4: List/Show Commands & Advanced (1.5-2 hours)
- **Phase 4**: Query Commands (Scenarios 23-25)
- **Phase 5**: Error Cases & Edge Scenarios (Scenarios 26-35)

---

## Phase 1: Doctor Command & Environment Validation

### Scenario 1: Doctor Command - Full Diagnostics (First Test)
**Complexity**: Simple
**Category**: Environment Validation
**Duration**: 5-10 minutes
**Status**: ⚠️ RETEST REQUIRED

**Objective**: Verify complete system setup before attempting any generation

**Prerequisites**:
- TokenManager CLI built and executable
- `appsettings.json` configured (may have placeholders initially)

**Steps**:
1. Run `token doctor`
   - Expected: Shows all health checks (Configuration, Filesystem, API Connectivity)
   - Expected: Summary with counts (X/Y checks passed)

**Expected Outcomes** (Initial Run, May Have Failures):
```
TokenManager v2.0 - System Diagnostics
=====================================

Configuration Checks
  ✗ OpenAI API key not configured
    → Add "OpenAI:ApiKey" to appsettings.json
  ✗ Stability API key not configured
    → Add "Stability:ApiKey" to appsettings.json
  ...

Summary: X/10 checks passed (N critical, M warnings)
Status: ACTION REQUIRED - Fix critical issues
```

**Validation**:
- [ ] Command runs without crashes
- [ ] All health check categories displayed
- [ ] Failed checks show remediation suggestions
- [ ] Exit code is 1 (critical failures present)

**Action**: Fix all critical failures before proceeding to Scenario 2

---

### Scenario 2: Doctor Command - API Keys Configured
**Complexity**: Simple
**Category**: Environment Validation
**Duration**: 3-5 minutes
**Status**: ⚠️ RETEST REQUIRED

**Objective**: Verify configuration after adding API keys

**Prerequisites**:
- `appsettings.json` updated with valid API keys:
```json
{
  "OpenAI": {
    "ApiKey": "sk-proj-...",
    "BaseUri": "https://api.openai.com/v1",
    "Model": "gpt-4o-mini"
  },
  "Stability": {
    "ApiKey": "sk-...",
    "BaseUri": "https://api.stability.ai",
    "Token": {
      "Model": "SD35",
      "OutputFormat": "png"
    },
    "Portrait": {
      "Model": "CORE",
      "OutputFormat": "png"
    }
  }
}
```

**Steps**:
1. Run `token doctor`
   - Expected: Configuration checks now pass
   - Expected: API connectivity checks execute

**Expected Outcomes**:
```
Configuration Checks
  ✓ appsettings.json found
  ✓ OpenAI API key configured
  ✓ Stability API key configured
  ✓ OpenAI model: gpt-4o-mini
  ✓ Stability token model: SD35
  ✓ Stability portrait model: CORE

API Connectivity Checks
  ✓ OpenAI API accessible (342ms)
  ✓ Stability API accessible (487ms)

Summary: 10/10 checks passed
Status: READY
```

**Validation**:
- [ ] All configuration checks pass
- [ ] API connectivity checks succeed (200 OK responses)
- [ ] Response times are reasonable (<5 seconds each)
- [ ] Exit code is 0 (success)

---

### Scenario 3: Doctor Command - Offline Mode
**Complexity**: Simple
**Category**: Environment Validation
**Duration**: 2-3 minutes
**Status**: ⚠️ RETEST REQUIRED

**Objective**: Verify --skip-api flag for offline validation

**Steps**:
1. Run `token doctor --skip-api`
   - Expected: Skips OpenAI and Stability API checks
   - Expected: Only validates configuration and filesystem

**Expected Outcomes**:
```
Configuration Checks
  ✓ appsettings.json found
  ✓ OpenAI API key configured
  ...

API Connectivity Checks
  - OpenAI API check skipped (--skip-api flag)
  - Stability API check skipped (--skip-api flag)

Summary: 8/8 checks passed (2 skipped)
Status: READY (API checks skipped)
```

**Validation**:
- [ ] API checks show "skipped" status
- [ ] Configuration and filesystem checks still run
- [ ] Exit code is 0
- [ ] Execution time is faster (<2 seconds)

---

## Phase 2: Prepare Command - Validation & Prompt Generation

### Scenario 4: Prepare Command - Simple Validation (No Confirmation)
**Complexity**: Simple
**Category**: Prepare Workflow
**Duration**: 3-5 minutes
**Status**: ❌ INVALID - Needs retesting with new workflow

**Objective**: Validate entity definitions, preview variants, user cancellation

**Prerequisites**:
- Create `test-data/simple-goblin.json`:
```json
[
  {
    "Name": "Goblin Scout",
    "Genre": "Fantasy",
    "Category": "creatures",
    "Type": "monsters",
    "Subtype": "humanoids",
    "Size": "small",
    "PhysicalDescription": "green-skinned humanoid with pointed ears and yellow eyes",
    "DistinctiveFeatures": "ragged leather armor and rusty dagger",
    "Environment": "dark caves",
    "Alternatives": [],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json`
   - Expected: Shows "Found 1 entities"
   - Expected: Shows "Total variants: 1"
   - Expected: Shows variant preview (base)
   - Expected: Prompts "Can I proceed? (Y/n)"
2. Type `n` and press Enter
   - Expected: "Preparation cancelled by user."
   - Expected: Exit code 0
   - Expected: No `.prompt` files created

**Expected Outcomes**:
```
Found 1 entities

✓ Goblin Scout
  Type: monsters
  Category: creatures
  Variants: 1
  All variants:
    - base

=============================================================
Total entities: 1
Total variants: 1

✓ All entities valid and ready for generation.

Can I proceed? (Y/n): n
Preparation cancelled by user.
```

**Validation**:
- [ ] Entity loaded successfully
- [ ] Variant count correct (1)
- [ ] Variant preview shows "base"
- [ ] No errors or warnings
- [ ] Confirmation prompt appears
- [ ] User can cancel with 'n'
- [ ] Exit code 0
- [ ] No `.prompt` files created

---

### Scenario 5: Prepare Command - Prompt File Generation
**Complexity**: Intermediate
**Category**: Prepare Workflow
**Duration**: 5-10 minutes
**Status**: ❌ INVALID - New scenario required

**Objective**: Verify OpenAI prompt enhancement and `.prompt` file creation

**Prerequisites**:
- Valid OpenAI API key in appsettings.json
- `simple-goblin.json` from Scenario 4

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json`
   - Expected: Shows variant preview
   - Expected: Prompts "Can I proceed? (Y/n)"
2. Type `y` and press Enter
   - Expected: Shows "Generating prompt files..."
   - Expected: Shows progress: "Enhancing prompts for Goblin Scout / base... ✓ (4/4)"
   - Expected: Shows "✓ Preparation complete. 4/4 prompts generated."

**Expected Outcomes**:
```
Can I proceed? (Y/n): y

Generating prompt files...

Enhancing prompts for Goblin Scout / base... ✓ (4/4)

✓ Preparation complete. 4/4 prompts generated.
```

**Files Created**:
- `images/fantasy/creatures/monsters/humanoids/g/goblin_scout/base/top-down.prompt` (top-down view)
- `images/fantasy/creatures/monsters/humanoids/g/goblin_scout/base/miniature.prompt` (full-body isometric)
- `images/fantasy/creatures/monsters/humanoids/g/goblin_scout/base/photo.prompt` (3/4 view)
- `images/fantasy/creatures/monsters/humanoids/g/goblin_scout/base/portrait.prompt`

**Validation**:
- [ ] OpenAI API called successfully for all 4 prompts (3 tokens + 1 portrait)
- [ ] All 4 `.prompt` files created at correct path
- [ ] `top-down.prompt` contains top-down keywords (bird's-eye view, transparent background)
- [ ] `miniature.prompt` contains isometric keywords (full body, standing pose)
- [ ] `photo.prompt` contains 3/4 view keywords (dynamic pose, character focus)
- [ ] `portrait.prompt` contains portrait keywords (upper body, face focus)
- [ ] Folder structure created: 8-level hierarchy (genre → category → type → subtype → letter → entity → variant)
- [ ] Exit code 0
- [ ] Response time reasonable (<20 seconds for 4 prompts)

**File Inspection**:
1. Open `top-down.prompt` in text editor
   - Expected: Contains enhanced prompt with D&D context
   - Expected: Includes Stable Diffusion formatting keywords
   - Expected: More detailed than simple entity description

---

### Scenario 6: Prepare Command - Cartesian Product Expansion
**Complexity**: Intermediate
**Category**: Prepare Workflow
**Duration**: 10-15 minutes
**Status**: ❌ INVALID - Workflow changed

**Objective**: Preview and generate prompts for cartesian product variants

**Prerequisites**:
- Create `test-data/goblin-variants.json`:
```json
[
  {
    "Name": "Goblin Warrior",
    "Genre": "Fantasy",
    "Category": "creatures",
    "Type": "monsters",
    "Subtype": "humanoids",
    "Size": "small",
    "PhysicalDescription": "fierce goblin combatant",
    "DistinctiveFeatures": "battle scars and aggressive posture",
    "Environment": "tribal camps",
    "Alternatives": [
      {
        "Gender": ["male", "female"],
        "Class": ["warrior", "berserker"],
        "Equipment": ["scimitar and shield", "axe"]
      }
    ],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\goblin-variants.json`
   - Expected: Shows "Total variants: 8" (2×2×2)
   - Expected: Shows first 10 variant combinations (or all 8)
   - Expected: Prompts "Can I proceed? (Y/n)"
2. Type `y` and press Enter
   - Expected: Generates 8 `.prompt` files (one per variant)

**Expected Outcomes**:
```
Found 1 entities

✓ Goblin Warrior
  Type: monsters
  Category: creatures
  Variants: 8
  All variants:
    - male-warrior-scimitar+shield
    - male-warrior-axe
    - male-berserker-scimitar+shield
    - male-berserker-axe
    - female-warrior-scimitar+shield
    - female-warrior-axe
    - female-berserker-scimitar+shield
    - female-berserker-axe

=============================================================
Total entities: 1
Total variants: 8

✓ All entities valid and ready for generation.

Can I proceed? (Y/n): y

Generating prompt files...

Enhancing prompt for Goblin Warrior / male-warrior-scimitar+shield... ✓
Enhancing prompt for Goblin Warrior / male-warrior-axe... ✓
...
Enhancing prompt for Goblin Warrior / female-berserker-axe... ✓

✓ Preparation complete. 8/8 prompts generated.
```

**Files Created** (32 `.prompt` files - 4 images per variant):
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-warrior-scimitar+shield/top-down.prompt`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-warrior-scimitar+shield/miniature.prompt`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-warrior-scimitar+shield/photo.prompt`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-warrior-scimitar+shield/portrait.prompt`
- (... and 7 more variants with 4 files each)

**Validation**:
- [ ] Variant count correct (8 = 2×2×2)
- [ ] Preview shows all 8 variants
- [ ] Variant IDs use "+" for " and " (e.g., "scimitar+shield")
- [ ] All 32 `.prompt` files created (4 per variant: TopDown, Miniature, Photo, Portrait)
- [ ] Each variant has unique folder
- [ ] OpenAI called 32 times (4 images per variant)

---

### Scenario 7: Prepare Command - Large Variant Set Warning
**Complexity**: Intermediate
**Category**: Prepare Workflow
**Duration**: 5-7 minutes
**Status**: ❌ INVALID - Workflow changed

**Objective**: Verify >50 variant warning in prepare command

**Prerequisites**:
- Create `test-data/large-variants.json`:
```json
[
  {
    "Name": "Customizable Hero",
    "Genre": "Fantasy",
    "Category": "characters",
    "Type": "player_characters",
    "Subtype": "heroes",
    "Size": "medium",
    "PhysicalDescription": "customizable adventurer",
    "DistinctiveFeatures": "varies by configuration",
    "Environment": "any",
    "Alternatives": [
      {
        "Gender": ["male", "female", "nonbinary"],
        "Class": ["fighter", "wizard", "rogue", "cleric"],
        "Equipment": ["sword", "staff", "bow", "mace", "dagger"]
      }
    ],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\large-variants.json`
   - Expected: Shows "Total variants: 60" (3×4×5)
   - Expected: Shows warning about >50 variants
   - Expected: Prompts "Can I proceed? (Y/n)"
2. Type `n` to cancel

**Expected Outcomes**:
```
Found 1 entities

✓ Customizable Hero
  Type: player_characters
  Category: characters
  Variants: 60
  Sample variants:
    - male-fighter-sword
    - male-fighter-staff
    - male-fighter-bow
    ...
    ... and 50 more
    (use --show-all to see all variants)

=============================================================
Total entities: 1
Total variants: 60

⚠ Warning: Generating 60 variants will create many API calls.
  Consider using --limit parameter when preparing.

✓ All entities valid and ready for generation.

Can I proceed? (Y/n): n
Preparation cancelled by user.
```

**Validation**:
- [ ] Variant count correct (60)
- [ ] Warning displayed for >50 variants
- [ ] Preview shows sample variants
- [ ] Exit code 0 (warning, not error)
- [ ] User can cancel

---

### Scenario 8: Prepare Command - Limit Parameter
**Complexity**: Intermediate
**Category**: Prepare Workflow
**Duration**: 5-10 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Test --limit parameter to prepare only first N variants

**Prerequisites**:
- `large-variants.json` from Scenario 7 (60 variants)

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\large-variants.json --limit 5`
   - Expected: Shows "Total variants: 60"
   - Expected: Shows "Will prepare: 5 (limited by --limit parameter)"
   - Expected: Prompts "Can I proceed? (Y/n)"
2. Type `y` and press Enter
   - Expected: Generates only 5 `.prompt` files

**Expected Outcomes**:
```
Found 1 entities

✓ Customizable Hero
  Type: player_characters
  Category: characters
  Variants: 60
  Will prepare: 5 (limited by --limit parameter)
  ...

Can I proceed? (Y/n): y

Generating prompt files...

Enhancing prompt for Customizable Hero / male-fighter-sword... ✓
Enhancing prompt for Customizable Hero / male-fighter-staff... ✓
Enhancing prompt for Customizable Hero / male-fighter-bow... ✓
Enhancing prompt for Customizable Hero / male-fighter-mace... ✓
Enhancing prompt for Customizable Hero / male-fighter-dagger... ✓

✓ Preparation complete. 5/5 prompts generated.
```

**Validation**:
- [ ] Only 5 `.prompt` files created
- [ ] Limit respected (5/60 variants)
- [ ] OpenAI called only 5 times
- [ ] No warning about >50 variants (since only 5 prepared)

---

### Scenario 9: Prepare Command - Overwrite Handling (Yes)
**Complexity**: Intermediate
**Category**: Prepare Workflow
**Duration**: 5-10 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Verify overwrite prompt when `.prompt` file already exists

**Prerequisites**:
- `simple-goblin.json` from Scenario 4
- Scenario 5 completed (top-down.prompt already exists)

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json`
   - Expected: Prompts "Can I proceed? (Y/n)"
2. Type `y` and press Enter
   - Expected: Detects existing `top-down.prompt`
   - Expected: Prompts "File exists: ...top-down.prompt\nOverwrite? (Yes/No/All/Cancel)"
3. Type `yes` and press Enter
   - Expected: Overwrites existing file
   - Expected: Shows "✓ Preparation complete. 4/4 prompts generated."

**Expected Outcomes**:
```
Can I proceed? (Y/n): y

Generating prompt files...

File exists: C:\...\images\fantasy\creatures\monsters\humanoids\g\goblin_scout\base\top-down.prompt
Overwrite? (Yes/No/All/Cancel): yes
Enhancing prompt for Goblin Scout / base (TopDown)... ✓
Enhancing prompt for Goblin Scout / base (Miniature)... ✓
Enhancing prompt for Goblin Scout / base (Photo)... ✓
Enhancing prompt for Goblin Scout / base (Portrait)... ✓

✓ Preparation complete. 4/4 prompts generated.
```

**Validation**:
- [ ] Overwrite prompt appears
- [ ] "Yes" overwrites single file
- [ ] Timestamp updated on `.prompt` file
- [ ] Exit code 0

---

### Scenario 10: Prepare Command - Overwrite Handling (All/Cancel)
**Complexity**: Intermediate
**Category**: Prepare Workflow
**Duration**: 10-15 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Test "All" and "Cancel" options for overwrite prompt

**Prerequisites**:
- `goblin-variants.json` from Scenario 6 (8 variants)
- Scenario 6 completed (32 `.prompt` files already exist - 4 per variant)

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\goblin-variants.json`
2. Type `y` at "Can I proceed?"
3. When first overwrite prompt appears, type `all` and press Enter
   - Expected: Overwrites all 32 files without further prompts
4. Run same command again
5. Type `y` at "Can I proceed?"
6. When first overwrite prompt appears, type `cancel` and press Enter
   - Expected: "Preparation cancelled by user."
   - Expected: Shows "Processed 0/32 prompts."
   - Expected: Exit code 0

**Expected Outcomes** (All):
```
Can I proceed? (Y/n): y

Generating prompt files...

File exists: ...male-warrior-scimitar+shield/top-down.prompt
Overwrite? (Yes/No/All/Cancel): all
Enhancing prompts for Goblin Warrior / male-warrior-scimitar+shield... ✓ (4/4)
Enhancing prompts for Goblin Warrior / male-warrior-axe... ✓ (4/4)
...
Enhancing prompts for Goblin Warrior / female-berserker-axe... ✓ (4/4)

✓ Preparation complete. 32/32 prompts generated.
```

**Expected Outcomes** (Cancel):
```
File exists: ...male-warrior-scimitar+shield/top-down.prompt
Overwrite? (Yes/No/All/Cancel): cancel
Preparation cancelled by user.
Processed 0/32 prompts.
```

**Validation**:
- [ ] "All" overwrites all files without prompting again
- [ ] "Cancel" stops immediately
- [ ] "Cancel" doesn't modify any files
- [ ] Exit code 0 for both cases

---

## Phase 3: Generate Command - Token Generation (1:1 Aspect Ratio)

### Scenario 11: Generate Command - Single Entity (Happy Path)
**Complexity**: Simple
**Category**: Token Generation
**Duration**: 5-10 minutes
**Status**: ❌ INVALID - Workflow changed, requires `.prompt` files first

**Objective**: Generate token image from `.prompt` file

**Prerequisites**:
- Scenario 5 completed (`top-down.prompt` exists for Goblin Scout)

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\simple-goblin.json --variants 1`
   - Expected: Reads `top-down.prompt` file
   - Expected: Generates image using prompt from file
   - Expected: No OpenAI API call (prompt already enhanced)

**Expected Outcomes**:
```
[1/1] Goblin Scout
  [1/1] Variant: base
    TopDown... OK

Generation complete. 1/1 images generated.
```

**Files Created**:
- `images/fantasy/creatures/monsters/humanoids/g/goblin_scout/base/top-down.png`

**Validation**:
- [ ] PNG file exists at correct path
- [ ] File size 20-60 KB (reasonable for ~512x512)
- [ ] Image opens correctly (not corrupted)
- [ ] Image is square (1:1 aspect ratio)
- [ ] Visual inspection: shows goblin-like creature
- [ ] No OpenAI API calls (only Stability AI)
- [ ] Exit code 0

---

### Scenario 12: Generate Command - Missing Prompt File Error
**Complexity**: Simple
**Category**: Error Handling
**Duration**: 3-5 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Verify error handling when `.prompt` file is missing

**Prerequisites**:
- Create new test file `test-data/orc.json`:
```json
[
  {
    "Name": "Orc Grunt",
    "Genre": "Fantasy",
    "Category": "creatures",
    "Type": "monsters",
    "Subtype": "humanoids",
    "Size": "medium",
    "PhysicalDescription": "muscular orc warrior",
    "DistinctiveFeatures": "tusks and tribal tattoos",
    "Environment": "mountains",
    "Alternatives": [],
    "SchemaVersion": 1
  }
]
```
- **Important**: Do NOT run `token prepare` for this file

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\orc.json --variants 1`
   - Expected: Error message about missing `.prompt` file
   - Expected: Suggests running `token prepare` first

**Expected Outcomes**:
```
[1/1] Orc Grunt
  [1/1] Variant: base
    TopDown... Error: Prompt file not found: C:\...\orc_grunt\base\top-down.prompt
  Run 'token prepare' first to generate prompt files.

Generation complete. 0/1 images generated.
```

**Validation**:
- [ ] Clear error message
- [ ] Suggests running `token prepare`
- [ ] No image files created
- [ ] Exit code indicates no images generated
- [ ] No Stability AI calls made

---

### Scenario 13: Generate Command - Multiple Poses
**Complexity**: Simple
**Category**: Token Generation
**Duration**: 10-15 minutes
**Status**: ❌ INVALID - Workflow changed

**Objective**: Generate multiple image types for same entity

**Prerequisites**:
- Scenario 11 completed (top-down.png exists)

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\simple-goblin.json --variants 4`
   - Expected: Continues with remaining images (Miniature, Photo, Portrait)
   - Expected: All 4 images generated if `.prompt` files exist
   - Expected: Errors only if `.prompt` files missing

**Note**: This scenario demonstrates that each image type needs its own `.prompt` file. The `prepare` command generates all 4 prompt files automatically.

**Expected Outcomes**:
```
[1/1] Goblin Scout
  [1/1] Variant: base
    TopDown... OK (or skipped if exists)
    Miniature... OK
    Photo... OK
    Portrait... OK

Generation complete. 4/4 images generated.
```

**Validation**:
- [ ] Each image type requires its own `.prompt` file
- [ ] Missing prompt files cause errors
- [ ] All 4 semantic image types generated (TopDown, Miniature, Photo, Portrait)
- [ ] Clear progress messages

**Note**: Prepare command generates all 4 image prompts automatically (top-down.prompt, miniature.prompt, photo.prompt, portrait.prompt).

---

### Scenario 14: Generate Command - Cartesian Product
**Complexity**: Intermediate
**Category**: Token Generation
**Duration**: 15-20 minutes
**Status**: ❌ INVALID - Workflow changed

**Objective**: Generate images for all cartesian product variants

**Prerequisites**:
- Scenario 6 completed (8 `.prompt` files exist for Goblin Warrior)

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\goblin-variants.json --variants 1`
   - Expected: Reads 8 `.prompt` files
   - Expected: Generates 8 token images
   - Expected: No OpenAI API calls

**Expected Outcomes**:
```
[1/1] Goblin Warrior
  [1/8] Variant: male-warrior-scimitar+shield
    TopDown... OK
  [2/8] Variant: male-warrior-axe
    TopDown... OK
  ...
  [8/8] Variant: female-berserker-axe
    TopDown... OK

Generation complete. 8/8 images generated.
```

**Files Created** (8 PNG files for --variants 1):
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-warrior-scimitar+shield/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-warrior-axe/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-berserker-scimitar+shield/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/male-berserker-axe/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/female-warrior-scimitar+shield/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/female-warrior-axe/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/female-berserker-scimitar+shield/top-down.png`
- `images/fantasy/creatures/monsters/humanoids/g/goblin_warrior/female-berserker-axe/top-down.png`

**Note**: With --variants 4, this would generate 32 total images (4 per variant: TopDown, Miniature, Photo, Portrait)

**Validation**:
- [ ] All 8 images generated (or 32 if --variants 4)
- [ ] Each image in correct variant folder
- [ ] Images visually match variants (male/female, warrior/berserker, different equipment)
- [ ] Only Stability AI calls (no OpenAI)
- [ ] Folder names use "+" for " and " separator

---

### Scenario 15: Generate Command - Batch Generation with Delay
**Complexity**: Intermediate
**Category**: Token Generation
**Duration**: 10-15 minutes
**Status**: ❌ INVALID - Needs preparation step first

**Objective**: Generate multiple entities with rate limiting

**Prerequisites**:
- Create `test-data/batch-monsters.json`:
```json
[
  {
    "Name": "Orc Grunt",
    "Genre": "Fantasy",
    "Category": "creatures",
    "Type": "monsters",
    "Subtype": "humanoids",
    "Size": "medium",
    "PhysicalDescription": "muscular orc warrior",
    "DistinctiveFeatures": "tusks and tribal tattoos",
    "Environment": "mountains",
    "Alternatives": [],
    "SchemaVersion": 1
  },
  {
    "Name": "Skeleton Archer",
    "Genre": "Fantasy",
    "Category": "creatures",
    "Type": "undead",
    "Subtype": "skeletons",
    "Size": "medium",
    "PhysicalDescription": "skeletal warrior with bow",
    "DistinctiveFeatures": "glowing eyes",
    "Environment": "crypts",
    "Alternatives": [],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\batch-monsters.json` and confirm
   - Expected: Creates 8 `.prompt` files (4 per entity: TopDown, Miniature, Photo, Portrait)
2. Run `token generate --import C:\absolute\path\to\test-data\batch-monsters.json --delay 2000 --variants 1`
   - Expected: 2-second delay between Stability API calls
   - Expected: Generates 2 images total (TopDown only)

**Expected Outcomes**:
```
[1/2] Orc Grunt
  [1/1] Variant: base
    TopDown... OK

[2/2] Skeleton Archer
  [1/1] Variant: base
    TopDown... OK

Generation complete. 2/2 images generated.
```

**Validation**:
- [ ] 2 entities generated (TopDown images only)
- [ ] Observable delay between API calls (~2 seconds)
- [ ] No rate limit errors
- [ ] Both images created successfully

---

### Scenario 16: Generate Command - Limit Parameter
**Complexity**: Intermediate
**Category**: Token Generation
**Duration**: 5-10 minutes
**Status**: ❌ INVALID - Limit parameter removed from generate command

**Note**: The `--limit` parameter is now only used in `token prepare` to limit how many `.prompt` files are created. The `generate` command processes all `.prompt` files it finds.

**Objective**: Demonstrate that generate reads all available `.prompt` files

**Prerequisites**:
- Scenario 8 completed (5 `.prompt` files exist for Customizable Hero)

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\large-variants.json --variants 1`
   - Expected: Generates images for all 5 variants (limited by prepare)
   - Expected: No `--limit` parameter needed

**Expected Outcomes**:
```
[1/1] Customizable Hero
  [1/5] Variant: male-fighter-sword
    TopDown... OK
  [2/5] Variant: male-fighter-staff
    TopDown... OK
  [3/5] Variant: male-fighter-bow
    TopDown... OK
  [4/5] Variant: male-fighter-mace
    TopDown... OK
  [5/5] Variant: male-fighter-dagger
    TopDown... OK

Generation complete. 5/5 images generated.
```

**Validation**:
- [ ] Generates exactly 5 images (matching 5 `.prompt` files from prepare)
- [ ] No `--limit` parameter on generate command
- [ ] Limit controlled by prepare phase

---

### Scenario 17: Generate Command - Name Filtering
**Complexity**: Intermediate
**Category**: Token Generation
**Duration**: 10-15 minutes
**Status**: ⚠️ Needs retesting with preparation step

**Objective**: Generate only specific entity from multi-entity file

**Prerequisites**:
- `batch-monsters.json` from Scenario 15
- Scenario 15 completed (2 `.prompt` files exist)

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\batch-monsters.json --idOrName "Orc Grunt" --variants 1`
   - Expected: Generates only Orc Grunt image
   - Expected: Skips Skeleton Archer

**Expected Outcomes**:
```
[1/1] Orc Grunt
  [1/1] Variant: base
    TopDown... OK

Generation complete. 1/1 images generated.
```

**Validation**:
- [ ] Only Orc Grunt image generated
- [ ] Skeleton Archer skipped
- [ ] Console confirms filtering
- [ ] Exit code 0

---

### Scenario 18: Generate Command - Object Variants
**Complexity**: Intermediate
**Category**: Token Generation
**Duration**: 20-25 minutes
**Status**: ❌ INVALID - Needs preparation step

**Objective**: Test non-monster entities (objects with material/quality variants)

**Prerequisites**:
- Create `test-data/treasure-chest.json`:
```json
[
  {
    "Name": "Treasure Chest",
    "Genre": "Fantasy",
    "Category": "objects",
    "Type": "items",
    "Subtype": "containers",
    "Size": "medium",
    "PhysicalDescription": "ornate storage container",
    "DistinctiveFeatures": "metal fittings and lock",
    "Environment": "dungeons",
    "Alternatives": [
      {
        "Material": ["wood", "iron"],
        "Quality": ["common", "ornate"]
      }
    ],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\treasure-chest.json` and confirm
   - Expected: Creates 12 `.prompt` files (4 variants × 3 images each: TopDown, Miniature, Portrait - no Photo for objects)
2. Run `token generate --import C:\absolute\path\to\test-data\treasure-chest.json --variants 1`
   - Expected: Generates 4 object tokens (TopDown only)

**Expected Outcomes**:
- 4 variant folders: wood-common, wood-ornate, iron-common, iron-ornate
- Category: objects, Type: items
- 4 PNG files created (TopDown images)

**Note**: Objects only generate 3 image types (TopDown, Miniature, Portrait). They do NOT generate Photo images (reserved for creatures/characters).

**Validation**:
- [ ] Objects category works (not just monsters)
- [ ] Material and Quality dimensions expand correctly
- [ ] Folder structure: `images/fantasy/objects/items/containers/t/treasure_chest/...`
- [ ] 4 images generated (TopDown only with --variants 1)
- [ ] Images visually match variants
- [ ] Only 3 image types available (no Photo for objects)

---

### Scenario 19: Generate Command - Edit Prompt Before Generation
**Complexity**: Intermediate
**Category**: User Workflow
**Duration**: 10-15 minutes
**Status**: ❌ NEW SCENARIO - Demonstrates two-phase workflow benefit

**Objective**: Show ability to manually edit `.prompt` file before generation

**Prerequisites**:
- `simple-goblin.json` from Scenario 4
- Scenario 5 completed (top-down.prompt exists)

**Steps**:
1. Open `top-down.prompt` in text editor
2. Manually edit the prompt (e.g., add "wearing a red hat")
3. Save the file
4. Delete `top-down.png` if it exists
5. Run `token generate --import C:\absolute\path\to\test-data\simple-goblin.json --variants 1`
   - Expected: Uses edited prompt (not original)
   - Expected: Generated image reflects the edit (red hat visible)

**Expected Outcomes**:
- Image generated with custom prompt modifications
- Demonstrates user control over prompts
- No re-enhancement needed (uses edited file directly)

**Validation**:
- [ ] Edited prompt used for generation
- [ ] Image reflects manual changes
- [ ] No OpenAI API call
- [ ] User has full control over prompt

---

### Scenario 20: Generate Command - Incremental Generation
**Complexity**: Simple
**Category**: Token Generation
**Duration**: 5-10 minutes
**Status**: ✅ VALID - Tests incremental image generation

**Objective**: Generate additional image types incrementally

**Prerequisites**:
- `simple-goblin.json` from Scenario 4
- Scenario 5 completed (all 4 `.prompt` files exist)

**Current Behavior**:
- `token prepare` creates all 4 image type prompts automatically (TopDown, Miniature, Photo, Portrait)

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json` and confirm
   - Expected: Creates top-down.prompt, miniature.prompt, photo.prompt, portrait.prompt
2. Run `token generate --import C:\absolute\path\to\test-data\simple-goblin.json --variants 1`
   - Expected: Generates top-down.png only
3. Run `token generate --import C:\absolute\path\to\test-data\simple-goblin.json --variants 4`
   - Expected: Generates all 4 images (top-down.png, miniature.png, photo.png, portrait.png)

**Validation**:
- [ ] Prepare creates all 4 image type prompts
- [ ] Generate with --variants 1 creates only first image
- [ ] Generate with --variants 4 creates all 4 images
- [ ] Semantic file naming used (not token_1, token_2, etc.)

---

### Scenario 21: Prepare/Generate - Full Workflow End-to-End
**Complexity**: Intermediate
**Category**: Full Workflow
**Duration**: 15-20 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Demonstrate complete two-phase workflow from start to finish

**Prerequisites**:
- Create `test-data/complete-workflow.json`:
```json
[
  {
    "Name": "Halfling Rogue",
    "Genre": "Fantasy",
    "Category": "characters",
    "Type": "player_characters",
    "Subtype": "rogues",
    "Size": "small",
    "PhysicalDescription": "nimble halfling thief",
    "DistinctiveFeatures": "leather armor and daggers",
    "Environment": "urban streets",
    "Alternatives": [
      {
        "Gender": ["male", "female"],
        "Equipment": ["daggers", "shortsword"]
      }
    ],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\complete-workflow.json`
   - Confirm when prompted
   - Expected: 16 `.prompt` files created (4 variants × 4 image types)
2. Verify folder structure and `.prompt` files exist
3. Optional: Edit one `.prompt` file to customize
4. Run `token generate --import C:\absolute\path\to\test-data\complete-workflow.json --variants 1`
   - Expected: 4 PNG images created (TopDown only for each variant)
5. Run `token list --idOrName "Halfling Rogue"`
   - Expected: Shows entity with 4 variants, 4 images generated

**Expected Outcomes**:
- Complete workflow: prepare → edit (optional) → generate → verify
- 4 variant folders created
- 16 `.prompt` files (4 per variant: TopDown, Miniature, Photo, Portrait)
- 4 `.png` files (TopDown only with --variants 1)
- List command shows results

**Validation**:
- [ ] Prepare phase creates prompts successfully
- [ ] Folder structure correct
- [ ] Generate phase creates images
- [ ] Optional editing works
- [ ] List command shows complete entity
- [ ] No errors throughout workflow

---

### Scenario 22: Prepare/Generate - Iterative Workflow
**Complexity**: Intermediate
**Category**: Full Workflow
**Duration**: 10-15 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Demonstrate iterative refinement of prompts

**Prerequisites**:
- `simple-goblin.json` from Scenario 4

**Steps**:
1. Run `token prepare` and confirm → Creates top-down.prompt, miniature.prompt, photo.prompt, portrait.prompt
2. Run `token generate --variants 1` → Creates top-down.png
3. Review generated image (not satisfactory)
4. Delete top-down.png
5. Edit top-down.prompt to improve description
6. Run `token generate --variants 1` again → Creates new top-down.png with improved prompt
7. Compare images

**Expected Outcomes**:
- Demonstrates ability to iterate on prompts
- Shows separation of prompt costs (OpenAI) from generation costs (Stability AI)
- User can refine prompts without re-paying for OpenAI enhancement

**Validation**:
- [ ] First generation uses original prompt
- [ ] Can delete image without affecting prompt
- [ ] Can edit prompt manually
- [ ] Second generation uses edited prompt
- [ ] Only one OpenAI call (prepare phase)
- [ ] Multiple Stability AI calls allowed (generate phase)

---

## Phase 4: List & Show Commands

### Scenario 23: List Command - Basic Filtering
**Complexity**: Simple
**Category**: Query Commands
**Duration**: 3-5 minutes
**Status**: ⚠️ Needs retesting after new scenarios

**Objective**: Query generated tokens with list command

**Prerequisites**:
- Multiple scenarios completed (Goblin Scout, Goblin Warrior, etc.)

**Steps**:
1. Run `token list`
   - Expected: Shows all generated entities with counts
2. Run `token list --kind monster`
   - Expected: Filters to monsters only
3. Run `token list --idOrName "Goblin Scout"`
   - Expected: Shows only Goblin Scout entity

**Expected Outcomes** (example):
```
Found 3 entities:

Category     Type        Subtype      Name            Variants  Poses
--------------------------------------------------------------------
creatures    monsters    humanoids    Goblin Scout    1         1
creatures    monsters    humanoids    Goblin Warrior  8         8
creatures    monsters    humanoids    Orc Grunt       1         1

Total: 3 entities, 10 variants, 10 poses
```

**Validation**:
- [ ] All entities displayed with correct counts
- [ ] --kind filter works
- [ ] --idOrName filter works (case-insensitive)
- [ ] Summary totals are correct

---

### Scenario 24: Show Command - Detailed View
**Complexity**: Simple
**Category**: Query Commands
**Duration**: 3-5 minutes
**Status**: ⚠️ Needs retesting

**Objective**: View complete entity hierarchy

**Prerequisites**:
- Goblin Scout entity from previous scenarios

**Steps**:
1. Run `token show --idOrName "Goblin Scout"`
   - Expected: Shows all variants and poses with metadata

**Expected Outcomes**:
```
Entity: Goblin Scout
Category: creatures
Type: monsters
Subtype: humanoids

Total Variants: 1
Total Images: 4

Variant: base (4 images)
  TopDown: top-down.png (45.2 KB, created 2025-11-17 10:15:32 UTC)
  Miniature: miniature.png (47.8 KB, created 2025-11-17 10:15:35 UTC)
  Photo: photo.png (52.1 KB, created 2025-11-17 10:15:38 UTC)
  Portrait: portrait.png (38.5 KB, created 2025-11-17 10:15:41 UTC)
```

**Validation**:
- [ ] All variants listed
- [ ] All image types listed (TopDown, Miniature, Photo, Portrait)
- [ ] Metadata includes file size, timestamp, path
- [ ] Totals match
- [ ] Semantic file names displayed

---

### Scenario 25: Show Command - Cartesian Product Entity
**Complexity**: Simple
**Category**: Query Commands
**Duration**: 3-5 minutes
**Status**: ⚠️ Needs retesting

**Objective**: View entity with many variants

**Prerequisites**:
- Goblin Warrior entity from Scenario 14 (8 variants)

**Steps**:
1. Run `token show --idOrName "Goblin Warrior"`
   - Expected: Shows all 8 variants with their poses

**Expected Outcomes**:
```
Entity: Goblin Warrior
Category: creatures
Type: monsters
Subtype: humanoids

Total Variants: 8
Total Images: 8 (if only TopDown generated)

Variant: male-warrior-scimitar+shield (1 image)
  TopDown: top-down.png (47.3 KB, created ...)
Variant: male-warrior-axe (1 image)
  TopDown: top-down.png (45.8 KB, created ...)
...
```

**Note**: If all 4 image types generated, Total Images would be 32 (8 variants × 4 images)

**Validation**:
- [ ] All 8 variants listed
- [ ] Variant IDs use "+" for " and " separator
- [ ] Totals correct (8 variants)
- [ ] Image types displayed with semantic names (TopDown, Miniature, Photo, Portrait)

---

## Phase 5: Error Cases & Edge Scenarios

### Scenario 26: Prepare - OpenAI Prompt Enhancement Fallback
**Complexity**: Advanced
**Category**: Error Recovery
**Duration**: 5-7 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Verify fallback when OpenAI API fails during prepare

**Prerequisites**:
- Temporarily set invalid OpenAI API key in appsettings.json
- `simple-goblin.json`

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json` and confirm
   - Expected: OpenAI API returns 401/403 error
   - Expected: Falls back to basic prompt (no enhancement)
   - Expected: `.prompt` file still created with basic prompt

**Expected Outcomes**:
```
Can I proceed? (Y/n): y

Generating prompt files...

Enhancing prompt for Goblin Scout / base...
  ⚠ Warning: Prompt enhancement failed (OpenAI API error: 401 Unauthorized)
  Using fallback prompt: "A detailed top-down token of a small humanoid..."
  ✓

✓ Preparation complete. 1/1 prompts generated (1 used fallback).
```

**Validation**:
- [ ] Warning message displayed for OpenAI failure
- [ ] Fallback prompt used (basic description)
- [ ] `.prompt` file created with fallback content
- [ ] Prepare completes successfully
- [ ] Exit code 0 (warning, not error)

**Cleanup**: Restore valid OpenAI API key

---

### Scenario 27: Invalid JSON Format
**Complexity**: Simple
**Category**: Error Handling
**Duration**: 2-3 minutes
**Status**: ✅ Still valid (both prepare and generate should handle this)

**Objective**: Verify graceful handling of malformed JSON

**Prerequisites**:
- Create `test-data/invalid.json`:
```
{ invalid json }
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\invalid.json`
   - Expected: Error message about JSON format
   - Expected: Exit code 1

**Expected Outcomes**:
```
Error: Invalid JSON format: The JSON value could not be converted...
```

**Validation**:
- [ ] Clear error message
- [ ] No crash or stack trace
- [ ] Exit code 1
- [ ] Suggests checking JSON syntax

---

### Scenario 28: Empty Entity File
**Complexity**: Simple
**Category**: Error Handling
**Duration**: 2-3 minutes
**Status**: ✅ Still valid

**Objective**: Handle empty entity array

**Prerequisites**:
- Create `test-data/empty.json`:
```json
[]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\empty.json`
   - Expected: Shows 0 entities, exit code 0

**Expected Outcomes**:
```
Found 0 entities

No entities found in file.
```

**Validation**:
- [ ] Handles empty array gracefully
- [ ] No error (empty is valid)
- [ ] Exit code 0

---

### Scenario 29: Missing Required Fields
**Complexity**: Simple
**Category**: Error Handling
**Duration**: 3-5 minutes
**Status**: ✅ Still valid

**Objective**: Validate schema enforcement

**Prerequisites**:
- Create `test-data/missing-fields.json`:
```json
[
  {
    "Name": "Incomplete Entity",
    "Category": "creatures"
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\missing-fields.json`
   - Expected: Validation error

**Expected Outcomes**:
```
Found 1 entities

✗ Incomplete Entity:
  - Type is required.

=============================================================
Total entities: 1
Total variants: 0

✗ Some entities have validation errors.
```

**Validation**:
- [ ] Validation catches missing fields
- [ ] Clear error message
- [ ] Exit code 1

---

### Scenario 30: File Permissions - Read-Only Output Directory
**Complexity**: Intermediate
**Category**: Error Handling
**Duration**: 5-10 minutes
**Status**: ⚠️ Needs retesting for both prepare and generate

**Objective**: Handle write permission errors

**Prerequisites**:
- Make output directory read-only
- `simple-goblin.json`

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json` and confirm
   - Expected: Error when attempting to create directories

**Expected Outcomes**:
```
Can I proceed? (Y/n): y

Generating prompt files...

Error: Failed to create directory: Access denied
Path: C:\read-only-dir\images\creatures\...

Check directory permissions and try again.
```

**Validation**:
- [ ] Permission error caught
- [ ] Clear error message
- [ ] No partial file writes
- [ ] Exit code 1

**Cleanup**: Restore write permissions

---

### Scenario 31: Path Traversal Security
**Complexity**: Intermediate
**Category**: Security
**Duration**: 3-5 minutes
**Status**: ✅ Still valid

**Objective**: Verify path traversal protection

**Prerequisites**:
- Create `test-data/malicious.json`:
```json
[
  {
    "Name": "../../../etc/passwd",
    "Genre": "Fantasy",
    "Category": "creatures",
    "Type": "monsters",
    "Subtype": "humanoids",
    "Size": "small",
    "PhysicalDescription": "test",
    "DistinctiveFeatures": "test",
    "Environment": "test",
    "Alternatives": [],
    "SchemaVersion": 1
  }
]
```

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\malicious.json` and confirm
   - Expected: Entity name sanitized or rejected

**Expected Outcomes**:
- Path traversal attempt blocked
- Entity name sanitized
- No files created outside output directory

**Validation**:
- [ ] Path traversal blocked
- [ ] No security vulnerability
- [ ] Files only in output directory

---

### Scenario 32: Cancellation - Ctrl+C During Prepare
**Complexity**: Intermediate
**Category**: User Interaction
**Duration**: 3-5 minutes
**Status**: ❌ NEW SCENARIO

**Objective**: Verify graceful cancellation during prepare phase

**Prerequisites**:
- `goblin-variants.json` (8 variants)

**Steps**:
1. Run `token prepare --import C:\absolute\path\to\test-data\goblin-variants.json` and confirm
2. Press Ctrl+C after 2-3 prompts generated
   - Expected: Generation stops gracefully
   - Expected: Partial `.prompt` files saved

**Expected Outcomes**:
```
Generating prompt files...

Enhancing prompt for Goblin Warrior / male-warrior-scimitar+shield... ✓
Enhancing prompt for Goblin Warrior / male-warrior-axe... ✓
Enhancing prompt for Goblin Warrior / male-berserker-scimitar+shield...
^C
Preparation cancelled by user.

Partial progress saved: 2/8 prompts generated.
```

**Validation**:
- [ ] Graceful shutdown (no crash)
- [ ] Partial progress saved
- [ ] Can resume later
- [ ] No corrupted `.prompt` files

---

### Scenario 33: Cancellation - Ctrl+C During Generate
**Complexity**: Intermediate
**Category**: User Interaction
**Duration**: 3-5 minutes
**Status**: ⚠️ Needs retesting

**Objective**: Verify graceful cancellation during generate phase

**Prerequisites**:
- Scenario 14 completed (8 `.prompt` files exist for Goblin Warrior)
- Delete any existing PNG files

**Steps**:
1. Run `token generate --import C:\absolute\path\to\test-data\goblin-variants.json --variants 1`
2. Press Ctrl+C after 2-3 images generated
   - Expected: Generation stops gracefully
   - Expected: No corrupted PNG files

**Expected Outcomes**:
```
[1/1] Goblin Warrior
  [1/8] Variant: male-warrior-scimitar+shield
    TopDown... OK
  [2/8] Variant: male-warrior-axe
    TopDown... OK
  [3/8] Variant: male-berserker-scimitar+shield
    ^C
Generation cancelled by user.

Partial progress saved: 2/8 images generated.
```

**Validation**:
- [ ] Graceful shutdown (no crash)
- [ ] Partial progress saved
- [ ] No corrupted PNG files
- [ ] Can resume later (continues from image 3)

---

### Scenario 34: Network Timeout - Stability AI
**Complexity**: Advanced
**Category**: Error Recovery
**Duration**: 5-10 minutes
**Status**: ⚠️ Still valid but needs retesting

**Objective**: Handle API timeout errors

**Prerequisites**:
- Simulated slow network or timeout configuration
- `simple-goblin.json` and token_1.prompt

**Steps**:
1. Run generation with very short timeout (if configurable)
   - Expected: Timeout error with clear message

**Expected Outcomes**:
```
[1/1] Goblin Scout
  [1/1] Variant: base
    TopDown...
    ✗ Error: Stability AI timeout (exceeded 5 seconds)

Retrying... (attempt 2/3)
    TopDown... OK

Generation complete with warnings.
```

**Validation**:
- [ ] Timeout detected
- [ ] Retry logic (if implemented)
- [ ] Clear error message
- [ ] Generation can continue or fail gracefully

---

### Scenario 35: API Key Missing - Configuration Error
**Complexity**: Simple
**Category**: Error Handling
**Duration**: 3-5 minutes
**Status**: ⚠️ Needs updating for two-phase workflow

**Objective**: Verify missing API key detection in both phases

**Prerequisites**:
- `simple-goblin.json`

**Steps** (OpenAI key missing):
1. Temporarily remove OpenAI API key from appsettings.json
2. Run `token prepare --import C:\absolute\path\to\test-data\simple-goblin.json`
   - Expected: Configuration error OR fallback to basic prompt

**Steps** (Stability key missing):
1. Restore OpenAI key
2. Temporarily remove Stability API key
3. Run `token prepare` (should work - doesn't need Stability)
4. Run `token generate --import C:\absolute\path\to\test-data\simple-goblin.json`
   - Expected: Configuration error before API calls

**Expected Outcomes**:
```
Error: Stability API key not configured.

Add "Stability:ApiKey" to appsettings.json or use user secrets.
Run 'token doctor' for full diagnostics.
```

**Validation**:
- [ ] Prepare works without Stability key (only needs OpenAI)
- [ ] Generate fails without Stability key
- [ ] Error caught early (before API calls)
- [ ] Suggests running doctor command
- [ ] Clear remediation
- [ ] Exit code 1

**Cleanup**: Restore API keys

---

## Test Summary Checklist

After completing all scenarios, verify:

**Environment**:
- [ ] Doctor command passes all checks
- [ ] API keys valid and working
- [ ] Output directory writable

**Prepare Workflow**:
- [ ] Entity validation works
- [ ] Variant expansion correct (cartesian products)
- [ ] OpenAI prompt enhancement works
- [ ] Fallback to basic prompt on OpenAI failure
- [ ] `.prompt` files created in correct folders
- [ ] Overwrite handling works (Yes/No/All/Cancel)
- [ ] --limit parameter works
- [ ] User confirmation works
- [ ] Cancellation graceful

**Generate Workflow**:
- [ ] Reads `.prompt` files correctly
- [ ] Fails gracefully when `.prompt` files missing
- [ ] Generates images successfully
- [ ] No OpenAI calls during generation
- [ ] Only Stability AI calls
- [ ] Image files created in correct locations
- [ ] Image quality and aspect ratios correct

**Two-Phase Benefits**:
- [ ] Can edit prompts between prepare and generate
- [ ] Separate costs (OpenAI vs Stability)
- [ ] Can regenerate images without re-enhancing prompts
- [ ] Full user control over prompts

**Query Commands**:
- [ ] List command works (filtering by name and kind)
- [ ] Show command works (detailed view)
- [ ] Correct variant and pose counts

**Error Handling**:
- [ ] Invalid JSON handled
- [ ] Missing fields caught
- [ ] Permission errors clear
- [ ] Path traversal blocked
- [ ] Cancellation graceful (both phases)
- [ ] API errors handled (OpenAI and Stability)
- [ ] Missing API keys detected

**Overall**:
- [ ] No crashes or unhandled exceptions
- [ ] Exit codes correct (0 success, 1 failure)
- [ ] File system structure correct (8-level hierarchy: genre → category → type → subtype → letter → entity → variant)
- [ ] All PNG files valid (not corrupted)
- [ ] All `.prompt` files valid (text content)
- [ ] Progress display accurate
- [ ] Console output clear and helpful
- [ ] Variant IDs use "+" for " and " separator
- [ ] Semantic file naming used (top-down.png, miniature.png, photo.png, portrait.png)
- [ ] Creatures/Characters generate 4 image types (TopDown, Miniature, Photo, Portrait)
- [ ] Objects generate 3 image types (TopDown, Miniature, Portrait - no Photo)

---

**End of Test Scenarios**
