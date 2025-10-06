# Generated: 2025-10-02
# Feature-level BDD for Scene Management
@feature @library @scene-management
Feature: Scene Management
  As a Game Master
  I want to manage interactive tactical maps with assets
  So that I can design complete scenes for gameplay

  Background:
    Given I am authenticated as a Game Master
    And I have an active account
    And I own an adventure named "The Dragon's Lair"

  # ═══════════════════════════════════════════════════════════════════════
  # HAPPY PATH - Scene Creation and Retrieval
  # ═══════════════════════════════════════════════════════════════════════

  @happy-path @create
  Scenario: Create scene within adventure
    Given I have prepared scene details with name "Throne Room"
    When I create the scene within "The Dragon's Lair" adventure
    Then the scene is created successfully
    And the scene is associated with the adventure
    And I can retrieve the scene by its identifier

  @happy-path @create @standalone
  Scenario: Create standalone scene without adventure
    Given I have prepared scene details with name "Random Encounter Map"
    When I create the scene without adventure association
    Then the scene is created successfully
    And the scene has no adventure association
    And I can retrieve the scene by its identifier

  @happy-path @retrieve
  Scenario: Retrieve scene with full composition
    Given I have a scene with stage configured
    And the scene has a grid configured
    And the scene has 3 assets placed
    When I retrieve the scene by its identifier
    Then I receive the scene with all properties
    And the stage configuration is included
    And the grid configuration is included
    And all 3 placed assets are included

  @happy-path @update
  Scenario: Update scene properties
    Given I have a scene named "Old Throne Room"
    When I update the scene name to "Royal Throne Room"
    And I update the scene description
    Then the scene properties are updated successfully
    And I can retrieve the scene with updated properties

  # ═══════════════════════════════════════════════════════════════════════
  # STAGE CONFIGURATION
  # ═══════════════════════════════════════════════════════════════════════

  @stage @configure
  Scenario: Configure stage with background and dimensions
    Given I have a scene without stage configuration
    And I have a background image resource
    When I configure the stage with 3000x2000 dimensions
    And I set the background image
    And I set the viewport to 1500x1000
    Then the stage is configured successfully
    And the stage dimensions are 3000x2000
    And the viewport is 1500x1000

  @stage @update
  Scenario: Update stage viewport settings
    Given I have a scene with stage configured
    When I update the stage viewport to 2000x1500
    Then the stage viewport is updated successfully
    And other stage properties remain unchanged

  @stage @validation
  Scenario: Reject invalid stage dimensions
    Given I have a scene without stage configuration
    When I attempt to configure stage with width 0
    Then the configuration is rejected
    And I receive a validation error indicating dimensions must be positive

  # ═══════════════════════════════════════════════════════════════════════
  # GRID CONFIGURATION
  # ═══════════════════════════════════════════════════════════════════════

  @grid @configure @square
  Scenario: Configure square grid
    Given I have a scene with stage configured
    When I configure a square grid with 50 pixel size
    And I set the grid offset to 0,0
    And I set the grid color to "#333333"
    Then the grid is configured successfully
    And the grid type is square
    And the grid size is 50 pixels

  @grid @configure @hexagonal
  Scenario: Configure hexagonal grid
    Given I have a scene with stage configured
    When I configure a hexagonal grid with 60 pixel size
    And I set the grid offset to 25,15
    Then the grid is configured successfully
    And the grid type is hexagonal
    And the grid displays with hexagonal pattern

  @grid @configure @isometric
  Scenario: Configure isometric grid
    Given I have a scene with stage configured
    When I configure an isometric grid with 45 pixel size
    Then the grid is configured successfully
    And the grid type is isometric
    And the grid displays with isometric perspective

  @grid @update
  Scenario: Update grid color and offset
    Given I have a scene with square grid configured
    When I update the grid color to "#666666"
    And I update the grid offset to 10,10
    Then the grid properties are updated successfully
    And the grid size remains unchanged

  # ═══════════════════════════════════════════════════════════════════════
  # ASSET PLACEMENT
  # ═══════════════════════════════════════════════════════════════════════

  @asset-placement @place
  Scenario: Place asset on scene
    Given I have a scene with stage and grid configured
    And I have an asset template named "Dragon"
    When I place the asset at position 500,300
    And I set the asset dimensions to 150x150
    And I set the asset rotation to 45 degrees
    And I set the z-index to 10
    Then the asset is placed successfully
    And the asset appears at the specified position

  @asset-placement @move
  Scenario: Move asset to new position
    Given I have a scene with an asset placed at 500,300
    When I move the asset to position 800,600
    Then the asset position is updated successfully
    And the asset appears at the new position

  @asset-placement @update
  Scenario: Update asset dimensions and rotation
    Given I have a scene with an asset placed
    When I update the asset dimensions to 200x200
    And I update the asset rotation to 90 degrees
    Then the asset properties are updated successfully
    And the asset displays with new dimensions and rotation

  @asset-placement @remove
  Scenario: Remove asset from scene
    Given I have a scene with 4 assets placed
    When I remove one asset from the scene
    Then the asset is removed successfully
    And the scene has 3 assets remaining

  @asset-placement @validation @integration
  Scenario: Reject placing non-existent asset
    Given I have a scene with stage configured
    When I attempt to place an asset with invalid asset identifier
    Then the placement is rejected
    And I receive an error indicating asset does not exist

  @asset-placement @z-index
  Scenario: Place multiple assets with layering
    Given I have a scene with stage configured
    When I place asset "Floor Tile" at 500,500 with z-index 1
    And I place asset "Table" at 520,520 with z-index 5
    And I place asset "Goblin" at 540,540 with z-index 10
    Then all assets are placed successfully
    And assets are layered by z-index

  # ═══════════════════════════════════════════════════════════════════════
  # CLONING
  # ═══════════════════════════════════════════════════════════════════════

  @clone @deep-copy
  Scenario: Clone scene with complete composition
    Given I have a scene with stage configured
    And the scene has a hexagonal grid configured
    And the scene has 5 assets placed
    When I clone the scene with name "Cloned Throne Room"
    Then the cloned scene is created successfully
    And the cloned scene has identical stage configuration
    And the cloned scene has identical grid configuration
    And the cloned scene has 5 assets placed at same positions
    And the cloned scene is independent from original

  @clone @modifications
  Scenario: Modify cloned scene independently
    Given I have cloned a scene
    When I update the cloned scene stage dimensions
    And I move an asset in the cloned scene
    Then the original scene remains unchanged
    And the cloned scene reflects the modifications

  # ═══════════════════════════════════════════════════════════════════════
  # INTEGRATION & CROSS-AREA
  # ═══════════════════════════════════════════════════════════════════════

  @integration @cross-area @media
  Scenario: Stage background references media resource
    Given I have a scene without stage
    And I have an image resource in the media library
    When I configure stage with the image resource as background
    Then the stage uses the media resource
    And the background image is displayed

  @integration @cross-area @adventure
  Scenario: Validate adventure reference
    Given I have prepared scene details
    When I create the scene with non-existent adventure identifier
    Then the creation is rejected
    And I receive an error indicating adventure does not exist

  @integration @cross-area @game-session
  Scenario: Prevent deletion of scene used in active game session
    Given I have a scene used in an active game session
    When I attempt to delete the scene
    Then the deletion is rejected
    And I receive an error indicating scene is referenced by active session

  # ═══════════════════════════════════════════════════════════════════════
  # AUTHORIZATION
  # ═══════════════════════════════════════════════════════════════════════

  @authorization @stage
  Scenario: Only owner can configure stage
    Given another user owns a scene
    When I attempt to configure the stage
    Then the operation is forbidden
    And I receive an authorization error

  @authorization @grid
  Scenario: Only owner can configure grid
    Given another user owns a scene
    When I attempt to configure the grid
    Then the operation is forbidden
    And I receive an authorization error

  @authorization @asset-placement
  Scenario: Only owner can manage scene assets
    Given another user owns a scene
    When I attempt to place an asset
    Then the operation is forbidden
    And I receive an authorization error

  @authorization @clone
  Scenario: Only owner can clone scene
    Given another user owns a scene
    When I attempt to clone the scene
    Then the operation is forbidden
    And I receive an authorization error

  @authorization @delete
  Scenario: Only owner can delete scene
    Given another user owns a scene
    When I attempt to delete the scene
    Then the operation is forbidden
    And I receive an authorization error

  # ═══════════════════════════════════════════════════════════════════════
  # EDGE CASES
  # ═══════════════════════════════════════════════════════════════════════

  @edge-case @empty-scene
  Scenario: Create scene without assets
    Given I have prepared scene details
    When I create the scene
    And I configure stage and grid
    But I do not place any assets
    Then the scene is created successfully
    And the scene has no assets

  @edge-case @many-assets
  Scenario: Clone scene with many assets
    Given I have a scene with 50 assets placed
    When I clone the scene
    Then the cloned scene has 50 assets placed
    And all asset positions are preserved

  @edge-case @grid-without-stage
  Scenario: Configure grid without stage
    Given I have a scene without stage configured
    When I attempt to configure a grid
    Then the configuration is rejected
    And I receive an error indicating stage must be configured first
