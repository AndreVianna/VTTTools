This file provides guidance on how to working with the project in this repository.

# Project Description
- This project is .NET 9 C# Aspire Solution called VTTTools.
It creates a Virtual Table Top (VTT) RPG Game interface for online play. It provides tools to help Dungeon Masters (DMs) and players set up and play tabletop role-playing games online, including maps, tokens, dice rolling, and chat functionality.

# Key Files (**IMPORTANT!** YOU MUST READ THESE FILES)
@Design/INSTRUCTIONS.md - Agent instructions and coding standards
@Design/ROADMAP.md - Project roadmap with implementation phases
@Design/PROJECT_DEFINITION.md - Project description, structure and design.
@Design/PROJECT_STRUCTURE.md - Current file/folder structure of the project.

# Tools
- dotnet CLI:
  - use the folloing solution file: `VTTTools.sln`
  - migrations folder: `VTTTools.Data/Migrations`
  - commands:
    - Build: cd Source && dotnet build VTTTools.sln && cd -
    - Test: cd Source && dotnet test VTTTools.sln && cd -
    - Add Migrations: cd Source/Data && dotnet ef migrations add {Migration_Name} -o Migrations

# Memory

1. Project Identification:
   - You should assume that you are working with current_project
   - If you have not identified current_user, proactively try to do so by getting the project information from the files in the Design folder.

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory
   - While conversing with the user, be attentive to any new information that falls into these categories:
     a) Basic Solution Info: platform, name, description, source folder, list of projects that compose the solution;
     b) Basic Project Info: type of project (library, console, blazor web app, web api, tests), folder, language, name, description,  dependencies;
     c) Architecture: project relations and purpose (business dommain, core utilities, data management, api service, UI/UX, hosting);
     d) Features: with names, desriptions, aceptance criteria, funtional and non-funtional requirements, pre-requisites and interdependencies of the tasks
     e) Roadmap: phases and tasks to achieve the intended goal and implement all the features.
     f) Current state: list of the tasks and their state. A list on entries under each task that indicates what what was done to complete the task. That list is very dinamic and should be constantly updated.

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities to represent the definition and progress of the project/solution.
     b) Connect them to the current entities using relations
     c) Store facts about them as observations
     d) Update the entities and relationship accordingly when any new information is gathered.
