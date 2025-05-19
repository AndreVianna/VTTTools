# Phase 3 Interactive Scene Builder & Tokens

## Overview of Phase 3 Objectives

Phase 3 focuses on enabling Game Masters to visually create and edit Scenes with interactive tokens on a map. In the VTTTools project terminology, a **Scene** represents a playable scenario within an Adventure, containing a *Stage* (background map) and a collection of Assets (tokens). The goal is to build a **Scene Builder** page that provides a canvas-based editor for Scenes, allowing placement and manipulation of tokens. This aligns with the roadmap tasks to implement a canvas-supported scene editor, stage management (including grid support), and basic token placement/movement. The implementation will respect the existing project architecture and coding standards, ensuring the new features integrate seamlessly.

## Scene Builder Page Design

We will develop a new Blazor page (e.g. **SceneBuilderPage.razor** with a code-behind) under the WebApp client project for editing a Scene. This page will use the **MainLayout** but modify the navigation UI to suit editing mode. Instead of the standard global NavMenu links, the top area will host **tool menus** specific to scene editing (Stage, Tokens, etc.), while still displaying the user profile/logout controls on the right (as provided by NavMenu) for consistency. The page content will primarily be an **HTML5 Canvas** element covering most of the viewport, which will render the scene’s map background, grid overlay, and tokens. All interactions (adding tokens, moving them, drawing structures) will occur on this canvas.

* **Canvas Integration:** We will leverage Blazor’s interop if needed to handle complex canvas interactions (mouse events, drag-drop). The canvas will draw the Stage background image and the grid (if enabled) as the base layer. Above that, tokens and future structures can be drawn. We may use multiple canvas layers or a single canvas with Z-order logic; initially, a single canvas is simpler for basic tokens. The canvas size will adapt to the Stage dimensions or the available screen space, with scroll/zoom features possibly added later. User actions on the canvas (click, drag, right-click) will be handled via event listeners and translated into updates of Scene state (e.g., repositioning a token).

* **Layout and Navigation:** The SceneBuilder page will hide or override normal navigation links. We can implement a custom toolbar at the top (just below the main layout’s header) that mimics a menu bar. This could be done either by extending the NavMenu component to detect when in builder mode (showing tool menus instead of nav links), or by creating a small menu bar within the page itself. The profile, logout, etc., remain accessible on the right as per NavMenu (reusing `LogoutUri`, `ProfileUri` from the NavMenu logic for consistency). This ensures the editor page feels integrated with the app but focused on editing tools.

## Stage Menu: Background Image & Grid Settings

One top-level menu **“Stage”** will group actions related to the scene’s stage (the background map and grid). According to the data model, each Scene’s Stage has a **Source** (e.g. image URL) and a Grid configuration (type, offsets, cell size). We will implement two submenu items under Stage:

* **Change Image:** This opens a modal dialog allowing the GM to upload or select a background image for the scene. The user can choose an image file (which will be an Asset of type image). On confirmation, the file is uploaded via the Assets API (e.g. using AssetService/MediaService to store it) and a new Asset record is created if needed. The Scene’s `Stage.Source` will be updated to reference the image’s URL or asset ID. We will call the backend (perhaps via an `IAssetsClient` or directly via `ILibraryClient.UpdateSceneAsync`) to save this change (likely a PATCH to `/api/scenes/{id}` with the new Stage source). The canvas will then reload or redraw the background image to reflect the new map. This feature fulfills the need for map management in scenes (the Stage is essentially *“collection of media displayed in the background”* like images or maps).

* **Set Grid:** This opens a modal to configure the grid overlay on the map. The form will include:

  * **Grid Type:** A dropdown for grid style – *None, Square, Hex (vertical/horizontal)*, or *Isometric* – aligning with the defined `GridType` enum options.
  * **Cell Size:** Numeric inputs for grid cell width/height (for square or hex, one size could suffice; for hex or iso, we might use width/height or a single scale value). These correspond to the Stage’s Grid.CellSize properties.
  * **Offset:** Numeric inputs for X and Y offset of the grid origin (allowing the grid to be aligned with the map as needed).
  * **Snap-to-Grid:** A toggle for whether tokens should snap to the grid intersections when moved. (This may not correspond to a stored field yet; we can implement it as a UI setting initially, and later extend the model if needed.)

  When the user saves grid settings, we will update the Scene’s Stage.Grid in the backend (again via the UpdateScene API). The canvas will draw the grid overlay according to the chosen settings: for square grids, straight lines; for hex, a hexagonal pattern; etc. This covers the roadmap requirement of **grid support for maps**. Internally, the `Stage.Grid.Type`, `CellSize`, and `Offset` fields will be set so that other features (like snapping logic or distance measurement) can utilize them. By configuring grid here, we set the stage for movement rules on the map (Phase 3 also mentions measuring tools and movement, which rely on knowing grid dimensions).

The Stage menu modals will be implemented as Blazor Components (e.g., `ChangeImageModal.razor`, `GridSettingsModal.razor` with code-behind) to keep code organized. We will ensure form inputs validate properly (e.g., cell size > 0). On submission, use the injected clients/services to persist changes, and update the UI state (perhaps via a bound Scene model).

## Tokens Menu: Adding and Managing Tokens

The **“Tokens”** menu will provide tools for managing interactive assets on the stage. In VTT terminology, these tokens correspond to **Playable Assets** (characters, NPCs, monsters, etc.) that can be moved and controlled. Initially, we will set up the menu with options like **“Add Creature”** and **“Add NPC”** – which are essentially shortcuts to add different categories of tokens:

* **Add Creature:** Intended for creatures or monsters (hostile entities).
* **Add NPC:** Intended for non-player characters (neutral/friendly entities).

Each option will initiate a token placement workflow. When selected, the cursor/mode on the canvas changes to “placing token”. The user can then click on a location on the canvas (on the map) to place the new token. We will likely use a placeholder icon or prompt the user to choose an asset from their library for the token (e.g., choose an image asset representing the creature/NPC). For the initial implementation, we can use a default token image or silhouette if no specific asset is chosen, to keep things simple.

Once placed, the token becomes a **SceneAsset** entry in the Scene’s asset list. Behind the scenes, the app will call the backend **Add Scene Asset** endpoint (POST `/api/scenes/{sceneId}/assets`) to create a new SceneAsset. This will include details like the selected Asset ID (if an existing asset was used, e.g., a creature token image from the library) or uploading a new asset if needed, the token’s name/type, and the initial position (x,y coordinates). The SceneAsset model includes fields for Position, Scale, IsLocked, etc, which we will utilize. On success, the new token is added to the local Scene state and rendered on the canvas.

**Token Interaction:** Once tokens are on the canvas, the editor allows manipulating them:

* **Moving:** Tokens can be dragged with the mouse. We will implement event handlers on the canvas for mouse down/move on a token sprite. If the grid snap option is enabled, the token’s position will snap to the nearest grid cell coordinate when dropped. The token’s Position (likely in pixel or grid units) will be updated in the Scene model. We’ll call the Scene update API (e.g., a PATCH to `/api/scenes/{id}` or a specific endpoint like PUT `/api/scenes/{id}/assets`) to persist the new coordinates. Movement fulfills the requirement of *“asset placement and movement functionality”* – allowing GMs to arrange tokens freely.
* **Resizing:** We will allow tokens to be scaled (for example, to represent different size creatures or to zoom an image). A simple approach is to provide a handle or use mouse wheel while a token is selected to adjust its scale. The SceneAsset `Scale` field will reflect this. The UI can show a visual indicator of size. Changes to scale can be immediately applied to the canvas drawing, and saved via the update endpoint. (If needed, we might add a small UI element or context menu action for setting a specific size/scale value.)
* **Context Menu (Lock/Delete):** A right-click on a token will open a small context menu with actions:

  * **Lock/Unlock:** Toggling lock will set the token’s `IsLocked` flag. A locked token cannot be moved accidentally; our UI will ignore drag attempts on locked tokens or perhaps give a visual lock icon. The lock state will be saved (PATCH to update the SceneAsset or included in scene’s next save). This feature helps maintain fixed props or decided positions.
  * **Delete:** Removing a token will call the DELETE `/api/scenes/{sceneId}/assets/{assetId}/{number}` endpoint to remove that SceneAsset from the scene. The UI will then remove it from the canvas. We might prompt for confirmation to avoid accidental deletions. Deleting tokens aligns with managing the scene’s asset collection.

Under the hood, tokens are just a subset of *Assets placed on the stage for interaction*. We’ll treat “Add Creature/NPC” as potentially using different default AssetType or icons, but they ultimately create a SceneAsset entry. In the future, this Tokens menu could be extended with more categories (PCs, monsters, objects) and a library browser, but the groundwork here establishes the core functionality: selecting a token type and placing it.

## Future: Structures Menu (Walls, Doors, Windows)

We plan for an upcoming **“Structures”** menu to handle non-token map elements like walls, doors, and windows. These are considered “obstacles” or structural elements on the Stage. While full implementation will come later, the Scene Builder design will accommodate it:

* The Structures menu will allow the GM to draw line segments or shapes on the canvas representing walls, doors, windows. For example, a GM can choose “Wall” tool and draw a line on the map where a wall exists. Each structure type will be rendered in a distinctive color or style (e.g., solid lines for walls, perhaps dashed or different color for doors/windows). This gives visual cues on the map for boundaries or interactive environment elements.
* We will likely implement structures as another layer of the canvas (or a separate canvas on top for easier management). During drawing mode, mouse clicks on the canvas will start/end wall segments. We can constrain walls to snap along grid lines if grid is active (helpful for square grid maps).
* **Data Model:** Initially, we can represent structures in the front-end state (e.g., a list of wall line endpoints). Eventually, this would map to a stored representation. We might extend the Stage model to include a list of “Obstacle” or “Structure” objects (each with type, coordinates, etc.). The project definition already anticipates obstacles and even elevation in maps, so our design is aligned with those future requirements.
* The menu will likely have sub-options like “Draw Wall”, “Draw Door”, “Draw Window”. Selecting one puts the editor in drawing mode for that structure type. We will also need an eraser or delete tool for structures, and possibly properties (e.g., marking a door as open/closed later on).

By preparing the code structure now (e.g. ensuring the canvas rendering logic can handle multiple element layers and types), we make it easier to integrate structures soon. We will keep the **Structures menu** in the UI design (perhaps disabled or placeholder in Phase 3) to indicate future functionality, and outline how it will be hooked in.

## Integration with Existing Architecture and Standards

All new features will be implemented in line with VTTTools’ established architecture and coding standards. Key considerations:

* **Blazor Component Structure:** The Scene Builder page and its sub-components (modals, toolbar, etc.) will use Blazor with code-behind files for clarity. We will use dependency injection for any services/clients needed (e.g., injecting `ILibraryClient`, `IAssetsClient` into the page’s code-behind to perform API calls). This keeps code testable and consistent with the project’s DI approach (e.g., interfaces for services). UI state (the current Scene being edited, list of SceneAssets, etc.) will likely be managed in a backing class (with observable patterns or Blazor’s two-way binding for real-time updates on canvas).

* **Backend API Usage:** We will utilize existing API endpoints for scenes and assets. For example, after uploading a background image via AssetService, we set `Stage.Source` (which might be a URL or asset identifier) and call `UpdateSceneAsync` to save it. Adding or removing tokens uses the Scene Asset endpoints (as described above). If any API is missing (for instance, perhaps an endpoint to update a token’s position individually), we will either call the general `UpdateScene` or extend the API in the Library service as needed. All API calls will follow RESTful patterns and return Results as per project conventions.

* **Consistency with Data Models:** The plan does not require changes to the fundamental data schema (the Scene, Stage, SceneAsset models already cover the needed fields like Stage.Source, Grid, Position, Scale, etc.). We will ensure the front-end uses these structures correctly. For example, the canvas will interpret `Scene.Stage.Grid.Type` to decide which grid to draw, and use `SceneAsset.Position` & `Scale` for token placement. If we introduce any new property (like a snap-to-grid flag), we will do so via the established pattern (possibly adding it to the Stage’s Grid or as a client-side setting initially).

* **UI/UX Considerations:** The Scene Builder will be made intuitive by using familiar iconography and layout from typical VTT editors. The top menus (Stage, Tokens, Structures) function like a toolbar. We will ensure that modals and interactions do not block the overall app (e.g., modals can be closed, and the user can navigate away if needed via the profile/logout or a “Back to Adventure” button). Also, profile/logout remaining visible ensures the user can manage their session normally.

* **Code Style and Testing:** All new code will follow the project’s style guidelines (4-space indent, proper naming, K\&R braces, etc.). We will include XML documentation for the new public components or methods as required. For testability, core logic (such as functions to calculate grid snapping, or parsing user input for grid settings) can be placed in utility classes or the component’s code-behind and covered by unit tests. We plan to write unit tests for any non-trivial logic (e.g., converting pixel coordinates to grid coordinates, ensuring tokens don’t move when locked). The project’s test standard is rigorous (95% coverage), so we will add tests accordingly – for instance, creating a **SceneServiceTests** extension if needed to test adding/removing assets, and Blazor component tests for the SceneBuilder page behaviors (using a framework like bUnit to simulate dragging if available). This ensures our implementation not only meets functional requirements but is also reliable and maintainable.

By adhering to the project definition and roadmap, this implementation plan ensures Phase 3’s **Interactive Scenes and Tokens** features are delivered in a structured, maintainable way. The Scene Builder will empower GMs to set up Scenes with rich maps and tokens – laying the groundwork for further interactive features like fog of war and measuring tools in subsequent iterations. All development will be aligned with VTTTools’ architecture and coding best practices, resulting in a cohesive extension of the platform.

# Phase 3: Scene Builder – Implementation Checklist

## 1. 🛠️ Scaffolding & Project Setup

* [ ] **Create SceneBuilder Page**

  * [ ] Add `SceneBuilderPage.razor` and `SceneBuilderPage.razor.cs` to `WebApp.Client/Pages/Scenes/`.
  * [ ] Register route `/scenes/builder/{sceneId}` in `App.razor` or router.
  * [ ] Inject required services (`ILibraryClient`, `IAssetsClient`, etc.) into code-behind.
  * [ ] Add XML documentation to new files/classes as per code style.

* [ ] **Add Navigation to SceneBuilder**

  * [ ] Add logic to navigate to SceneBuilder from existing Scene list/detail pages (e.g. "Edit Scene" button).

* [ ] **Unit Tests: Page Setup**

  * [ ] Create unit tests to verify navigation to SceneBuilderPage and that it loads with correct Scene data (mock API).

---

## 2. 🖼️ Canvas and UI Layout

* [ ] **Add HTML5 Canvas to SceneBuilderPage**

  * [ ] Place `<canvas>` element in the page covering most viewport.
  * [ ] Set up resizing logic (canvas matches container or Stage size).
  * [ ] Wire up basic mouse event handlers (mousedown, mousemove, mouseup, contextmenu).
  * [ ] Implement canvas drawing loop (background, grid, tokens).

* [ ] **Toolbar/Menu Layout**

  * [ ] Create a top menu bar (reusing or mimicking NavMenu style).
  * [ ] Add "Stage", "Tokens", and (placeholder) "Structures" top-level menus.
  * [ ] Place profile/logout links on the right (reuse logic from NavMenu).
  * [ ] Style menu bar for visual consistency.

* [ ] **Unit Tests: UI Layout**

  * [ ] Test that canvas renders and resizes as expected.
  * [ ] Test menu bar shows correct items and profile/logout remain visible.

---

## 3. 🏞️ Stage: Background Image Management

* [ ] **"Stage" Menu & Change Image Modal**

  * [ ] Add "Stage" dropdown menu with "Change Image" sub-item.
  * [ ] Create `ChangeImageModal.razor` (Blazor component for modal dialog).
  * [ ] Add file picker to select/upload image.
  * [ ] Display current background preview.
  * [ ] Add cancel/confirm buttons.

* [ ] **Backend Integration for Background Image**

  * [ ] On confirm, upload image to server using `IAssetsClient` (or correct API).
  * [ ] Save Asset and get URL/ID.
  * [ ] Call backend to update Scene.Stage.Source with new image URL/ID.
  * [ ] Reload scene data and re-render canvas with new background.

* [ ] **Error Handling & Validation**

  * [ ] Validate file type/size.
  * [ ] Handle upload or API errors gracefully (UI feedback).

* [ ] **Unit Tests: Change Image**

  * [ ] Test image file selection and modal open/close logic.
  * [ ] Mock upload and ensure correct API calls are made.
  * [ ] Test error cases (e.g., invalid file, API failure).

---

## 4. 📐 Stage: Grid Definition & Overlay

* [ ] **"Set Grid" Modal**

  * [ ] Add "Set Grid" sub-item under "Stage" menu.
  * [ ] Create `GridSettingsModal.razor` for configuring:

    * Grid type (None, Square, Hex (V/H), Isometric)
    * Cell size (number input)
    * Offset (X/Y)
    * Snap-to-grid (toggle)

* [ ] **Grid State Management**

  * [ ] Bind modal fields to `Stage.Grid` properties.
  * [ ] Add validation for grid settings (e.g., size > 0).

* [ ] **Saving Grid Settings**

  * [ ] On modal confirm, update Scene.Stage.Grid via API.
  * [ ] Update in-memory Scene and trigger canvas redraw.

* [ ] **Drawing Grid Overlay**

  * [ ] Implement grid drawing logic for each grid type in canvas.
  * [ ] Overlay grid on background image with correct cell size and offset.
  * [ ] Visually distinguish grid lines (consider opacity or color).

* [ ] **Grid Snapping Logic**

  * [ ] Add function to convert pixel coordinates to nearest grid cell.
  * [ ] If snap enabled, place tokens according to nearest grid point.

* [ ] **Unit Tests: Grid**

  * [ ] Test modal input validation and field binding.
  * [ ] Test API call with updated grid values.
  * [ ] Write logic unit tests for grid snapping calculations.
  * [ ] Test grid overlay visually (if using bUnit or visual regression).

---

## 5. 🧩 Token Management: Add, Place, Move, Resize, Delete

* [ ] **"Tokens" Menu & Add Token Submenus**

  * [ ] Add "Tokens" top-level menu with sub-items: "Add Creature", "Add Character", "Add NPC", "Add Object".
  * [ ] Implement click handler to enter "place token" mode for selected type.

* [ ] **Token Placement**

  * [ ] On canvas click in placement mode, open asset selector modal or use default image.
  * [ ] Place new token at clicked position.
  * [ ] Call backend to add new SceneAsset to Scene (store type, position, asset reference).
  * [ ] Update Scene state and redraw tokens on canvas.

* [ ] **Token Rendering**

  * [ ] Render all tokens from SceneAssets on canvas at correct positions.
  * [ ] Display appropriate token image; fall back to placeholder if asset missing.
  * [ ] Show visual indicators (border/highlight) for selected token.

* [ ] **Move and Resize Tokens**

  * [ ] Implement mouse drag to move tokens (update position in memory and persist via API).
  * [ ] Apply grid snapping if enabled.
  * [ ] Implement resize (handle/drag or mouse wheel for scale).
  * [ ] Persist new position/scale via API.

* [ ] **Token Context Menu (Right-click)**

  * [ ] On right-click, show context menu with: "Lock/Unlock", "Delete".
  * [ ] Lock disables move/resize for the token.
  * [ ] Delete calls backend to remove token from scene and removes from UI.

* [ ] **Token Selection Logic**

  * [ ] Track which token is selected (for move/resize/context menu).
  * [ ] Deselect on clicking empty space.

* [ ] **Unit Tests: Tokens**

  * [ ] Test token addition (API call and state update).
  * [ ] Test move/resize logic and snapping.
  * [ ] Test lock/unlock disables movement.
  * [ ] Test delete logic (API and UI).
  * [ ] Test right-click context menu opens and correct actions are triggered.

---

## 6. 🏗️ Prepare for Structures Menu

* [ ] **Structures Menu Placeholder**

  * [ ] Add "Structures" top-level menu with sub-menus: "Walls", "Doors", "Windows" (disabled/placeholder).
  * [ ] Indicate (in code/comments) that these features are not yet implemented.

---

## 7. 🧪 General QA & Code Standards

* [ ] **Accessibility**

  * [ ] Ensure modals, menus, and canvas interactions are accessible via keyboard.
  * [ ] Add ARIA attributes where applicable.

* [ ] **Code Style**

  * [ ] Review new code for adherence to code style (naming, formatting, documentation).
  * [ ] Refactor duplicated or complex logic into utility classes if necessary.

* [ ] **Comprehensive Testing**

  * [ ] Achieve unit test coverage target for all new business logic (≥95%).
  * [ ] Write component/UI tests for all modals, menus, and interactions.
  * [ ] Add integration tests (if available in project) for end-to-end scene edit flow.

* [ ] **Documentation**

  * [ ] Document new public components, methods, and API changes.
  * [ ] Update README or in-code comments to reflect SceneBuilder usage and known limitations.

---

## 8. 📦 Finalization & Review

* [ ] **Peer Review**

  * [ ] Open Pull Request for feature branch.
  * [ ] Address feedback from code reviews.
  * [ ] Ensure all tests pass and no regressions are introduced.

* [ ] **Merge & Release**

  * [ ] Merge feature branch to develop/main.
  * [ ] Announce new SceneBuilder feature internally.
  * [ ] Monitor for post-merge bugs or UI issues.

---