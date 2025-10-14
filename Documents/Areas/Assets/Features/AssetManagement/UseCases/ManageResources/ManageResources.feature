# Generated: 2025-10-11 (Phase 5 BDD Rewrite)
# Use Case: Manage Asset Resources (Multi-Resource System)
# UI Component: AssetResourceManager.tsx
# Phase: EPIC-001 Phase 5

Feature: Manage Asset Resources
  As a Game Master
  I want to upload multiple images to an asset and assign them Token or Display roles
  So that I can have different visualizations for asset library vs scene placement

  Background:
    Given I am authenticated as a Game Master
    And I am in the Asset Create or Edit Dialog
    And the Asset Resource Manager component is visible

  # ═══════════════════════════════════════════════════════════════
  # UPLOAD WORKFLOW
  # ═══════════════════════════════════════════════════════════════

  @smoke @happy-path
  Scenario: Upload image successfully
    When I click the "Upload" button
    And I select an image file "dragon.png"
    Then the file should be uploaded to the backend
    And the backend should convert it to PNG format
    And the backend should return a resource ID
    And the image should appear in the Manage panel
    And the Manage panel should auto-expand
    And the image should have role "None" (0) initially
    And the image should have a grey border (no role assigned)

  @upload
  Scenario: Upload button accepts only image formats
    When I click "Upload" button
    Then the file input should accept: "image/jpeg,image/png,image/svg+xml,image/gif,image/webp,image/bmp,image/tiff"
    And the file input should reject other file types

  @upload @conversion
  Scenario: Upload SVG converts to PNG automatically
    When I upload SVG file "icon.svg"
    Then the backend should convert SVG to PNG using Svg.Skia
    And the resource should be stored as PNG
    And I should see the PNG version in the Manage panel

  @upload @conversion
  Scenario Outline: All supported formats convert to PNG
    When I upload <format> file "<filename>"
    Then the backend should convert to PNG
    And I should see the PNG image displayed

    Examples:
      | format | filename      |
      | JPEG   | photo.jpg     |
      | SVG    | vector.svg    |
      | GIF    | animated.gif  |
      | WebP   | modern.webp   |
      | BMP    | bitmap.bmp    |
      | TIFF   | scan.tiff     |
      | PNG    | already.png   |

  @upload @loading
  Scenario: Upload shows loading state
    When I select a file to upload
    Then the "Upload" button should show loading spinner
    And the "Upload" button should be disabled
    And I should not be able to upload another file yet
    When upload completes
    Then the button should re-enable

  @upload @error-handling
  Scenario: Handle upload failure
    When I upload a file that fails to process
    Then I should see error alert "Failed to upload image: [error message]"
    And the error should be displayed as Material-UI Alert
    And I should be able to dismiss the error by clicking X
    And the file input should be reset
    And I should be able to upload a different file

  # ═══════════════════════════════════════════════════════════════
  # ROLE ASSIGNMENT - KEYBOARD SHORTCUTS
  # ═══════════════════════════════════════════════════════════════

  @role-assignment @critical @happy-path
  Scenario: Assign Token role via Alt+Click
    Given I have uploaded an image
    And the image has role "None" (0)
    When I hold Alt and click the image
    Then the image role should change to "Token" (1)
    And the image should show a "Token" badge
    And the image border should be blue (primary color)
    And the collapsed Token preview should show this image

  @role-assignment @critical @happy-path
  Scenario: Assign Display role via Ctrl+Click
    Given I have uploaded an image
    And the image has role "None"
    When I hold Ctrl and click the image
    Then the image role should change to "Display" (2)
    And the image should show a "Display" badge
    And the image border should be purple (secondary color)
    And the collapsed Display preview should show this image

  @role-assignment @critical @happy-path
  Scenario: Assign both roles via Ctrl+Alt+Click
    Given I have uploaded an image
    When I hold Ctrl+Alt and click the image
    Then the image role should change to "Token,Display" (3)
    And the image should show both "Token" and "Display" badges
    And the image border should be green (success color)
    And both Token and Display previews should show this image

  @role-assignment @keyboard-shortcuts
  Scenario: Toggle Token role on and off
    Given an image has role "None" (0)
    When I Alt+Click the image
    Then role should be "Token" (1)
    When I Alt+Click again
    Then role should toggle back to "None" (0)
    And the Token badge should be removed
    And the border should be grey

  @role-assignment @keyboard-shortcuts
  Scenario: Toggle Display role on and off
    Given an image has role "None"
    When I Ctrl+Click
    Then role should be "Display" (2)
    When I Ctrl+Click again
    Then role should be "None" (0)

  @role-assignment @keyboard-shortcuts
  Scenario: Toggle both roles simultaneously
    Given an image has role "None" (0)
    When I Ctrl+Alt+Click
    Then role should be "Token,Display" (3)
    When I Ctrl+Alt+Click again
    Then role should be "None" (0)

  @role-assignment @keyboard-shortcuts @advanced
  Scenario: Build up roles incrementally
    Given an image has role "None" (0)
    When I Alt+Click to add Token
    Then role should be 1 (Token only)
    When I Ctrl+Click to add Display
    Then role should be 3 (Token | Display, bitwise OR)
    And both badges should be shown
    When I Alt+Click to remove Token
    Then role should be 2 (Display only)
    And only Display badge should remain

  @role-assignment @keyboard-shortcuts @advanced
  Scenario: Remove one role while keeping the other
    Given an image has role "Token,Display" (3)
    When I Alt+Click to toggle Token off
    Then role should be "Display" (2)
    And only Display badge should show
    When I Alt+Click again to toggle Token back on
    Then role should be "Token,Display" (3)

  @role-assignment
  Scenario: Regular click without modifiers does nothing
    Given an image has role "Token" (1)
    When I click the image without holding any keys
    Then the role should remain "Token" (1)
    And no role change should occur

  # ═══════════════════════════════════════════════════════════════
  # VISUAL FEEDBACK - BORDERS & BADGES
  # ═══════════════════════════════════════════════════════════════

  @ui @visual-feedback
  Scenario Outline: Border color changes based on role
    Given an image has role "<role>"
    Then the image border should be "<color>"

    Examples:
      | role          | color  |
      | None          | grey   |
      | Token         | blue   |
      | Display       | purple |
      | Token,Display | green  |

  @ui @visual-feedback
  Scenario Outline: Role badges display correctly
    Given an image has role "<role>"
    Then I should see badges: "<badges>"

    Examples:
      | role          | badges                      |
      | None          | (no badges)                 |
      | Token         | Token badge                 |
      | Display       | Display badge               |
      | Token,Display | Token badge + Display badge |

  @ui
  Scenario: Token badge has correct icon and styling
    Given an image has Token role
    Then the Token badge should have:
      | icon  | Videocam icon       |
      | label | "Token"             |
      | color | primary (blue)      |
      | size  | small               |

  @ui
  Scenario: Display badge has correct icon and styling
    Given an image has Display role
    Then the Display badge should have:
      | icon  | Portrait icon       |
      | label | "Display"           |
      | color | secondary (purple)  |
      | size  | small               |

  # ═══════════════════════════════════════════════════════════════
  # MANAGE PANEL - EXPAND/COLLAPSE
  # ═══════════════════════════════════════════════════════════════

  @ui @happy-path
  Scenario: Manage button toggles panel visibility
    Given the Manage panel is collapsed
    When I click the "Manage" button
    Then the panel should expand
    And I should see the "Image Library" heading
    And I should see the keyboard shortcut help text
    And I should see the grid of uploaded images
    When I click "Manage" again
    Then the panel should collapse
    And I should see Token and Display preview boxes

  @ui @critical @bug-prevention
  Scenario: Manage panel auto-expands after upload
    Given the Manage panel is collapsed
    When I upload an image
    And upload completes
    Then the Manage panel should auto-expand
    And I should see the newly uploaded image

  @ui @critical @bug-prevention
  Scenario: Manage panel auto-expands when editing asset with existing resources
    Given I am editing an asset with 2 existing images
    And entityId prop is set (indicating edit mode)
    When the component mounts
    Then useEffect should detect entityId + resources.length > 0
    And the Manage panel should auto-expand
    And I should see both existing images immediately

  @ui
  Scenario: Manage button shows expand/collapse icon
    Given the Manage panel is collapsed
    Then the Manage button should show ExpandMore icon (down arrow)
    When I expand the panel
    Then the button should show ExpandLess icon (up arrow)

  # ═══════════════════════════════════════════════════════════════
  # COLLAPSED VIEW - TOKEN & DISPLAY PREVIEWS
  # ═══════════════════════════════════════════════════════════════

  @ui @happy-path
  Scenario: Collapsed view shows Token and Display previews side-by-side
    Given the Manage panel is collapsed
    Then I should see two preview boxes in a 2-column grid
    And the left box should be labeled "Token"
    And the right box should be labeled "Display Image"
    And both boxes should be equal width (50% each)

  @ui
  Scenario: Token preview shows first image with Token role
    Given I have uploaded 3 images:
      | image   | role    |
      | img1    | Display |
      | img2    | Token   |
      | img3    | Token   |
    And the Manage panel is collapsed
    Then the Token preview should show "img2" (first Token)
    And should not show "img1" or "img3"

  @ui
  Scenario: Display preview shows first image with Display role
    Given I have 3 images with Display roles
    Then the Display preview should show the first Display image
    And should render with DisplayPreview component

  @ui
  Scenario: Token preview shows "No token" when no Token role assigned
    Given I have uploaded images but none have Token role
    Then the Token preview box should show placeholder
    And should display text "No token"

  @ui
  Scenario: Display preview shows "No display" when no Display role
    Given no images have Display role
    Then the Display preview box should show placeholder
    And should display text "No display"

  @ui
  Scenario: Image with both roles appears in both previews
    Given I have 1 image with role "Token,Display" (3)
    And the Manage panel is collapsed
    Then the Token preview should show the image
    And the Display preview should show the same image

  # ═══════════════════════════════════════════════════════════════
  # EXPANDED VIEW - IMAGE LIBRARY GRID
  # ═══════════════════════════════════════════════════════════════

  @ui @happy-path
  Scenario: Expanded view shows all images in grid
    Given I have uploaded 6 images
    And the Manage panel is expanded
    Then I should see the "Image Library" heading
    And I should see keyboard shortcut help text
    And I should see all 6 images in a responsive grid
    And each image should be in a Material-UI Card

  @ui
  Scenario: Image cards show resource images with badges
    Given an image has role "Token,Display"
    And the Manage panel is expanded
    Then the image card should show:
      | Image height  | 100px                            |
      | Border        | 2px solid green (both roles)     |
      | Badges        | Token and Display chips          |
      | Delete button | X icon in top-right corner       |

  @ui
  Scenario: Image Library grid is responsive
    Given I have 12 uploaded images
    When viewing on different screen sizes
    Then the grid should adjust columns:
      | Screen size | Columns per row |
      | xs (mobile) | 2               |
      | sm (tablet) | 3               |
      | md (desktop)| 4               |

  @ui
  Scenario: Empty Image Library shows helpful message
    Given I have no images uploaded
    And the Manage panel is expanded
    Then I should see a placeholder box with dashed border
    And I should see text "No images uploaded yet"
    And I should see text "Click 'Upload' to add images"

  @ui
  Scenario: Keyboard shortcut help text is visible
    Given the Manage panel is expanded
    Then I should see instruction text:
      """
      Set/Unset as Display: Ctrl+Click • Set/Unset as Token: Alt+Click
      """

  # ═══════════════════════════════════════════════════════════════
  # IMAGE REMOVAL
  # ═══════════════════════════════════════════════════════════════

  @removal @happy-path
  Scenario: Remove image via X button
    Given I have 3 uploaded images
    And the Manage panel is expanded
    When I click the X button on the second image
    Then the image should be removed immediately from the resources array
    And I should see 2 images remaining
    And the removal should be instant (no confirmation)

  @removal
  Scenario: Remove image updates previews
    Given I have 2 images:
      | image   | role    |
      | token   | Token   |
      | display | Display |
    And I collapse the Manage panel
    Then Token preview should show "token" and Display preview should show "display"
    When I expand the panel
    And I remove the "token" image
    And I collapse the panel
    Then the Token preview should show "No token"
    And the Display preview should still show "display"

  @removal
  Scenario: Remove all images shows empty state
    Given I have 2 uploaded images
    When I remove both images
    Then the Manage panel should show empty state
    And I should see "No images uploaded yet"

  @removal
  Scenario: X button stops event propagation
    Given an image is in the Manage panel
    When I click the X button
    Then the image should be removed
    And the click should not trigger role assignment
    And no keyboard modifiers should affect the removal

  # ═══════════════════════════════════════════════════════════════
  # MULTIPLE RESOURCE SCENARIOS
  # ═══════════════════════════════════════════════════════════════

  @multi-resource @happy-path
  Scenario: Upload 5 images with different roles
    When I upload 5 images and assign roles:
      | image   | role          |
      | img1    | Token         |
      | img2    | Display       |
      | img3    | Token,Display |
      | img4    | Token         |
      | img5    | None          |
    Then I should see 5 images in the Manage panel
    And img1 should have blue border and Token badge
    And img2 should have purple border and Display badge
    And img3 should have green border and both badges
    And img4 should have blue border and Token badge
    And img5 should have grey border and no badges

  @multi-resource
  Scenario: First image with each role shows in collapsed preview
    Given I have 5 images with mixed roles as above
    And I collapse the Manage panel
    Then the Token preview should show "img1" (first Token)
    And the Display preview should show "img2" (first Display)
    And should not show img3, img4, or img5 in previews

  @multi-resource
  Scenario: Multiple images can have the same role
    When I upload 3 images and assign all as Token
    Then all 3 should have Token role
    And all 3 should show Token badge
    And the Token preview should show the first one
    And this should be valid (no constraint against multiple Token images)

  @multi-resource @edge-case
  Scenario: Upload 20 images to single asset
    When I upload 20 images
    Then all 20 should appear in the Manage panel
    And the grid should handle overflow with scrolling
    And I should be able to assign roles to any of them

  # ═══════════════════════════════════════════════════════════════
  # READ-ONLY MODE
  # ═══════════════════════════════════════════════════════════════

  @ui @read-only
  Scenario: Read-only mode shows Token and Display previews only
    Given the component has readOnly=true prop
    And I have 5 images with mixed roles
    Then I should not see the "Upload" button
    And I should not see the "Manage" button
    And I should see only the collapsed Token and Display previews
    And the previews should be read-only (no interaction)

  @ui @read-only
  Scenario: Read-only mode when viewing asset (not editing)
    Given I open an asset in preview dialog (view mode, not edit mode)
    Then the Resource Manager should be in read-only mode
    And I should see Token and Display previews
    And I should not be able to upload, assign roles, or remove images

  # ═══════════════════════════════════════════════════════════════
  # INTEGRATION WITH CREATE/EDIT DIALOGS
  # ═══════════════════════════════════════════════════════════════

  @integration @create
  Scenario: Resource Manager in Create Dialog
    Given I am in the Asset Create Dialog
    Then the Resource Manager should be in editable mode
    And the "Upload" button should be visible
    And the Manage panel should be collapsed initially
    And entityId prop should be undefined (not editing)

  @integration @edit
  Scenario: Resource Manager in Edit Dialog
    Given I am editing an existing asset with ID "asset-123"
    Then the Resource Manager should be in editable mode
    And entityId prop should be "asset-123"
    And if resources exist, Manage panel should auto-expand

  @integration @props
  Scenario: size prop used for Token preview grid
    Given the parent passes size prop: width=2, height=2
    And I have a Token image
    Then the Token preview should render with 2×2 grid overlay
    And the grid should match the asset size

  # ═══════════════════════════════════════════════════════════════
  # STATE MANAGEMENT
  # ═══════════════════════════════════════════════════════════════

  @state @critical
  Scenario: resources prop controls displayed images
    Given the parent passes resources array:
      | resourceId | role |
      | img-1      | 1    |
      | img-2      | 2    |
    Then I should display both images
    When the parent updates resources to remove img-1
    Then I should display only img-2

  @state @critical
  Scenario: onResourcesChange callback notifies parent of changes
    When I upload a new image
    Then onResourcesChange should be called with new resources array
    When I assign a role via keyboard shortcut
    Then onResourcesChange should be called with updated roles
    When I remove an image
    Then onResourcesChange should be called with filtered array

  # ═══════════════════════════════════════════════════════════════
  # ERROR RECOVERY
  # ═══════════════════════════════════════════════════════════════

  @error-handling
  Scenario: Upload error is dismissible
    Given upload fails with error
    And I see error alert
    When I click the X on the alert
    Then the error should be dismissed
    And I should be able to upload again

  @error-handling
  Scenario: Upload error preserves existing images
    Given I have 2 images already uploaded
    When I try to upload a 3rd image that fails
    Then I should see an error
    But the existing 2 images should remain unchanged
    And their roles should be preserved

  # ═══════════════════════════════════════════════════════════════
  # ENTITY ID PROP (CREATE VS EDIT)
  # ═══════════════════════════════════════════════════════════════

  @integration
  Scenario: entityId undefined during asset creation
    Given I am creating a new asset (not editing)
    When upload completes
    Then the upload mutation should be called with entityId=undefined
    And the backend should create a new resource not linked to any asset yet

  @integration
  Scenario: entityId set during asset editing
    Given I am editing asset "asset-123"
    When upload completes
    Then the upload mutation should be called with entityId="asset-123"
    And the backend should link the resource to asset "asset-123"

  # ═══════════════════════════════════════════════════════════════
  # DATABASE & CLOUD STORAGE INTEGRATION
  # ═══════════════════════════════════════════════════════════════

  @cloud-storage @backend-integration @critical
  Scenario: Upload creates Resource in blob storage with GUID v7
    When I upload image "dragon.png"
    Then backend should generate GUID v7 resource ID
    And the PNG should be stored at blob path "images/{last4}/{guid:32}"
    And the blob should be accessible via /api/resources/{guid}/download
    And Resource table should have record with:
      | Field               | Value                      |
      | Id                  | {guid v7}                  |
      | Type                | Image                      |
      | Path                | images/{last4}/{guid:32}   |
      | Metadata.ContentType| image/png                  |
      | Metadata.FileLength | {file size in bytes}       |
      | Metadata.ImageSize  | {width}×{height}           |

  @database @backend-integration @critical
  Scenario: Saved asset creates AssetResource records with role flags
    Given I am creating asset and upload 2 images
    And I assign image-1 Token role (value: 1)
    And I assign image-2 Display role (value: 2)
    When I save the asset
    Then AssetResources table should contain 2 records:
      | AssetId | ResourceId | Role |
      | {new}   | image-1    | 1    |
      | {new}   | image-2    | 2    |
    And each Resource should exist in Media.Resources table
    And each Resource blob should exist in storage

  @database @backend-integration
  Scenario: Editing asset updates AssetResource records (INSERT/DELETE)
    Given I own asset with ID "asset-123" having resources:
      | ResourceId | Role |
      | img-1      | 1    |
      | img-2      | 2    |
    And I open in edit mode
    When I remove img-1 (DELETE)
    And I upload img-3 and assign Token role (INSERT)
    And I save the asset
    Then AssetResources table should show:
      | AssetId   | ResourceId | Role | Action  |
      | asset-123 | img-1      | -    | DELETED |
      | asset-123 | img-2      | 2    | EXISTS  |
      | asset-123 | img-3      | 1    | INSERTED|

  @cloud-storage @backend-integration
  Scenario: getResourceUrl helper generates correct blob URLs
    Given a resource with ID "018c-d5e2-70b0-7890-1234567890ab" exists
    When I call getResourceUrl(resourceId)
    Then the URL should be "/api/resources/018c-d5e2-70b0-7890-1234567890ab/download"
    And requesting this URL should return PNG image
    And Content-Type header should be "image/png"

  @cloud-storage @conversion
  Scenario: SVG conversion uses Svg.Skia and stores PNG
    When I upload SVG file "icon.svg"
    Then backend uses Svg.Skia.SvgDocument.FromSvg() to parse
    And backend renders to PNG raster image
    And PNG is stored in blob (not SVG)
    And Resource.metadata.contentType = "image/png"

  @error-handling @backend-integration
  Scenario: Upload exceeds 5MB size limit
    When I try to upload "huge-image.jpg" (8MB file)
    Then backend should reject with 413 Request Entity Too Large
    And error message should indicate "5MB limit"
    And no Resource record should be created

  # ═══════════════════════════════════════════════════════════════
  # THEME SUPPORT
  # ═══════════════════════════════════════════════════════════════

  @theme
  Scenario: Dark mode styling for Resource Manager
    Given I have dark mode enabled
    Then the Manage panel background should be dark
    And image cards should have dark backgrounds
    And placeholder boxes should have dark backgrounds
    And text should be light for readability

  @theme
  Scenario: Light mode styling for Resource Manager
    Given I have light mode enabled
    Then all backgrounds should be light
    And text should be dark

  # ═══════════════════════════════════════════════════════════════
  # ACCESSIBILITY
  # ═══════════════════════════════════════════════════════════════

  @accessibility
  Scenario: Keyboard shortcuts are documented for users
    When the Manage panel is expanded
    Then I should see clear instructions for keyboard shortcuts
    And the text should explain Ctrl+Click, Alt+Click, and Ctrl+Alt+Click
    And the instructions should be visible near the image grid

  @accessibility
  Scenario: Images have alt text
    Given I have uploaded images
    Then each image should have alt="Resource" attribute
    And images should be keyboard accessible
