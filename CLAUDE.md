# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Objective

This project creates a Virtual Table Top (VTT) RPG Game interface for online play. It provides tools to help Dungeon Masters (DMs) and players set up and play tabletop role-playing games online, including maps, tokens, dice rolling, and chat functionality.

## Key Files

* Design/ROADMAP.md - Project roadmap with implementation phases
* Design/PROJECT_DEFINITION.md - Project description, structure and design.

## Previous Conversation

1. We analyzed the current state of the VTTTools project, comparing it with the roadmap.

2. We created a comprehensive game structure document that defines:
   
   - Hierarchy: Epic > Campaign > Adventure > Episode
   - Meeting concept (renamed from Session)
   - Templates vs Instances
   - Player and character relationships
   - Token types (Playable vs Static)
   - Chat interaction with 9 message types
   - Notes system with visibility levels
   - Map properties

3. We saved this as PROJECT_DEFINITION.md in the Design folder.

4. We updated the ROADMAP.md to align with these new concepts, restructuring it into 6 phases:
   
   - Phase 1: Core Infrastructure and Meeting Management
   - Phase 2: Basic Game Content Management
   - Phase 3: Interactive Maps and Tokens
   - Phase 4: Chat and Dice Rolling System
   - Phase 5: Game Mechanics and Advanced Features
   - Phase 6: Platform Growth and Optimization

5. We analyzed the current implementation state (April 2025):
   
   - Core Meeting, Epic, Campaign, Adventure, and Episode models are defined
   - Meeting service interfaces and implementations exist
   - Basic UI for meeting management is in place
   - Database context and schema builders are set up
   - The project is using .NET with Blazor as specified

6. Identified next steps for implementation:
   
   - Refactor contract files from Session to Meeting terminology
   - Implement basic dashboard for active and past meetings
   - Set up meeting invitation system with RSVP functionality
   - Implement calendar integration for scheduling recurring meetings
   - Create Adventure and Episode template management
