# Implementing **Adventure Templates** CRUD API & UI

## Feature Overview and Requirements

According to the project roadmap, the **Adventure Templates CRUD** feature entails enabling full create-read-update-delete functionality for adventure templates on both the backend and front end. In practical terms, this means users (Game Masters) should be able to:

* **List** all relevant adventures (both their own and public ones).
* **Create** new adventure templates.
* **Rename/Edit** adventures (including changing visibility).
* **Delete** adventures.
* **Clone** an existing adventure template (deep-cloning all nested scenes/episodes).

Per the design specifications, the Adventures page UI should present two groups of content (owned vs public adventures) and support both a card view and list view, with filtering options. Each adventure entry needs controls for editing, cloning, and deletion. Additionally, adventures have properties like *Name*, *Description*, *Type*, and *Visibility*, as well as an optional parent Campaign that must be handled in creation/edit forms. We will implement these features in alignment with the project’s architecture and guidelines, ensuring the solution is robust, consistent, and testable.

## Backend API Implementation

**1. Define/Update Data Model:** We extend the `Adventure` domain model to include all required properties from the project definition. Currently the model has `Name` and `Visibility` (with default `Hidden`) but lacks Description, Type, and Image. We will add:

* **Description** (`string`): A longer text describing the adventure (required in design).
* **Type** (`AdventureType` enum or string): One of the suggested adventure types (e.g. *Open World*, *Dungeon Crawl*, *Survival*, etc.). Using an enum ensures only valid types are used. This field will default to a sensible value (e.g. “OpenWorld” or an “Unknown” type) if not provided.
* **ImagePath** (`string` or `Guid`): A reference to a cover image. Initially, this can be a string path/URL for simplicity. (In the future, this might link to an Asset ID once the asset upload feature is ready.)

These new fields will be added to `Adventure.cs` and configured in EF Core via the `AdventureSchemaBuilder`. For example, we’ll mark Description as required with an appropriate max length (e.g. 1024 characters) and store `AdventureType` as a string or int in the database. We then create an EF migration (e.g. **AddAdventureDescriptionAndType**) to update the schema, following the migration guidelines to keep schema changes isolated. The migration will add new columns for `Description`, `Type`, and `ImagePath` in the **Adventures** table, without affecting existing data.

**2. API Endpoints:** The backend exposes adventure CRUD operations as RESTful endpoints under the `/api/adventures` route (mapped in the Library service). We ensure all endpoints are properly defined and adhere to REST conventions:

* `GET /api/adventures` – Returns a list of adventures. We will adjust this to respect visibility rules: the service will return **owned adventures** (any visibility) plus **public** adventures owned by others. This aligns with the UI design of showing two panels (owned vs. public). (In the current implementation, `GetAdventuresAsync` returns all adventures with no filter. We will refine this so that non-owners’ hidden/private adventures are excluded, ensuring security and privacy.)
* `GET /api/adventures/{id}` – Retrieves a specific adventure by ID. This is already implemented via `AdventureHandlers.GetAdventureByIdHandler`. We will use this in the future for an adventure detail page if needed.
* `POST /api/adventures` – Creates a new adventure. The handler (`CreateAdventureHandler`) uses the posted `CreateAdventureRequest` to validate and add an adventure via the service. We will extend the request DTO to include `Description` and `Type` fields. The service (`AdventureService.CreateAdventureAsync`) is updated to validate that `Name` and `Description` are not empty (using DotNetToolbox `Ensure` or similar for contract validation per coding standards) and then save the new Adventure with default `Visibility` (probably Hidden by default, as design implies unpublished adventures start as hidden). The newly created adventure is returned with HTTP 201 Created.
* `PUT/PATCH /api/adventures/{id}` – Updates an existing adventure’s details. In the codebase, this is mapped as an HTTP PATCH (`MapPatch`), and the request type `UpdateAdventureRequest` uses optional fields (`Optional<T>`) for partial updates. Currently, the client was using PUT, so we will correct the client to use PATCH (or alternately change the mapping to PUT for consistency). Following best practices, we use PATCH semantics with `Optional` monads to only apply provided changes (e.g., only Name or Visibility if that’s all that changed). The handler calls `AdventureService.UpdateAdventureAsync(userId, id, request)` which updates the entity if the calling user is the owner. We extend this to allow updating the new fields (Description, Type, etc.) when those optional values are set. On success, HTTP 200 OK with the updated adventure is returned; if the adventure is not found or the user isn’t authorized, 404 is returned.
* `DELETE /api/adventures/{id}` – Deletes an adventure. The handler (`DeleteAdventureHandler`) calls the service to remove the adventure if the user is owner. We confirm that the service will also cascade-delete any child scenes (the EF model is configured with cascade delete on scenes). On success, we return HTTP 204 No Content (and a 404 if not found). The UI will be updated to prompt the user for confirmation, as deleting an adventure is irreversible and will also remove its scenes.
* `POST /api/adventures/{id}/clone` – Deep-clones an adventure template. This endpoint uses `CloneAdventureRequest` and returns the new adventure. The `AdventureService.CloneAdventureAsync` is already implemented to duplicate the adventure and **all nested scenes and assets**. We will ensure it also clones the new properties (copy Description, Type, etc. to the clone). The clone’s `OwnerId` becomes the current user, `TemplateId` links to the source adventure, and by default the clone inherits the original name (or we can allow an optional new name via the request). The result is returned with HTTP 201 Created. If the original adventure is not found or not accessible to the user (e.g., trying to clone someone else’s adventure without permission), the service returns null and the handler yields 404 Not Found.

All these endpoints are protected by authorization (the `/api/adventures` route requires an authenticated user). This satisfies security requirements so only logged-in users can manage adventures. Within the service, we further enforce ownership rules on modifications – e.g., only the adventure’s owner (or an admin) can update or delete it, as evidenced by the owner checks in the service methods.

Throughout the backend, we follow the project’s coding standards: using dependency injection for services (`IAdventureService` is registered and injected into handlers) to keep logic testable, using file-scoped namespaces and PascalCase naming, and returning `Result` objects or proper HTTP results without swallowing exceptions. The minimal API handlers already return appropriate result types (Ok, Created, NotFound, BadRequest) and we’ll continue to use those patterns for consistency. We will also update or add **unit tests** for any new logic (e.g., tests to verify that cloning copies all fields including Description/Type, and that update disallows empty names, etc.). This aligns with the project’s test standards which require high coverage (>95%) and covering all code paths.

Finally, we will generate or update the **OpenAPI documentation** for these endpoints (the `MapOpenApi()` call in Library `Program.cs` will include our new/updated endpoints) so that the new API capabilities are documented for clients. Versioning is not explicitly mentioned (the guideline suggests versioning APIs), but since this is a new feature in the same version, we integrate it into the existing API group.

## Frontend (Blazor UI) Implementation

On the Blazor front end, we will build out the **Adventures** management UI in the `AdventuresPage` component (and related components) to fulfill the functional requirements described in the design documents. The current `AdventuresPage.razor` already provides a basic list and forms for create/edit, which we will enhance as follows:

* **Owned vs Public Adventures:** We will present the list of adventures in two sections, as outlined in the design. The first section (or collapsible panel) will show the user’s own adventures, and the second will show *Public* adventures created by others (i.e. adventures with `Visibility = Public` that are not owned by the user). We can implement this by splitting the `State.Adventures` list after loading: for example, `State.OwnAdventures = Adventures.Where(a => a.OwnerId == currentUserId)` and `State.PublicAdventures = Adventures.Where(a => a.Visibility == Visibility.Public && a.OwnerId != currentUserId)`. The UI will then render two lists accordingly. This separation makes it clear which content the user can fully manage versus which are read-only templates from others. Initially, we will show both panels expanded by default, with an option to collapse if the list is long (the design mentions collapsible carousel panels).

* **List View vs Card View Toggle:** At the top of the Adventures page, we’ll add a toggle (e.g. a pair of buttons or a toggle switch icon) to switch between *card view* and *list view*. In **list view**, we’ll continue to use an HTML table similar to the current implementation, but we will add additional columns for *Type* and *# of Scenes* to match the design’s list format. The “Status” column will indicate Published/Hidden and Public/Private flags for the user’s own adventures (possibly by icons or text tags). In **card view**, each adventure will be rendered as a card: we will use the adventure’s image as the card header background, overlay the Name (as title) and Description (as body text) on it. Under the name, we’ll show the Type in a smaller font, and next to the Type, display the scene count (formatted as specified: e.g. *“One-Shot {Type}”* if only 1 scene, or *“{Type} ({N} scenes)”* if multiple scenes). For now, since Description and Image may be newly added fields, we’ll ensure those appear; if an adventure has no image, we can use a placeholder graphic or solid color in the card header. The card will also visually indicate the adventure’s status (perhaps a small badge for “Private” vs “Public”, and an indicator if it’s unpublished). We will reuse Bootstrap classes for cards and badges to keep styling consistent with the rest of the app. The toggle state (list or card) can be stored in the page’s state (e.g. `State.ViewMode`) and remembered per user for convenience.

* **Filter Controls:** Above the list, we will introduce filtering controls as suggested. Specifically, a dropdown to filter by Type (populated with the list of adventure types: *Open World*, *Dungeon Crawl*, etc.) and a text search box that filters by adventure Name or Description. These filters will apply to both panels (for example, filtering by type “Survival” will show only adventures of that type in either owned or public sections). We’ll implement the filtering on the client side for responsiveness: when the filter inputs change, we adjust the displayed lists (e.g. using LINQ on the loaded adventure list). Because the total number of adventures is likely limited per user, client-side filtering is acceptable; if it were large, we could consider querying the server with filter parameters, but that’s not in scope now.

* **Creating a New Adventure:** The design calls for a dedicated **Create Adventure page**, but currently we have an inline form at the top of the Adventures page. We have two possible approaches:

  * *Inline Creation:* Keep the current inline creation form but enhance it with fields for Description and Type. We would convert the simple input (Name) into a more complete form or modal that collects Name (required), Description (required), Type (choose from dropdown), and possibly an image upload. This form would be backed by a `CreateAdventureRequest` and on submission call `LibraryClient.CreateAdventureAsync` as it does now. After creation, we clear the form and insert the new adventure into the appropriate list (the handler already does this).
  * *Dedicated Page:* Alternatively, implement a separate `AdventureEditPage` that can be used for both creating and editing (the design suggests a unified create/edit view). In this approach, the “Create Adventure” button on AdventuresPage would `NavigateTo("/adventures/new")`, and the clone buttons would navigate to something like `"/adventures/new?templateId={id}"` to prefill the form with data from an existing adventure. The AdventureEditPage would present a form with all adventure fields and Save/Cancel controls as described in the design. For this implementation cycle, we may choose the inline form or a modal (to minimize navigation complexity), but we will structure the code so it’s easy to refactor into a separate page later. Given the existing pattern, we might continue with inline forms now but keep in mind the eventual navigation-based approach.

* **Editing an Adventure:** Currently, editing is done via a modal dialog on the Adventures page (“Edit” button opens the modal with Name and Visibility). We will expand this to include all fields: Name, Description, Type, and Visibility (and possibly the **Published** checkbox if we interpret “Hidden/Published” as a separate boolean). The design’s **Adventure detail page** layout (if implemented as a separate page) would show these fields in a form with a Back button and Save/Discard buttons at top. In our modal approach, we will add Description (textarea) and Type (dropdown) to the form, and possibly the Published/Public toggles if we interpret them differently from Visibility. However, since our data model currently uses `Visibility` (Hidden/Private/Public) as a combined state, we can represent this with two checkboxes in the UI: a “Published” checkbox (which if checked, means the adventure is not Hidden – we could treat it as setting Visibility to Private or Public) and a “Public” checkbox (which if checked, sets Visibility to Public; if unchecked and Published is true, that implies Private). To avoid confusion, we might simply expose Visibility as a dropdown or radio button group with the three options, as is already done in the edit modal. We will ensure any change in these fields updates the `EditInput` model and that the Save operation sends an `UpdateAdventureRequest` with only the modified fields. The handler currently always sends Name and Visibility; we will update it to also send Description and Type (wrapped in `Optional<T>` so unchanged fields won’t overwrite). After a successful save, the UI list is updated in-place (the handler already updates the local list item). If the user cancels, we simply discard changes (close the modal without saving).

* **Cloning an Adventure:** Each adventure entry has a **“Clone”** button. In the current implementation, clicking this immediately calls the API to clone the adventure with no further input. This successfully duplicates the adventure (including its Scenes) for the user, but it uses the original name and puts it in the list — potentially causing confusion or name collisions. We will improve this in one of two ways:

  * *Clone with prompt:* Change the clone button to prompt the user for a new name (and maybe target campaign) for the cloned adventure. For example, clicking “Clone” could open the same edit modal pre-populated with the adventure’s data, allowing the user to adjust the name (e.g. “Copy of \[Original Name]”) and then save as a new adventure. This would essentially reuse the create flow with initial data.
  * *Clone via Navigation:* Alternatively, as per design, make the clone button navigate to the Adventure creation page with the form prefilled. The user can then make changes and hit Create.

  Either approach gives the user a chance to change at least the name or other fields of the copy. For this implementation, a simpler solution is to reuse the existing modal form: when “Clone” is clicked, we set the Create form’s fields to the source adventure’s values (perhaps append “(Copy)” to the name) and then call the CreateAdventure API. This results in a new adventure appearing in the list. We will also update the `CloneAdventure` handler to handle errors – currently it doesn’t check `result.IsSuccessful`, which we will fix (similar to how scene cloning is handled). The deep clone itself is handled server-side (using the Cloner to copy scenes, stage, etc.), so from the UI perspective it will just get the new `Adventure` object back and add it to the list. We will write a UI test to ensure clicking clone indeed creates a new adventure with expected properties (same scenes count, etc.).

* **Navigating to Scenes (Episodes):** The Adventures list has a “Scenes” button for each adventure that navigates to `/adventures/{id}/scenes`. This is essentially the Episodes management page for that adventure. We will keep this navigation, but we’ll also integrate it with the new Adventure detail page concept. For example, if we implement the unified Adventure page, after creating or editing an adventure, that page itself could list the scenes (as described in the design). In the interim, the separate ScenesPage works: it lists scenes, allows creating/cloning/deleting scenes for the adventure, etc. We will ensure that from the Adventure detail interface there is a way to get “into” the scenes. The design suggests listing scenes at the bottom of the Adventure page with their own actions, including a “create scene” and “clone scene” that navigate to a Scene creation page. We might not fully integrate that in this iteration, but we add a placeholder “Manage Scenes” or “View Scenes” link (which is basically the existing Scenes button). This will satisfy the requirement that the user can navigate from an adventure to its episodes.

* **UI Styling and Feedback:** We maintain a consistent UX per the project’s guidelines. We already have a loading spinner while data is fetching – that remains. We will display validation errors from the API: for example, if the user tries to create or save an adventure with a duplicate name or missing fields, the backend `Result.Errors` are propagated and shown via `<ValidationSummary>` on the form (the handlers already populate `State.CreateInput.Errors` or `EditInput.Errors` on failure). We continue to use data annotation attributes (e.g. `[Required]`) on the input models for immediate validation (Name is already marked required). For delete confirmation, we’ll add a modal dialog to confirm deletion, including a note that deleting will also remove all its scenes and cannot be undone. The “Start” button mentioned in the design (to launch a game session from an adventure) will be added as a disabled placeholder on each adventure row – for now it does nothing, but placing it in the UI ensures we don’t have to redesign later.

All front-end changes will follow the established Blazor patterns: we keep code-behind logic in the `.razor.cs/.handler.cs` files and UI markup in `.razor` files. We inject required services (like `ILibraryClient`) into the page via `[Inject]` in the code-behind, consistent with the guideline to use DI in UI components as well. The state is managed in the `AdventuresPageState` class and updated via the handler methods to ensure a clean separation of concerns (UI vs logic). This approach makes it straightforward to write unit tests for the page logic – for instance, `AdventuresPageHandlerTests` can substitute a fake `ILibraryClient` and verify that calling `SaveEditedAdventure` sends the right request and updates state correctly. We will extend those tests to cover new behaviors (like ensuring the clone workflow populates the CreateInput or that filtering logic yields expected results given a state).

## Quality Assurance and Consistency

Throughout the implementation, we will **adhere strictly to the project’s coding and architectural guidelines**. Some key practices we’ll follow include:

* **Code Style:** Use 4-space indentation, K\&R braces, meaningful naming (PascalCase for public members, camelCase for locals), and add XML documentation for any new public API or complex logic. We’ll keep logic concise and utilize C# 9+ features (e.g., target-typed `new`, pattern matching) where they improve readability. The new enum `AdventureType` will have clear named values and we’ll include tests to cover all enum values.

* **Architecture:** Maintain the layered architecture – no business logic in the Razor components, and no direct data access in the service without going through the storage interface. The separation between the WebApp (Blazor UI) and Library (API service) remains clean. We register new services or options in DI as needed (for example, if we introduce a new `AdventureTypeService` or similar, we’d add it in `Library/Program.AddServices()`). We also ensure the *Optional* pattern for partial updates is used correctly (so that PATCH requests don’t unintentionally null out fields).

* **Testing:** We will update unit tests and add new ones to cover the added functionality. For instance, we’ll expand `AdventureServiceTests` to verify that creating an adventure fails on empty name/description, cloning copies all nested data including stage and assets, and updating an adventure changes only the intended fields. We’ll also write tests for the new UI behaviors: filtering logic (given some Adventures in state, the filtered lists have the right elements), toggle between card/list view (state changes accordingly), and that the new fields are properly shown and edited in the UI (this can be done in bUnit or through the existing Page tests). The project demands **>95% branch coverage**, so every new code path (like the clone-with-name prompt, or an invalid input case) should be exercised by tests. We continue to use xUnit + AwesomeAssertions/NSubstitute as in the rest of the project.

* **Documentation and Maintainability:** We’ll update the **ROADMAP.md** or project documentation if needed to mark this item as completed and possibly note any deviations. The code will be written with future phases in mind – for example, the filtering by Type implemented now will also benefit the Campaign/Epic listing in the future, since Type is a common concept. We keep class and method responsibilities single-purpose to ease future extension (e.g., if later on adventures can be “published” separately from Visibility, we can easily add a Published flag without breaking the Visibility logic).

By implementing the Adventure Templates CRUD feature with the above approach, we satisfy the roadmap objectives and lay a solid groundwork for the subsequent features like Episode (Scene) templates and Asset management. The Adventures content management will be fully functional: users can create adventures, organize their story content, and share or clone templates as needed, all through a consistent and user-friendly interface. We achieve this while following the project’s architectural vision and quality standards, ensuring the new code integrates seamlessly into the existing **VTT Tools** system.

---

# ✅ Adventure Templates CRUD – Task Checklist

---

## 🛠️ 1. Domain Model Updates (Backend Prerequisite)

* [ ] **Open** `Adventure.cs` in `VttTools.Domain.Model.Adventures`.
* [ ] **Remove**: `Visibility Visibility`
* [ ] **Add** the following properties:
  * `string Description`
  * `AdventureType Type` (create the enum if needed)
  * `string? ImagePath` (nullable for now)
  * `bool AdventuresHandler`
  * `bool IsPublic`
* [ ] **Create new enum** `AdventureType.cs` with values from PROJECT\_DEFINITION (e.g., `OpenWorld`, `DungeonCrawl`, `Mystery`, etc.).
  * Make sure the enum has the proper display text values
* [ ] **Add XML documentation** wherever is missing.

---

## 🗃️ 2. EF Core Configuration

* [ ] **Open** `AdventureSchemaBuilder.cs`.
* [ ] **Remove** fields:
  * `Visibility`: required, max length (e.g., 1024).
* [ ] **Configure** new fields:
  * `Description`: required, max length (e.g., 1024).
  * `Type`: map enum as string or int.
  * `ImagePath`: optional.
  * `AdventuresHandler`
  * `IsPublic`
* [ ] **Generate migration**:
  * Name it `UpdateAdventureSchema`.
* [ ] **Apply the migration** locally and verify database updates.
* [ ] **Write unit test** to verify new Adventure can be saved/loaded with all new fields (in `AdventureStorageTests`).

---

## 🌐 3. Update DTOs (Request/Response Models)

* [ ] **Open** `CreateAdventureRequest.cs`.
  * [ ] Add: `string Description`, `AdventureType Type`.
  * [ ] Validate with `[Required]` and `[MaxLength]` if applicable.
* [ ] **Open** `UpdateAdventureRequest.cs`.
  * [ ] Add: `Optional<string> Description`, `Optional<AdventureType> Type`, `Optional<string?> ImagePath`, `Optional<bool> AdventuresHandler`, `Optional<bool> IsPublic`.
* [ ] **Open** `CreateAdventureData.cs`.
  * [ ] Add: `string Description`, `AdventureType Type`.
  * [ ] Update the Validate method.
* [ ] **Open** `UpdateAdventureData.cs`.
  * [ ] Add: `Optional<string> Description`, `Optional<AdventureType> Type`, `Optional<string?> ImagePath`, `Optional<bool> AdventuresHandler`, `Optional<bool> IsPublic`.
  * [ ] Update the Validate method.
* [ ] **Update `AdventuresInputModel.cs` and `AdventuresListItem.cs`** to include new fields so frontend sees them.
* [ ] **Run tests** for serialization if any exist.

---

## 🧠 4. AdventureService Logic Updates

* [ ] **Open** `AdventureService.cs`.
* [ ] In `CreateAdventureAsync`:
  * [ ] Ensure new fields are validated and stored.
* [ ] In `UpdateAdventureAsync`:
  * [ ] Apply optional updates for Description, Type, ImagePath.
* [ ] In `CloneAdventureAsync`:
  * [ ] Ensure new fields are cloned from source to copy.
* [ ] In `GetAdventuresAsync`:
  * [ ] Filter:
    * Owned = Show all adventures: public, private, hidden and visible.
    * Public = Only others’ with that are public and visible.
* [ ] **Write or update unit tests** in `AdventureServiceTests`:
  * [ ] Test create with new fields.
  * [ ] Test update each new field individually.
  * [ ] Test clone copies new fields.
  * [ ] Test GetAdventures applies visibility/ownership filter.

---

## 🔗 5. API Endpoint Adjustments

* [ ] **Update** `/api/adventures` handlers in `AdventureHandlers.cs`:
  * [ ] Ensure PATCH handles all new fields (test optional inputs).
  * [ ] Ensure POST includes and validates new fields.
* [ ] **Update clone endpoint**: `/api/adventures/{id}/clone`:
  * [ ] Confirm new fields are in the returned AdventureDto.
* [ ] **Write integration tests** for:
  * [ ] POST (create, with all fields).
  * [ ] POST (clone, with changes on each field).
  * [ ] PATCH (update each field).
  * [ ] GET (list including filters and single).
  * [ ] DELETE.

---

## 📄 6. OpenAPI & Documentation

* [ ] **Ensure** `MapOpenApi()` includes new properties in schemas.
* [ ] **Update Swagger doc comments** where relevant.
* [ ] **Run the app** and check `/swagger` to validate API visibility.

---

## 🎨 7. Frontend Model & Client Sync

* [ ] **Open** `AdventureListItem.cs` in `VttTools.WebApp.Pages.Library.Adventures.Models`:
  * [ ] Add or confirm: `string Description`, `AdventureType Type`, `string? ImagePath`, `bool IsVisible`, `bool IsPublic`
* [ ] **Open** `AdventureInputModel.cs` in `VttTools.WebApp.Pages.Library.Adventures.Models`:
  * [ ] Add or confirm: `string Description`, `AdventureType Type`, `string? ImagePath`, `bool IsVisible`, `bool IsPublic`
* [ ] **Update** `CreateAdventureRequest.cs` & `UpdateAdventureRequest.cs` in `VttTools.Library.Adventures.ApiContracts` in project `VttTools.Domain`:
* [ ] **Update** `CreateAdventureData.cs` & `UpdateAdventureData.cs` in `VttTools.Library.Adventures.ServiceContracts` in project `VttTools.Domain`:
  * [ ] Sync with backend definitions
  * [ ] Use `Optional<T>` in update request
* [ ] **Open** or **Create** `AdventureType.cs` in `VttTools.WebApp.Pages.Library.Adventures.Models`:
  * [ ] Enum values: `OpenWorld`, `DungeonCrawl`, `Mystery`, etc. matching backend
* [ ] **If applicable**, verify the mappings defined in the code

---

## 🔧 8. Blazor Page State & Handler (`AdventuresPage`)

* [ ] **Open** `AdventuresPageState.cs`:
  * [ ] Add:
    * `List<AdventureDto> OwnedAdventures`
    * `List<AdventureDto> PublicAdventures`
    * `string? SearchText`
    * `AdventureType? FilterType`
    * `ViewModeEnum ViewMode { List, Card }`
* [ ] **Open** `AdventuresHandler.cs`:
  * [ ] In `LoadAdventuresAsync`:
    * Load all adventures
    * Split into Owned and Public:
      * Owned: `adventure.OwnerId == currentUserId`
      * Public: `IsVisible && IsPublic && OwnerId != currentUserId`
  * [ ] In `ApplyFilters()`:
    * Apply search and type filtering
  * [ ] In `CreateAdventureAsync()`:
    * Use new fields
    * Refresh state after creation
  * [ ] In `SaveEditedAdventureAsync()`:
    * Use `Optional` values for PATCH
  * [ ] In `CloneAdventureAsync()`:
    * Optionally prompt user or navigate to clone page
* [ ] **Write unit tests** for:
  * [ ] Owned vs public separation
  * [ ] Filtering logic
  * [ ] Clone and save flow

---

## 🔧 8. Blazor Page State & Handler

* [ ] **Open** `AdventuresPageState.cs`:
  * [ ] Add fields to track view mode (Card/List), filters (Type, Search).
  * [ ] Add state for filtering, clone input, and modal editing.
  * [ ] Remove the input properties (CreateInput and EditInput) and the IsEditing flag since these operations in be handle by the AdventurePage.
* [ ] **Open** `AdventuresHandler.cs`:
  * [ ] Update `LoadAdventuresAsync` to:
    * Separate owned vs public.
    * Store for dual rendering.
  * [ ] Update `CreateAdventureAsync` to:
    * Include new fields.
    * Reset form after success.
  * [ ] Update `SaveEditedAdventureAsync`:
    * Send PATCH with only modified values.
  * [ ] Update `CloneAdventureAsync`:
    * Optional: prompt for name.
  * [ ] Add `ApplyFilters()` method.
* [ ] **Write handler unit tests** for:
  * [ ] Filtering.
  * [ ] Clone.
  * [ ] Field updates.

---


## 🧑‍🎨 9. Blazor Page UI (`AdventuresPage.razor`)

* [ ] **Page layout**
  * [ ] Two sections: Owned Adventures, Public Adventures
  * [ ] Buttons to toggle between Card/List view
* [ ] **Filters**
  * [ ] Search box (Name/Description)
  * [ ] Dropdown for `AdventureType`
* [ ] **List View (table)**
  * [ ] Columns:
    * Name
    * Type
    * Scene count
    * Published / Public badges
    * Action buttons
* [ ] **Card View**
  * [ ] Display:
    * Name, Description, Type
    * Image as header
    * Badges: `Draft`, `Published`, `Shared`
    * Scene count if available
* [ ] **Create Button**
  * [ ] Top-level button: "Create Adventure" → `/adventure/create`
* [ ] **Actions per adventure (in both views)**
  * [ ] View → `/adventure/view/{id}`
  * [ ] Edit → `/adventure/edit/{id}`
  * [ ] Clone → `/adventure/clone/{id}`
  * [ ] Delete (with modal dialog for confirmation)

---

## 📄 10. New Adventure Page (`AdventurePage.razor` + `.razor.cs`)

### 10.1 File & Routing

* [ ] Create `Pages/AdventurePage.razor` and `AdventurePage.razor.cs`
* [ ] Add route:

  ```razor
  @page "/adventure/{action}/{Id?:guid}"
  ```

### 10.2 Page Parameters & Mode Detection

* [ ] define the `AdventurePageState.cs` in the Models folder to handle page states:
* [ ] define the `Input` property in the AdventurePageState as AdventureInputModel:
  * Do not mix the state of the page with the data from the AdventureInputModel
* [ ] In `OnInitializedAsync()`:
  * [ ] If `Id` is set and the action is View:
    * Load adventure in a read-only state.
  * [ ] If `Id` is set and the action is Edit:
    * Load adventure via `ILibraryClient`, set `AdventuresHandler = false`
  * [ ] If `Id` is set and the action is Clone:
    * Load adventure, prepare from with the date of the load adventure, append “(Copy)” to name, set `IsVisible = false`, set `IsPublic = false
    * The Clone action only differs from the Create action in the sense that the fields are loaded with the data of the original adventure
  * [ ] Else (the action should be Create):
    * Prepare empty form with defaults

---

### 10.3 Form & UI (`AdventurePage.razor`)

* [ ] Display page title based on mode: Create, Edit, or Clone.
  * for View action only show `Adventure`
* [ ] Fields:
  * Name (required)
  * Adventure Type (dropdown)
  * Description (required)
  * Image URL (optional for now)
  * `IsVisible` (checkbox)
  * `IsPublic` (checkbox with tooltip)
* [ ] Buttons:
  * In View Mode:
    * Edit -> `/adventure/edit/id` (Edit action)
    * Clone -> `/adventure/clone/id` (Clone action)
    * Delete -> show modal dialog with warning, if confirmed, delete and go back to `/adventures`
    * Return to List -> go back to `/adventures`
  * In Edit/Clone/Create Mode:
    * Save & Continue -> if save is successful reload the page in Edit Mode
    * Save & Finish -> if save is successful save changes and:
      * If the navigation came from the list go back to `/adventures`
      * If the navigation came from View go back to `/adventure/view/id`
    * Discard Changes -> show modal dialog with warning, if confirmed, reset the form to the original values.
    * Cancel -> show modal dialog with warning, if confirmed.
      * If the navigation came from the list go back to `/adventures` without saving
      * If the navigation came from View go back to `/adventure/view/id` without saving
* [ ] Read-only list of scenes (It will always be empty for now.)

---

### 10.4 Save Logic

* [ ] On Save:
  * [ ] Show validation errors
  * [ ] If new or cloned: call `CreateAdventureAsync`
  * [ ] If existing: call `UpdateAdventureAsync` with only changed fields

---

## 🔄 11. Navigation Flow Between Pages

* [ ] From `AdventuresPage.razor`:
  * [ ] "Create Adventure" → `/adventure/create`
  * [ ] "View" → `/adventure/view/{id}`
  * [ ] "Edit" → `/adventure/edit/{id}`
  * [ ] "Clone" → `/adventures/clone/{id}`
* [ ] From `AdventurePage.razor`:
  * [ ] After Save → redirect to `/adventures`

---

## 🧪 12. UI Testing

* [ ] **Test navigation paths:**
  * List → Create
  * List → View
  * List → Edit
  * List → Clone
  * List → Delete confirmation modal
  * Create → Create (Save failed with error messages)
  * Create → Edit (Save and continue with successful save)
  * Create → Discard confirmation modal
  * Create → Cancel confirmation modal
  * Create -> List (go back after successful save or cancel)
  * View → List
  * View → Edit
  * View → Clone
  * View → Delete confirmation modal
  * Edit → Edit (Save failed with error messages)
  * Edit → Edit (continue after successful save)
  * Edit → Discard confirmation modal
  * Edit → Cancel confirmation modal
  * Edit -> List (go back after successful save or cancel)
  * Edit -> View (go back after successful save or cancel)
  * Clone → Clone (Save failed with error messages)
  * Clone → Edit (Save and continue with successful save)
  * Clone → Discard confirmation modal
  * Clone → Cancel confirmation modal
  * Clone -> List (go back after successful save or cancel)
  * Clone -> View (go back after successful save or cancel)
* [ ] **Test `AdventurePage` behavior:**
  * Prefill fields when editing or cloning
  * Create new adventure from form with only default values
  * Form validation triggers properly
* [ ] **bUnit / integration test coverage:**
  * Mode detection
  * Save path triggers correct backend call
  * Proper form state for each mode (create/edit/clone)

