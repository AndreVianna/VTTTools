---
allowed-tools: [mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__find, mcp__claude-in-chrome__form_input]
description: Navigate to Library and select an adventure by name
argument-hint: Adventure name (default: "My Adventure")
---

# SelectAdventure Command

Navigate to the VTT Tools Library and select a specific adventure by name.

## Prerequisites

- Chrome browser with Claude-in-Chrome extension connected
- VTT Tools WebClientApp running on localhost:5173
- User logged in to the application

## Process

### Step 1: Get Browser Context

- Use `mcp__claude-in-chrome__tabs_context_mcp` to get available tabs
- If no tabs available, create one with `mcp__claude-in-chrome__tabs_create_mcp`

### Step 2: Navigate to Application

- Use `mcp__claude-in-chrome__navigate` to go to `http://localhost:5173`
- Take a screenshot to verify the page loaded

### Step 3: Open Library

- Click on the "Library" link in the navigation bar
- Wait for the Library page to load
- Take a screenshot to verify

### Step 4: Navigate to Adventures Tab

- The Library page should default to Adventures tab
- If not on Adventures tab, click on "Adventures" tab
- Take a screenshot to see available adventures

### Step 5: Find and Select Adventure

- Look for the adventure card with the name matching the argument: `$ARGUMENTS`
- **Default**: If no argument provided, use "My Adventure"
- Click on the adventure card to open it
- Take a screenshot to confirm the adventure details page loaded

### Step 6: Verify Selection

- Confirm the adventure title matches the requested name
- Report the adventure details:
  - Title
  - Style
  - Description
  - Number of encounters

## Expected Outcome

- Browser displays the adventure detail page for the specified adventure
- User can see adventure metadata and list of encounters

## Error Handling

- **Adventure not found**: Report available adventures and ask user to specify correct name
- **Not logged in**: Report that user needs to log in first
- **App not running**: Report that WebClientApp needs to be started on port 5173
