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

* Has a collection of Episodes (reusable, many-to-many)
* Can be stand-alone (Campaign not required)
* Must have at least one Episode
* An Adventure with only one Episode is called "One-shot"
* Can be of various types:
  * Open-World
  * Dungeon-Crawl
  * Hack-And-Slash
  * Survival
  * Goal-Driven
  * Randomly-Generated

### 4. Episode

* Owns one Stage
* Has a collection of Assets (highly reusable, many-to-many)
* Must belong to an Adventure
* No explicit connections between Episodes in the model
* The GM selects the next Episode from the list of available Episodes in the Adventure
* Various types:
  * Combat
  * Exploration
  * Social
  * Travel
  * Chase
  * Puzzles
  * Escape
  * Challenges
* During Episodes, adventurers interact with monsters, NPCs, environments, and make decisions (see **'Assets'** below)

## Templates and Instances

* When a user creates an Epic, Campaign, Adventure, or Episode, they are creating a template
* An episode instance can be created whwn the meeting creation or previously to allow the DM to make adjustments.
* When a GM starts a meeting, they either:
  * Create a new episode instance based on a template (cloning),
  * Select a previously created instance (if the episode instance was created before the meeting),
  * Create the meeting as a follow-up and resume the previous instance,
* Instances are playable, Templates are not.
* Instances only change during playtime and those changes must be persisted (saved) because the episode can be resumed on a later meeting
* Templates only change outside of playtime and can never be selected for playing. Selecting an template for a meeting creates an instance of it.
* API endpoints will support explicit cloning of templates:
  - POST /api/episodes/{id}/clone to duplicate an Episode template
  - POST /api/adventures/{id}/clone to deep‑clone an Adventure template (including nested Episodes, Stage data, and EpisodeAssets)
* Episode templates can also be cloned to create playable instances when starting a meeting; Adventure templates cannot be directly used as playable instances
* This allows reuse of content (templates) while preserving the unique state of each playthrough

## Meeting Concept

A Meeting represents a real-life play period and functions similar to a calendar meeting:

### Game-related properties:

* Must be associated with an Episode instance
* When creating a meeting select first the adventure and then the episode.
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

* Each player can have their own Notes about Epics, Campaigns, Adventures, and Episodes
* Only the creator/owner of a Note can edit or delete it
* Notes have three visibility levels:
  * Private: Only the owner/creator can read it
  * Confidential: The owner and the DM can read it, but only the owner can edit it
  * Public: All players can read it, but only the owner can edit it

## Episode Components

Episodes consist of three primary components:

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
  - Episode Templates CRUD API & UI (with clone endpoint)
  - Asset Templates CRUD API & UI

### Pending Phase 2 Tasks

- Support file uploads to blob storage for assets
- Implement adventure template cloning endpoint (POST /api/adventures/{id}/clone)
- Transfer ownership functionality for Adventures, Episodes, and Assets

### Next Steps

- Complete remaining Phase 2 tasks above
- Begin Phase 3: Interactive Episodes and Tokens
  - Canvas-based episode editor
  - Episode stage management and storage
  - Token placement and movement
  - Fog of war and visibility systems
  - Measuring tools

Development will resume here when the app is restarted.
