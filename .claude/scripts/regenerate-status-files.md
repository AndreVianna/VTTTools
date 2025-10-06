# Batch Regenerate STATUS Files

This script regenerates STATUS files in batches using data from IMPLEMENTATION_ASSESSMENT.md and memory storage.

## Batch Strategy

**Batch Size**: 10-15 files per batch
**Total Files**: 72 (14 FEATURE + 58 USECASE)
**Batches**: 6-8 total

## Phase 1: Store Assessment Data in Memory

Read IMPLEMENTATION_ASSESSMENT.md and store all data in memory entities.

<foreach {use_case} in {all_58_use_cases}>
Create memory entity with:
- Name: "UC: {use_case_name}"
- Type: "use_case_assessment"
- Observations: status, files, test_status, recommendation, area, feature
</foreach>

## Phase 2: Batch Processing

### Batch 1: Authentication & Authorization - Core Authentication (4 use cases)
- Login_STATUS.md
- Register_STATUS.md
- Logout_STATUS.md
- Get Current User_STATUS.md

### Batch 2: Authentication & Authorization - Account Management (5 use cases)
- Update Profile_STATUS.md
- Change Password_STATUS.md
- Request Password Reset_STATUS.md
- Confirm Password Reset_STATUS.md
- Manage Security Settings_STATUS.md

### Batch 3: Authentication & Authorization - Two Factor Auth (6 use cases)
- Setup Two Factor_STATUS.md
- Verify Two Factor Code_STATUS.md
- Generate Recovery Codes_STATUS.md
- Use Recovery Code_STATUS.md
- Disable Two Factor_STATUS.md
- View Recovery Codes_STATUS.md

### Batch 4: Asset Management + Asset Templates (6 use cases)
- Get Assets_STATUS.md
- Get Asset By Id_STATUS.md
- Create Asset_STATUS.md
- Update Asset_STATUS.md
- Delete Asset_STATUS.md
- Clone Asset_STATUS.md

### Batch 5: Adventure Library - Adventure Management (7 use cases)
- Get Adventures_STATUS.md
- Get Adventure By Id_STATUS.md
- Create Adventure_STATUS.md
- Update Adventure_STATUS.md
- Delete Adventure_STATUS.md
- Clone Adventure_STATUS.md
- Get Adventure Scenes_STATUS.md

### Batch 6: Adventure Library - Scene Management (5 use cases)
- Get Scenes_STATUS.md
- Get Scene By Id_STATUS.md
- Create Scene_STATUS.md
- Update Scene_STATUS.md
- Delete Scene_STATUS.md

### Batch 7: Game Session Management - Session Lifecycle (9 use cases)
- Get Game Sessions_STATUS.md
- Get Game Session By Id_STATUS.md
- Create Game Session_STATUS.md
- Update Game Session_STATUS.md
- Delete Game Session_STATUS.md
- Join Game Session_STATUS.md
- Leave Game Session_STATUS.md
- Start Game Session_STATUS.md
- Stop Game Session_STATUS.md

### Batch 8: Game Session Management - Scene Control + Others (16 use cases)
- Set Active Scene_STATUS.md
- Send Chat Message_STATUS.md
- Get Chat Messages_STATUS.md
- Scene Composition (6 use cases)
- Media Resource Management (4 use cases)
- Platform Infrastructure (2 use cases)
- Onboarding (1 use case)

## Phase 3: Regenerate FEATURE_STATUS Files (14 files)

After all USECASE_STATUS files are complete, regenerate FEATURE_STATUS files by aggregating use case data.

## Verification Criteria

Each USECASE_STATUS.md must have:
- ✅ 150-200 lines (not 20)
- ✅ Real file names in Implementation section
- ✅ Real status (FULLY_IMPLEMENTED/PARTIALLY_IMPLEMENTED/NOT_IMPLEMENTED)
- ✅ Real recommendation (KEEP_AS_IS/ENHANCE/REFACTOR/COMPLETE/IMPLEMENT)
- ✅ Specific roadmap items based on assessment
- ✅ Test status (NO_TESTS for most)

Each FEATURE_STATUS.md must have:
- ✅ 50-75 lines (not 20)
- ✅ Complete use case matrix table
- ✅ Real status for each use case
- ✅ Aggregate statistics
