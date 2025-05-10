# VTT Tools Project Definition

This document outlines main concepts in the VTT Tools project.

## Project Objective

This project creates a Virtual Table Top (VTT) RPG Game interface for online play. It provides tools to help Dungeon Masters (DMs) and players set up and play tabletop role-playing games online, including maps, assets, dice rolling, and chat functionality.

## Entities Organization Hierarchy

All items in the hierarchy below and the assets have:

* Name
* Owner
  * The owner and the administraro can transfer the ownership
* Visibility (Hidden, Private, or Public)
  * Hidden: Only the owner and administrators can see this item.
  * Private: Owner, participants, and administrators can see this item, but only owner/admin can include it in a meeting.
  * Public: All users can see and use this item; only owner/admin can edit.

### 1. Epic

* Owns a collection of Campaigns (non-reusable, one-to-many) that define a large narrative arc
* Epics span whole worlds or continents
* Campaigns within an Epic can be independent but occur within the same context
* Campaigns may reference each other within the Epic's framework

### 2. Campaign

* Owns a collection of Adventures (non-reusable, one-to-many) forming a cohesive story arc
* Can be stand-alone (Epic not required)
* Typically involves a consistent group of adventurers
* Includes both main storylines and side quests that contribute to the overall narrative

### 3. Adventure

* Properties:
  
  * Belongs to a campaign (not required)
  * It can be Draft (default) or Published
  * It can be Private (default) or Public
  * Name (required)
  * Type (see list of suggested types bellow)
  * Image (A background image to illustrate the adventure and be used as a theme and/or background)
  * Descriptions (required)
  * A collection of Scenes
  * Must have at least one Scene

* UI:
  
  * List (Adventures Page):   
    
    * The full list has 2 vertical collapsible panels (carroucel) with the first showing the owned adventures and the second the public published ones.
    * The collection of adventures on each panel can be shown as cards or a list (the choice is a toggle near the page header).
    * When shown as a card:
      * use the adventure image as a backgroud of the header of the card with the adventure name and the description of the adventure in the body.
      * The Published/Hidden and Public/Private states are shown and flags only in owned adventures.
      * The type is shown as a smaller text under the name.
      * Show the number of scenes beside the type. If only there is only one scene prepend the word "one-shot". If more that one show the number folloed by the word "scenes" between parentesis. Examples: "One-Shot Survival", "Goal Driven (3  scenes)""
    * When shown as list
      * Do not display the image.
      * The Published/Hidden and Public/Private states are shown and flags sharing the same column named Status also only in owned adventures.
      * The type is shown as column.
      * The number of scenes is shown as column.
    * The adventures can be also filtered by Type and a text that searches in the Name in the Description.
    * You can create a new adventure or clone a existing one.
    * There is a single create button on the top (near the page header) that navigates to the Create Adventure page.
    * Each card/row has a clone button that navigates to the Create Adventure page prefilled with the data of the original adventure.
    * The name of the adventure is a link to the edit/view page.
    * Each card/row has a button that says "Start", add this button now as a placeholder. We will add its functionality later.
  
  * Create/View/Edit (Adventure Page):
    
    * There is no read-only view page. The details page show be able to be used to create, edit, and view the Adventure.
    * On the top of the page there is a Back button, a Save Changes button, and a Discard Changes button.
      * The Back button returns to the list of Adventures.
        * if there are changes the in the scene a modal dialog must be shown saying that any not saved changes will be lost. With 3 buttons, "continue without saving", "save & continue", and "cancel".
        * Otherwise just navigate without an alert.
      * The Save Changes updates the Scene applying the changes in the form.
        * This button is disabled if there is no changes. And becomes enabled when a change is detected.
      * The Discard Changes reverts the Scene to the state when the page was loaded.
        * This button is disabled if there is no changes. And becomes enabled when a change is detected.
    * The name is the header of the page but also a simple input text.
    * In the top as a banner you should be able to see the image and upload a new image to replace it.
    * The parent campaing is a dropdownlist with a Empty option (because the parent campaign is optional)
    * The type is a dropdown list in the same row of the name. (The name field occupies most of the row.)
    * The description is a text area.
    * The Hidden/Published is a check box labeled Published
    * The Private/Public is a check box labeled Public.
    * The list of scenes are shown as follows:
      * List of scenes shows only the scenes that belongs to that adventure.
      * The list has an action column in the beginning.
        * The header of the action column has a create button that navigates to Create Scene page
        * Each row the action column has a clone button that navigates to Create Scene page with a copy of the scene in that row.
        * In both cases, if there are changes the in the scene a modal dialog must be shown saying that any not saved changes will be lost. With 3 buttons, "continue without saving", "save & continue", and "cancel".
      * Each row has the name of the scene with a link to the view/edit scene.
      * Each row has a coluns with the scene flas named Status (similar to the adventure).
    * Near the end of the Adventure page there is a danger section with a red delete button.
    * That button should show an danger message box asking to confirm the deletion, reminding the user that he can unpublish the adventure to hide it instead of delete and that if deleted all the scenes will also be deleted and that the operation cannot be reverted.
    
    

* Notes:
  
  * An Adventure with only one Scene is called "One-shot"
  * Can be of various types:
    * Open World
    * Dungeon Crawl
    * Hack-n-Slash
    * Survival
    * Goal Driven
    * Randomly Generated

### 4. Scene

* Owns one Stage
* Has a collection of Assets (highly reusable, many-to-many)
* Must belong to an Adventure
* No explicit connections between Scenes in the model
* The GM selects the next Scene from the list of available Scenes in the Adventure
* Various types:
  * Combat
  * Exploration
  * Social
  * Travel
  * Chase
  * Puzzles
  * Escape
  * Challenges
* During Scenes, adventurers interact with monsters, NPCs, environments, and make decisions (see **'Assets'** below)

## Templates and Instances

* When a user creates an Epic, Campaign, Adventure, or Scene, they are creating a template
* An scene instance can be created whwn the meeting creation or previously to allow the DM to make adjustments.
* When a GM starts a meeting, they either:
  * Create a new scene instance based on a template (cloning),
  * Select a previously created instance (if the scene instance was created before the meeting),
  * Create the meeting as a follow-up and resume the previous instance,
* Instances are playable, Templates are not.
* Instances only change during playtime and those changes must be persisted (saved) because the scene can be resumed on a later meeting
* Templates only change outside of playtime and can never be selected for playing. Selecting an template for a meeting creates an instance of it.
* API endpoints will support explicit cloning of templates:
  - POST /api/scenes/{id}/clone to duplicate an Scene template
  - POST /api/adventures/{id}/clone to deep‑clone an Adventure template (including nested Scenes, Stage data, and SceneAssets)
* Scene templates can also be cloned to create playable instances when starting a meeting; Adventure templates cannot be directly used as playable instances
* This allows reuse of content (templates) while preserving the unique state of each playthrough

## Meeting Concept

A Meeting represents a real-life play period and functions similar to a calendar meeting:

### Game-related properties:

* Must be associated with an Scene instance
* When creating a meeting select first the adventure and then the scene.
* Contains player assignments to playable assets
* The meeting captures the chat, events that happened during the playtime.

### Calendar-like properties:

* Can be pre-scheduled for a specific date and time
* Can be repeatable (e.g., weekly, bi-weekly, monthly)
* Has a defined duration
* Can be created on-the-fly for impromptu play sessions
* Can be cancelled or rescheduled
* Has participants (players and GM)
* Can request RSVPs from potential participants
* Can send reminders to participants
* Can have notes or agenda items

Meetings serve as the organizational unit for actual gameplay sessions, bridging the gap between the game world and real-world scheduling.

## Chat Interaction

The primary interaction method for meeting participants is through a text-based chat system. Voice and video capabilities may be added in future versions.

### Message Types:

1. **Normal Messages**
   
   * Standard text communication visible to all participants

2. **Whispers**
   
   * Private messages between specific participants
   * Can be between GM and player, or player to player

3. **Language-Specific Messages**
   
   * Messages sent in a specific in-game language
   * Only players controlling assets that understand the language see the message in clear text
   * Others see jumbled characters to represent an unknown language

4. **Simple Dice Rolls**
   
   * Basic dice rolling notation (e.g., 1d20, 3d6+5)
   * Shows the roll results to all participants

5. **Action Results**
   
   * Formatted results of dice rolls with titles/labels
   * Often includes success/failure indication
   * May show calculation details

6. **Images/GIFs**
   
   * Sharing static images or animated GIFs
   * No video support in initial implementation

7. **Sound Effects**
   
   * Triggers audio playback for all or selected participants

8. **Slash Commands**
   
   * Special commands prefixed with "/" to trigger system actions
   * Command list to be defined separately

9. **Creature Stat Blocks / Rule Descriptions**
   
   * Formatted displays of game statistics or rule references
   * May include clickable elements for further interaction

Additional message types may be implemented in future versions as needed.

## Player and Character Relationship

* Players own characters
* During a meeting, players are assigned to characters
* By default, players control characters they own
* Players can be assigned to characters owned by other players
* Players are assigned to playable assets during meetings
* Asset assignments can be pre-set at the Adventure instance level
* The GM can change asset assignments at any time during play

## The Stage

The stage is the place where the interections happens.

* Has a MapType (None, Square, HexV, HexH, Isometric)
* Has a Source (string)
* Owns a Size (Required), that
  * Has a With (double), and
  * Has a Heigh (double)
* Owns a Grid (Optional), that
  * Owns a Position, that
    * Has a Let (double), and
    * Has a Top (double)
  * Owns a Cell, that
    * Has a With (double), and
    * Has a Heigh (double)

## The Assets

Assets fall into two main categories:

### 1. Playable Assets (Tokens)

* Interactive elements that can be controlled by players or the GM
* Examples:
  * Characters
  * NPCs
  * Monsters
  * Other creatures

### 2. Static Assets (Placeholders)

* Non-interactive elements that provide visual or audio enhancements
* Examples:
  * Objects
  * Overlays
  * PIP (Picture-in-Picture) Videos
  * Localized Sound Effects
  * Users can upload asset files (images, audio) via the UI; stored on the local filesystem in Development and in Azure Blob Storage in Production (connection info in User Secrets, using Aspire blob integration), and referenced by URL in the Source property
* Additional metadata for assets (e.g., tags, descriptions) can be added as requirements evolve

## Notes System

* Each player can have their own Notes about Epics, Campaigns, Adventures, and Scenes
* Only the creator/owner of a Note can edit or delete it
* Notes have three visibility levels:
  * Private: Only the owner/creator can read it
  * Confidential: The owner and the DM can read it, but only the owner can edit it
  * Public: All players can read it, but only the owner can edit it

## Scene Components

Scenes consist of three primary components:

### 1. Stage

* Collection of media displayed in the background
* Can include images, videos, and maps

### 2. Sound-track

* Collection of audio elements:
  * Music
  * Dialog
  * Sound effects
  * Ambient sounds

### 3. Assets

* Elements placed on the stage for interaction
* Can be either Playable Assets or Static Assets

## Maps as Special Media

Maps are a specialized type of image with additional properties:

* Grid system for movement and positioning
* Obstacles (walls, doors, windows)
* Elevation information
* Visibility settings
* Fog-of-war functionality

## Development Status (Paused)

This section summarizes implemented features and pending work at the pause point.

### Completed

- Core Infrastructure and Meeting Management (Phase 1)
- Basic Game Content Management (Phase 2):
  - Adventure Templates CRUD API & UI
  - Scene Templates CRUD API & UI (with clone endpoint)
  - Asset Templates CRUD API & UI

### Pending Phase 2 Tasks

- Support file uploads to blob storage for assets
- Implement adventure template cloning endpoint (POST /api/adventures/{id}/clone)
- Transfer ownership functionality for Adventures, Scenes, and Assets

### Next Steps

- Complete remaining Phase 2 tasks above
- Begin Phase 3: Interactive Scenes and Tokens
  - Canvas-based scene editor
  - Scene stage management and storage
  - Token placement and movement
  - Fog of war and visibility systems
  - Measuring tools

Development will resume here when the app is restarted.
