# Generated: 2025-10-11 (Phase 5 BDD Rewrite)
# Use Case: Create Asset
# UI Component: AssetCreateDialog.tsx
# Phase: EPIC-001 Phase 5

Feature: Create Asset
  As a Game Master
  I want to create new asset templates with images and properties
  So that I can build a reusable content library for my game scenes

  Background:
    Given I am authenticated as a Game Master
    And I am on the Asset Library page
    And I have opened the Asset Create Dialog

  # ═══════════════════════════════════════════════════════════════
  # DIALOG OPENING & INITIALIZATION
  # ═══════════════════════════════════════════════════════════════

  @smoke @happy-path
  Scenario: Create dialog opens with correct initial state
    When the dialog opens via "Add Object" card
    Then the dialog title should be "Create New Asset"
    And the "Object" tab should be selected
    And the "Identity & Basics" accordion should be expanded by default
    And the "Properties" accordion should be collapsed
    And the "Asset Images" section should be visible at the top
    And the "Create Asset" button should be disabled
    And the "Cancel" button should be enabled

  @ui
  Scenario: Create dialog opens with fixed kind from virtual "Add" card
    Given I am on the "Creatures" tab in Asset Library
    When I click the virtual "Add Creature" card
    Then the Create Dialog should open
    And the kind should be locked to "Creature"
    And the kind tabs should not be visible
    And I should not be able to change the kind

  # ═══════════════════════════════════════════════════════════════
  # MINIMAL ASSET CREATION (HAPPY PATH)
  # ═══════════════════════════════════════════════════════════════

  @happy-path @smoke @critical
  Scenario: Create minimal Object asset with name only
    Given I select the "Object" tab
    When I fill in name "Wooden Crate"
    Then the "Create Asset" button should be enabled
    When I click "Create Asset"
    Then the asset should be created successfully
    And I should see a success notification
    And the dialog should close
    And the Asset Library should show the new "Wooden Crate" asset
    And the asset should have:
      | kind        | Object        |
      | description | (empty)       |
      | isPublic    | false         |
      | isPublished | false         |
      | resources   | (empty array) |
      | objectProps.size | 1×1      |
      | objectProps.isMovable | true |
      | objectProps.isOpaque | false |

  @happy-path @smoke @critical
  Scenario: Create minimal Creature asset with name only
    Given I select the "Creature" tab
    When I fill in name "Goblin Scout"
    Then the "Create Asset" button should be enabled
    When I click "Create Asset"
    Then the asset should be created successfully
    And the asset should have:
      | kind                      | Creature              |
      | creatureProps.category    | Character (default)   |
      | creatureProps.size        | 1×1 (default)         |
      | resources                 | (empty array)         |

  # ═══════════════════════════════════════════════════════════════
  # FULL ASSET CREATION (ALL PROPERTIES)
  # ═══════════════════════════════════════════════════════════════

  @happy-path @comprehensive
  Scenario: Create complete Object asset with all properties and resources
    Given I select the "Object" tab
    And I fill in name "Stone Wall"
    And I fill in description "Solid stone wall segment for dungeon maps"
    And I upload image "wall-token.png" and assign Token role
    And I upload image "wall-display.png" and assign Display role
    And I expand the "Properties" accordion
    And I set size width to 1
    And I set size height to 2
    And I uncheck "isSquare"
    And I uncheck "isMovable"
    And I check "isOpaque"
    And I check "isPublic"
    And I keep "isPublished" unchecked
    When I click "Create Asset"
    Then the asset should be created successfully
    And the backend should receive:
      | kind        | Object                                    |
      | name        | Stone Wall                                |
      | description | Solid stone wall segment for dungeon maps |
      | resources   | 2 items (1 Token, 1 Display)              |
      | isPublic    | true                                      |
      | isPublished | false                                     |
    And objectProps should be:
      | size.width  | 1     |
      | size.height | 2     |
      | size.isSquare | false |
      | isMovable   | false |
      | isOpaque    | true  |

  @happy-path @comprehensive
  Scenario: Create complete Creature asset with all properties
    Given I select the "Creature" tab
    And I fill in name "Ancient Red Dragon"
    And I fill in description "Legendary dragon with devastating flame breath"
    And I upload image "dragon.png" and assign both Token and Display roles
    And I expand the "Properties" accordion
    And I set size to 4×4 cells
    And I check "isSquare" to true
    And I select category "Monster"
    And I check both "isPublic" and "isPublished"
    When I click "Create Asset"
    Then the asset should be created successfully
    And the backend should receive creatureProps:
      | size.width  | 4       |
      | size.height | 4       |
      | category    | Monster |
    And the asset should have 1 resource with role "Token,Display" (value: 3)

  # ═══════════════════════════════════════════════════════════════
  # NAME VALIDATION
  # ═══════════════════════════════════════════════════════════════

  @validation @critical
  Scenario: Save button disabled when name is empty
    Given the name field is empty
    Then the "Create Asset" button should be disabled
    When I fill in name "Asset"
    Then the "Create Asset" button should be enabled

  @validation
  Scenario: Save button disabled when name is too short (less than 3 characters)
    When I fill in name "Ab" (2 characters)
    Then the "Create Asset" button should be disabled
    When I add one more character making it "Abc"
    Then the "Create Asset" button should be enabled

  @validation
  Scenario: Save button disabled when name is whitespace only
    When I fill in name "   " (3 spaces)
    Then the "Create Asset" button should be disabled

  @validation @error-handling
  Scenario: Backend rejects name exceeding 128 characters
    Given I fill in name with 129 characters
    When I click "Create Asset"
    Then I should see validation error from backend
    And error message should say "Asset name must not exceed 128 characters"
    And the dialog should remain open
    And the name field should preserve my input
    And I should be able to correct and retry

  @edge-case
  Scenario: Name with exactly 128 characters is accepted
    Given I fill in name with exactly 128 characters
    When I click "Create Asset"
    Then the asset should be created successfully
    And the asset name length should be 128

  # ═══════════════════════════════════════════════════════════════
  # DESCRIPTION VALIDATION
  # ═══════════════════════════════════════════════════════════════

  @validation @happy-path @critical
  Scenario: Description is optional - save button enabled without it
    Given I fill in name "Minimal Asset"
    And I leave description empty
    Then the "Create Asset" button should be enabled
    When I click "Create Asset"
    Then the asset should be created successfully
    And the asset description should be empty string

  @validation @error-handling
  Scenario: Backend rejects description exceeding 4096 characters
    Given I fill in name "Large Desc Asset"
    And I fill in description with 4097 characters
    When I click "Create Asset"
    Then I should see validation error from backend
    And error message should mention "4096 characters"

  @edge-case
  Scenario: Description with exactly 4096 characters is accepted
    Given I fill in name "Max Desc Asset"
    And I fill in description with exactly 4096 characters
    When I click "Create Asset"
    Then the asset should be created successfully
    And the description length should be 4096

  # ═══════════════════════════════════════════════════════════════
  # SIZE VALIDATION & FRACTIONAL SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @validation @critical
  Scenario: Save button disabled when size width is zero or negative
    Given I fill in name "Asset"
    And I expand "Properties" accordion
    When I set size width to 0
    Then the "Create Asset" button should be disabled
    When I set size width to -1
    Then the "Create Asset" button should still be disabled

  @validation
  Scenario: Save button disabled when size height is zero or negative
    Given I fill in name "Asset"
    When I set size height to 0
    Then the "Create Asset" button should be disabled

  @happy-path @namedsize
  Scenario: Create asset with fractional size (Tiny = ½ cell)
    Given I fill in name "Tiny Token"
    And I set size width to 0.5
    And I set size height to 0.5
    And I check "isSquare" to true
    When I click "Create Asset"
    Then the asset should be created with size 0.5×0.5
    And the size should be named "Tiny" in the backend

  @happy-path @namedsize
  Scenario: Create asset with fractional size (Miniscule = ⅛ cell)
    Given I fill in name "Miniscule Marker"
    And I set size to 0.125×0.125
    When I click "Create Asset"
    Then the asset should be created successfully
    And size should be "Miniscule"

  @happy-path @namedsize
  Scenario: Create asset with standard sizes (Small, Medium, Large, Huge, Gargantuan)
    When I create assets with sizes:
      | name            | width | height | namedSize   |
      | Small Creature  | 0.75  | 0.75   | Small       |
      | Medium Hero     | 1     | 1      | Medium      |
      | Large Monster   | 2     | 2      | Large       |
      | Huge Dragon     | 3     | 3      | Huge        |
      | Gargantuan Beast| 4     | 4      | Gargantuan  |
    Then all assets should be created with correct named sizes

  @edge-case @namedsize
  Scenario: Create asset with very large size (20×20 for Colossal)
    Given I fill in name "Colossal Titan"
    And I set size to 20×20 cells
    When I click "Create Asset"
    Then the asset should be created successfully
    And the size should be 20×20 cells
    And the size should be named "Custom"

  @namedsize
  Scenario: Create asset with non-square size
    Given I fill in name "Rectangular Object"
    And I set size width to 2
    And I set size height to 1
    And I uncheck "isSquare"
    When I click "Create Asset"
    Then the asset should be created with:
      | size.width    | 2     |
      | size.height   | 1     |
      | size.isSquare | false |

  # ═══════════════════════════════════════════════════════════════
  # PUBLISHING RULES VALIDATION
  # ═══════════════════════════════════════════════════════════════

  @validation @business-rule @critical
  Scenario: Cannot publish private asset (frontend validation prevents submission)
    Given I fill in name "Invalid Publish"
    And I check "isPublished" to true
    And I keep "isPublic" unchecked (false)
    Then the "Create Asset" button should be disabled
    And I should not be able to submit the invalid form
    When I check "isPublic" to true
    Then the "Create Asset" button should be enabled
    And I can now create a public published asset

  @happy-path @business-rule
  Scenario: Can create public published asset
    Given I fill in name "Public Published Asset"
    And I check "isPublic" to true
    And I check "isPublished" to true
    When I click "Create Asset"
    Then the asset should be created successfully
    And the asset should be visible in public asset searches
    And other users should be able to see this asset

  @happy-path @business-rule
  Scenario: Can create public unpublished (draft) asset
    Given I fill in name "Public Draft"
    And I check "isPublic" to true
    And I keep "isPublished" unchecked
    When I click "Create Asset"
    Then the asset should be created successfully
    And the asset should be public but not published
    And other users should not see this asset

  @happy-path @business-rule
  Scenario: Can create private unpublished asset (default)
    Given I fill in name "Private Asset"
    And I keep both "isPublic" and "isPublished" unchecked
    When I click "Create Asset"
    Then the asset should be created successfully
    And only I should be able to see this asset

  # ═══════════════════════════════════════════════════════════════
  # OBJECT-SPECIFIC PROPERTIES
  # ═══════════════════════════════════════════════════════════════

  @happy-path @object
  Scenario: Create immovable opaque Object (wall/door)
    Given I select "Object" tab
    And I fill in name "Stone Wall"
    And I expand "Properties" accordion
    And I uncheck "isMovable"
    And I check "isOpaque"
    When I click "Create Asset"
    Then the asset objectProps should be:
      | isMovable | false |
      | isOpaque  | true  |

  @happy-path @object
  Scenario: Create movable transparent Object (furniture)
    Given I select "Object" tab
    And I fill in name "Wooden Table"
    And the default "isMovable" is checked
    And the default "isOpaque" is unchecked
    When I click "Create Asset"
    Then the asset objectProps should be:
      | isMovable | true  |
      | isOpaque  | false |

  # ═══════════════════════════════════════════════════════════════
  # CREATURE-SPECIFIC PROPERTIES
  # ═══════════════════════════════════════════════════════════════

  @happy-path @creature
  Scenario: Create Creature with Character category (default)
    Given I select "Creature" tab
    And I fill in name "Hero Paladin"
    And I do not change the category
    When I click "Create Asset"
    Then the asset creatureProps.category should be "Character"

  @happy-path @creature
  Scenario: Create Creature with Monster category
    Given I select "Creature" tab
    And I fill in name "Goblin Warrior"
    And I expand "Properties" accordion
    And I select category "Monster"
    When I click "Create Asset"
    Then the asset creatureProps.category should be "Monster"

  # ═══════════════════════════════════════════════════════════════
  # MULTI-RESOURCE UPLOAD & ROLE ASSIGNMENT
  # ═══════════════════════════════════════════════════════════════

  @happy-path @resources @critical
  Scenario: Upload image and assign Token role via Alt+Click
    Given I fill in name "Dragon"
    When I click "Upload" and select "dragon.png"
    And upload completes successfully
    Then the Manage panel should auto-expand
    And I should see the image in the Image Library grid
    And the image should have no role badges
    When I Alt+Click the image
    Then the image should show a "Token" badge
    And the image border should be blue (primary color)
    And the collapsed Token preview should show the image
    When I click "Create Asset"
    Then the asset should be created with 1 resource
    And resource[0].role should be 1 (Token)

  @happy-path @resources @critical
  Scenario: Upload image and assign Display role via Ctrl+Click
    Given I fill in name "Hero"
    When I upload "hero.jpg"
    And I Ctrl+Click the uploaded image
    Then the image should show a "Display" badge
    And the image border should be purple (secondary color)
    And the collapsed Display preview should show the image
    When I click "Create Asset"
    Then resource[0].role should be 2 (Display)

  @happy-path @resources @critical
  Scenario: Upload image and assign both roles via Ctrl+Alt+Click
    Given I fill in name "Goblin"
    When I upload "goblin.png"
    And I Ctrl+Alt+Click the image
    Then the image should show both "Token" and "Display" badges
    And the image border should be green (success color)
    And both Token and Display previews should show the image
    When I click "Create Asset"
    Then resource[0].role should be 3 (Token | Display)

  @resources @keyboard-shortcuts
  Scenario: Toggle roles on and off with keyboard shortcuts
    Given I upload an image
    And I Alt+Click to assign Token role
    Then the image should have Token role
    When I Alt+Click again
    Then the Token role should be removed (toggled off)
    And the image should have role "None" (0)
    And the image border should be grey

  @resources @keyboard-shortcuts
  Scenario: Change roles using different keyboard combinations
    Given I upload an image
    When I Alt+Click to assign Token role
    Then role should be 1 (Token)
    When I Ctrl+Click to also assign Display role
    Then role should be 3 (Token | Display)
    When I Alt+Click to remove Token role
    Then role should be 2 (Display only)

  @happy-path @resources
  Scenario: Upload multiple images with mixed roles
    Given I fill in name "Multi-Resource Asset"
    When I upload "image1.png" and assign Token role only
    And I upload "image2.png" and assign Display role only
    And I upload "image3.png" and assign both roles
    And I upload "image4.png" without assigning any role
    Then I should see 4 images in the Manage panel
    And image1 should have "Token" badge
    And image2 should have "Display" badge
    And image3 should have both badges
    And image4 should have no badges
    When I click "Create Asset"
    Then the asset should be created with 4 resources
    And resources should have roles: [1, 2, 3, 0]

  @resources
  Scenario: Create asset with image uploaded but no role assigned
    Given I fill in name "No Role Asset"
    And I upload an image
    And I do not use any keyboard shortcuts
    When I click "Create Asset"
    Then the asset should be created with 1 resource
    And resource[0].role should be 0 (None)

  # ═══════════════════════════════════════════════════════════════
  # IMAGE FORMAT CONVERSION
  # ═══════════════════════════════════════════════════════════════

  @resources @conversion
  Scenario: SVG image converts to PNG automatically
    Given I fill in name "SVG Asset"
    When I upload SVG file "icon.svg"
    And upload completes
    Then I should see the image displayed as PNG
    And the backend should store it in PNG format

  @resources @conversion
  Scenario Outline: All image formats convert to PNG
    Given I fill in name "Format Test"
    When I upload <format> file
    Then the image should be converted to PNG
    And I should see the converted image in Manage panel

    Examples:
      | format |
      | JPEG   |
      | SVG    |
      | GIF    |
      | WebP   |
      | BMP    |
      | TIFF   |

  # ═══════════════════════════════════════════════════════════════
  # RESOURCE REMOVAL
  # ═══════════════════════════════════════════════════════════════

  @resources
  Scenario: Remove uploaded image before saving
    Given I fill in name "Asset"
    And I upload 2 images
    When I click the X button on the first image
    Then the image should be removed immediately
    And I should see 1 image remaining
    When I click "Create Asset"
    Then the asset should be created with 1 resource only

  @resources
  Scenario: Remove all images shows empty state
    Given I upload 2 images
    When I remove both images
    Then the Manage panel should show "No images uploaded yet"
    And Token preview should show "No token"
    And Display preview should show "No display"

  # ═══════════════════════════════════════════════════════════════
  # ACCORDION UI BEHAVIOR
  # ═══════════════════════════════════════════════════════════════

  @ui
  Scenario: Identity & Basics accordion is expanded by default
    When the dialog opens
    Then the "Identity & Basics" accordion should be expanded
    And I should see name and description fields
    And I should see isPublic and isPublished checkboxes

  @ui
  Scenario: Properties accordion is collapsed by default
    When the dialog opens
    Then the "Properties" accordion should be collapsed
    When I click the "Properties" header
    Then the accordion should expand
    And I should see size and kind-specific property fields

  @ui
  Scenario: Both accordions have "Required" badges
    Then the "Identity & Basics" accordion should show "Required" badge
    And the "Properties" accordion should show "Required" badge

  # ═══════════════════════════════════════════════════════════════
  # KIND SWITCHING
  # ═══════════════════════════════════════════════════════════════

  @ui
  Scenario: Switch from Object to Creature clears Object properties
    Given I select "Object" tab
    And I expand "Properties" accordion
    And I configure Object properties (isMovable, isOpaque)
    When I switch to "Creature" tab
    Then I should see Creature properties form
    And Object properties should not be sent to backend
    When I click "Create Asset"
    Then the asset should have creatureProps (not objectProps)

  @ui
  Scenario: Switch from Creature to Object clears Creature properties
    Given I select "Creature" tab
    And I set category to "Monster"
    When I switch to "Object" tab
    And I click "Create Asset"
    Then the asset should have objectProps (not creatureProps)

  # ═══════════════════════════════════════════════════════════════
  # CANCEL & DIALOG CLOSE
  # ═══════════════════════════════════════════════════════════════

  @ui-interaction @critical
  Scenario: Cancel button closes dialog without creating asset
    Given I fill in name "Test Asset"
    And I upload an image
    When I click "Cancel"
    Then the dialog should close
    And no asset should be created
    And no API call should be made
    When I open the Create Dialog again
    Then all fields should be reset to defaults

  @ui-interaction
  Scenario: X button closes dialog without saving
    Given I fill in name "Test"
    When I click the X button in dialog header
    Then the dialog should close
    And no asset should be created

  @ui-interaction
  Scenario: Clicking outside dialog does not close it
    Given the dialog is open
    When I click on the backdrop
    Then the dialog should remain open (no onClose by default)

  # ═══════════════════════════════════════════════════════════════
  # ERROR HANDLING & RECOVERY
  # ═══════════════════════════════════════════════════════════════

  @error-handling
  Scenario: Handle backend service unavailable during creation
    Given I fill in valid asset data
    And the Assets API returns 503 Service Unavailable
    When I click "Create Asset"
    Then I should see error alert "Service temporarily unavailable"
    And the dialog should remain open
    And all my input should be preserved
    And I should be able to retry after service recovers

  @error-handling @resources
  Scenario: Handle upload error gracefully
    Given I fill in name "Asset"
    When I upload an image that fails to process
    Then I should see error "Failed to upload image: [error details]"
    And the error should be displayed in an Alert component
    And I should be able to dismiss the error
    And I should be able to upload a different image

  @error-handling @authorization
  Scenario: Unauthenticated user cannot open create dialog
    Given I am not authenticated
    When I navigate to "/assets"
    Then I should be redirected to "/login"
    And I should not see the Asset Library
    And I should not be able to open Create Dialog

  # ═══════════════════════════════════════════════════════════════
  # LOADING STATES & UI FEEDBACK
  # ═══════════════════════════════════════════════════════════════

  @ui-feedback
  Scenario: Create button shows loading state during creation
    Given I fill in valid asset data
    When I click "Create Asset"
    Then the button text should change to "Creating..."
    And I should see a loading spinner icon
    And the "Create Asset" button should be disabled
    And the "Cancel" button should be disabled
    And I should not be able to close the dialog
    When creation completes
    Then the dialog should close automatically

  @ui-feedback @resources
  Scenario: Upload button shows loading state during upload
    When I click "Upload" and select a file
    Then the "Upload" button should be disabled
    And I should see a loading spinner in the button
    When upload completes
    Then the button should re-enable
    And the Manage panel should auto-expand

  # ═══════════════════════════════════════════════════════════════
  # INTEGRATION & DATA PERSISTENCE
  # ═══════════════════════════════════════════════════════════════

  @integration @critical @bug-prevention
  Scenario: Created asset has OwnerId set correctly (prevents 403 on update)
    Given I am authenticated with user ID "019639ea-c7de-7a01-8548-41edfccde206"
    When I create an asset named "Ownership Test"
    Then the created asset OwnerId should be "019639ea-c7de-7a01-8548-41edfccde206"
    And I should be able to immediately edit the asset without 403 error
    And I should be able to delete the asset without 403 error

  @integration @happy-path
  Scenario: Created asset appears in Asset Library grid immediately
    Given I am viewing page 1 of Asset Library
    And I see 5 assets
    When I create a new asset "Fresh Asset"
    And the dialog closes
    Then the Asset Library should refetch
    And I should see 6 assets
    And "Fresh Asset" should be visible in the grid

  @integration @resources @critical
  Scenario: Created asset with resources persists correctly
    Given I create asset "Resource Persist Test"
    And I upload "token.png" and assign Token role
    And I upload "display.png" and assign Display role
    When I save the asset
    Then the asset should be created successfully
    When I immediately reopen the asset for editing
    Then I should see 2 images in the Manage panel
    And "token.png" should have Token role badge
    And "display.png" should have Display role badge
    And both roles should be persisted in database

  @integration @resources @bug-prevention
  Scenario: Manage panel auto-expands when editing asset with existing resources
    Given I create an asset with 2 uploaded images
    And I close the create dialog
    When I click the asset card to open preview dialog
    And I click "Edit" button
    Then the Manage panel should auto-expand automatically
    And I should see both images immediately (not hidden)

  # ═══════════════════════════════════════════════════════════════
  # DATABASE PERSISTENCE & CLOUD STORAGE
  # ═══════════════════════════════════════════════════════════════

  @database @backend-integration @critical
  Scenario: Asset creation persists complete database records
    Given I am authenticated with user ID "019639ea-c7de-7a01-8548-41edfccde206"
    When I create Object asset "Stone Wall" with 2 images (Token and Display)
    And the creation succeeds
    Then querying the database should show:
      | Table   | Count | Conditions                                    |
      | Assets  | 1     | Name="Stone Wall", OwnerId={userId}, Kind=Object |
    And the Asset record should have:
      | Field       | Value                                   |
      | OwnerId     | 019639ea-c7de-7a01-8548-41edfccde206   |
      | Kind        | Object                                  |
      | IsPublic    | false                                   |
      | IsPublished | false                                   |
      | CreatedAt   | within 5 seconds of now                 |
      | UpdatedAt   | equal to CreatedAt                      |
    And AssetResources table should have 2 records linking to the Asset
    And each AssetResource should have correct Role values (1 for Token, 2 for Display)
    And Resources table should have 2 PNG image records

  @database @backend-integration
  Scenario: AssetResource records link Resources to Asset with role flags
    When I create asset with 3 resources:
      | image   | role          | roleValue |
      | img1    | Token         | 1         |
      | img2    | Display       | 2         |
      | img3    | Token,Display | 3         |
    Then the AssetResources table should contain:
      | AssetId | ResourceId | Role |
      | {new}   | {img1-id}  | 1    |
      | {new}   | {img2-id}  | 2    |
      | {new}   | {img3-id}  | 3    |
    And each Resource should be queryable from Media.Resources table
    And each Resource should be PNG format stored in blob

  @cloud-storage @backend-integration @critical
  Scenario: Uploaded images stored in blob storage with GUID v7 IDs
    When I upload image "dragon.png" during asset creation
    Then the backend should generate GUID v7 resource ID (e.g., "018c-d5e2-70b0-7890-...")
    And the PNG image should be stored at blob path "images/{last4}/{guid:32}"
    And the blob should be accessible via /api/resources/{guid}/download
    And the Content-Type should be "image/png"
    And the Resource table should store metadata (dimensions, file size, mime type)

  @cloud-storage @backend-integration
  Scenario: SVG converts to PNG and stored in blob with metadata
    When I upload SVG file "icon.svg"
    Then backend uses Svg.Skia to convert to PNG
    And the PNG is stored in blob (not the original SVG)
    And Resource.metadata.contentType should be "image/png"
    And Resource.metadata.imageSize should contain extracted dimensions

  @error-handling @backend-integration
  Scenario: Duplicate asset name rejected by backend
    Given I previously created asset "Dragon Token"
    And I fill in name "Dragon Token"
    When I click "Create Asset"
    Then backend should return error "Duplicate asset name"
    And the dialog should remain open
    And I should be able to correct the name

  # ═══════════════════════════════════════════════════════════════
  # EDGE CASES & BOUNDARY CONDITIONS
  # ═══════════════════════════════════════════════════════════════

  @edge-case
  Scenario: Create asset with maximum name and description lengths
    Given I fill in name with 128 characters
    And I fill in description with 4096 characters
    When I click "Create Asset"
    Then the asset should be created successfully

  @edge-case
  Scenario: Upload 10 images to single asset
    Given I fill in name "Many Images"
    When I upload 10 different images
    And I assign various roles to them
    Then I should see all 10 images in Manage panel
    When I click "Create Asset"
    Then the asset should be created with 10 resources

  @edge-case
  Scenario: Create with isSquare checkbox handling
    Given I set size to 2×2
    Then the "isSquare" checkbox should auto-check
    When I change height to 3 (making 2×3)
    Then the "isSquare" checkbox should auto-uncheck

  # ═══════════════════════════════════════════════════════════════
  # THEME & RESPONSIVE SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario: Create dialog supports dark mode
    Given I have dark mode enabled
    When the dialog opens
    Then the dialog should have dark styling
    And accordions should have dark backgrounds
    And form fields should be styled for dark mode

  # REMOVED: Mobile not supported - responsive scenario deleted
