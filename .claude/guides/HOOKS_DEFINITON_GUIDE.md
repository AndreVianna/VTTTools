# Claude Code Hooks Creation Guide

This comprehensive guide covers everything you need to know about creating and managing Claude Code hooks based on official documentation, community best practices, and proven patterns from production repositories.

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Hook Architecture & Concepts](#hook-architecture--concepts)
4. [Hook Types & Lifecycle Events](#hook-types--lifecycle-events)
5. [Configuration Reference](#configuration-reference)
6. [Environment Variables & Data Flow](#environment-variables--data-flow)
7. [Best Practices](#best-practices)
8. [Integration Patterns](#integration-patterns)
9. [Real-World Examples](#real-world-examples)
10. [Security Considerations](#security-considerations)
11. [Performance & Resource Management](#performance--resource-management)
12. [Advanced Features](#advanced-features)
13. [Community Resources](#community-resources)
14. [Troubleshooting](#troubleshooting)

## Introduction

Claude Code hooks are user-defined shell commands that execute automatically at specific points in Claude Code's lifecycle. They provide deterministic, programmatic control over Claude Code's behavior, ensuring certain actions always happen rather than relying on the LLM to choose to run them.

### Benefits

- **Deterministic Control**: Guarantee specific actions execute at precise moments
- **Workflow Automation**: Automate repetitive tasks like formatting, testing, and validation
- **Security Enhancement**: Block dangerous operations or sensitive file access
- **Development Quality**: Enforce code standards and quality checks automatically
- **Real-time Monitoring**: Track and observe AI agent behavior and decisions
- **Integration Bridge**: Connect Claude Code with external tools and services

### Use Cases

- **Code Quality**: Automatic formatting, linting, and style enforcement
- **Testing Automation**: Run tests after code changes, validate functionality
- **Security & Compliance**: Block risky operations, audit file access
- **Monitoring & Observability**: Log agent actions, track performance metrics
- **External Integration**: Webhooks, notifications, CI/CD triggering
- **Development Workflow**: Pre-commit checks, automated documentation

### When to Use Hooks vs Other Approaches

| Scenario | Hooks | Slash Commands | Subagents |
|----------|--------|----------------|-----------|
| Automatic enforcement | ✓ Best | Manual | Manual |
| Workflow automation | ✓ Best | Good | Limited |
| Security controls | ✓ Best | None | Limited |
| Real-time monitoring | ✓ Best | None | None |
| User-initiated tasks | Limited | ✓ Best | ✓ Best |
| Complex reasoning | None | Good | ✓ Best |

## Quick Start

### 1. Basic Hook Setup

```bash
# Navigate to your project directory
cd your-project
mkdir -p .claude

# Create settings configuration file
cat > .claude/settings.toml << 'EOF'
[[hooks]]
event = "PostToolUse"

[hooks.matcher]
tool_name = "Edit"
file_paths = ["*.js", "*.ts"]

command = "npx prettier --write $CLAUDE_FILE_PATHS"
run_in_background = false
EOF
```

### 2. Alternative JSON Configuration

```bash
# Create JSON configuration instead
cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File modified: '$CLAUDE_FILE_PATHS"
          }
        ]
      }
    ]
  }
}
EOF
```

### 3. Verify Hook Configuration

```markdown
# In Claude Code, run the hooks command
/hooks
```

### 4. Test Your Hook

```markdown
# Edit a JavaScript file in Claude Code
# Watch the hook execute automatically after the edit
```

## Hook Architecture & Concepts

### Execution Model

Claude Code hooks operate within a sophisticated event-driven architecture:

```markdown
User Interaction
    ↓
Claude Code Processing
    ↓
Hook Trigger Points
    ├── UserPromptSubmit (before AI processing)
    ├── PreToolUse (before tool execution)
    ├── PostToolUse (after tool execution)
    ├── Notification (on AI notifications)
    ├── Stop (after AI response complete)
    └── SessionStart (session initialization)
```

### Lifecycle Flow

```markdown
1. Event Occurs → Hook Matcher Evaluation → Command Execution → Response Processing
                      ↓                           ↓               ↓
                 (filters by tool,         (shell command      (continue/block
                  file patterns)           with env vars)       based on exit code)
```

### Context & Data Flow

Hooks receive rich context about the triggering event:

- **Event Type**: Which lifecycle event triggered the hook
- **Tool Information**: Tool name, parameters, file paths
- **Session Context**: Session ID, transcript path, working directory
- **Environment Variables**: Pre-populated context for easy access

### Execution Environment

- **Shell**: Hooks execute as shell commands in the project directory
- **Environment**: Full access to system environment plus Claude-specific variables
- **Permissions**: Run with current user permissions and credentials
- **Timeout**: 60-second default timeout for hook execution
- **Isolation**: Each hook runs in separate process with clean environment

## Hook Types & Lifecycle Events

### 1. UserPromptSubmit

**Triggers**: Immediately when user submits a prompt, before Claude processes it
**Use Cases**: Input validation, prompt enhancement, security filtering, logging
**Blocking**: Can prevent prompt processing with non-zero exit code

```toml
[[hooks]]
event = "UserPromptSubmit"
command = "python .claude/hooks/validate_prompt.py"
```

**Example Implementation**:

```python
#!/usr/bin/env python3
import json, sys, os

# Read hook data from stdin
data = json.loads(sys.stdin.read())
prompt = data.get('user_prompt', '')

# Block prompts containing sensitive keywords
sensitive_terms = ['password', 'api_key', 'secret']
if any(term in prompt.lower() for term in sensitive_terms):
    print(json.dumps({
        "continue": False,
        "stopReason": "Prompt contains sensitive information"
    }))
    sys.exit(1)

# Log all prompts for audit
with open('.claude/logs/prompts.log', 'a') as f:
    f.write(f"{data['session_id']}: {prompt[:100]}...\n")

sys.exit(0)
```

### 2. PreToolUse

**Triggers**: Before Claude executes any tool (Edit, Write, Bash, etc.)
**Use Cases**: Security validation, pre-processing, operation blocking
**Blocking**: Can prevent tool execution with non-zero exit code

```toml
[[hooks]]
event = "PreToolUse"

[hooks.matcher]
tool_name = "Bash"

command = "python .claude/hooks/security_check.py"
```

**Example Implementation**:

```python
#!/usr/bin/env python3
import json, sys, re

data = json.loads(sys.stdin.read())
tool_input = data.get('tool_input', {})
command = tool_input.get('command', '')

# Block dangerous commands
dangerous_patterns = [
    r'rm\s+-rf\s+/',
    r'sudo\s+rm',
    r'>\s*/dev/sd[a-z]',
    r'dd\s+if=.*of=/dev/',
    r'mkfs\.',
    r'fdisk',
    r'curl.*\|\s*sh',
    r'wget.*\|\s*sh'
]

for pattern in dangerous_patterns:
    if re.search(pattern, command, re.IGNORECASE):
        print(json.dumps({
            "continue": False,
            "stopReason": f"Blocked dangerous command: {command[:50]}..."
        }))
        sys.exit(1)

# Log all bash commands
with open('.claude/logs/bash_commands.log', 'a') as f:
    f.write(f"{data['session_id']}: {command}\n")

sys.exit(0)
```

### 3. PostToolUse

**Triggers**: After successful tool execution
**Use Cases**: Code formatting, testing, notifications, cleanup
**Blocking**: Cannot prevent tool execution (already completed)

```toml
[[hooks]]
event = "PostToolUse"

[hooks.matcher]
tool_name = "Edit"
file_paths = ["*.py"]

command = "python -m black $CLAUDE_FILE_PATHS && python -m isort $CLAUDE_FILE_PATHS"
```

### 4. Notification

**Triggers**: When Claude sends notifications to the user
**Use Cases**: Custom notification handling, external alerting, logging

```toml
[[hooks]]
event = "Notification"
command = "notify-send 'Claude Code' '$CLAUDE_NOTIFICATION'"
```

### 5. Stop

**Triggers**: When Claude finishes generating a response
**Use Cases**: Session cleanup, final validation, summary generation
**Blocking**: Can prevent Claude from stopping with non-zero exit code

```toml
[[hooks]]
event = "Stop"
command = "python .claude/hooks/session_summary.py"
```

### 6. SessionStart

**Triggers**: When Claude Code starts new session or resumes existing one
**Use Cases**: Environment setup, context initialization, logging

```toml
[[hooks]]
event = "SessionStart"
command = "echo 'Session started: '$(date) >> .claude/logs/sessions.log"
```

### 7. SubagentStop

**Triggers**: When subagent tasks complete
**Use Cases**: Subagent result processing, coordination, cleanup

```toml
[[hooks]]
event = "SubagentStop"
command = "python .claude/hooks/subagent_logger.py"
```

### 8. PreCompact

**Triggers**: Before Claude compacts conversation context
**Use Cases**: Context preservation, backup, analysis

```toml
[[hooks]]
event = "PreCompact"
command = "python .claude/hooks/backup_context.py"
```

## Configuration Reference

### TOML Configuration Format

#### Basic Hook Structure

```toml
[[hooks]]
event = "EventName"              # Required: Hook event type
command = "shell-command"        # Required: Command to execute
run_in_background = false        # Optional: Background execution (default: false)

[hooks.matcher]                  # Optional: Event filtering
tool_name = "ToolName"           # Filter by specific tool
file_paths = ["*.ext"]           # Filter by file patterns
```

#### Advanced Hook Configuration

```toml
[[hooks]]
event = "PostToolUse"
command = "python .claude/hooks/formatter.py"
run_in_background = false
timeout = 30                     # Custom timeout in seconds

[hooks.matcher]
tool_name = "Edit|Write|MultiEdit"
file_paths = ["*.py", "*.js", "*.ts"]
ignore_paths = ["node_modules/**", "*.min.js"]
```

#### Multiple Hooks for Same Event

```toml
# First hook: Code formatting
[[hooks]]
event = "PostToolUse"
command = "prettier --write $CLAUDE_FILE_PATHS"

[hooks.matcher]
tool_name = "Edit"
file_paths = ["*.js", "*.ts", "*.json"]

# Second hook: Run tests
[[hooks]]
event = "PostToolUse"
command = "npm test -- --passWithNoTests"

[hooks.matcher]
tool_name = "Edit"
file_paths = ["src/**/*.js", "src/**/*.ts"]
```

### JSON Configuration Format

#### Basic Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "shell-command",
            "run_in_background": false
          }
        ]
      }
    ]
  }
}
```

#### Complete Example

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/security_check.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write $CLAUDE_FILE_PATHS",
            "run_in_background": false
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python .claude/hooks/session_logger.py"
          }
        ]
      }
    ]
  }
}
```

### Matcher Patterns

#### Tool Name Matching

```toml
[hooks.matcher]
tool_name = "Edit"                    # Exact match
tool_name = "Edit|Write"              # Multiple tools (OR)
tool_name = ".*"                      # All tools (regex)
tool_name = "mcp__.*"                 # MCP tools only
```

#### File Path Matching

```toml
[hooks.matcher]
file_paths = ["*.py"]                 # Python files only
file_paths = ["src/**/*.js"]          # JavaScript in src directory
file_paths = ["*.py", "*.js", "*.ts"] # Multiple extensions
ignore_paths = ["node_modules/**"]    # Exclusion patterns
```

## Environment Variables & Data Flow

### Standard Environment Variables

Claude Code provides rich context through environment variables:

```bash
# Core Event Information
$CLAUDE_EVENT_TYPE        # Hook event type (PreToolUse, PostToolUse, etc.)
$CLAUDE_SESSION_ID        # Unique session identifier
$CLAUDE_CWD              # Current working directory

# Tool Context
$CLAUDE_TOOL_NAME        # Tool being executed (Edit, Bash, Write, etc.)
$CLAUDE_FILE_PATHS       # Space-separated list of relevant file paths

# Event-Specific Data
$CLAUDE_NOTIFICATION     # Notification content (Notification event)
$CLAUDE_USER_PROMPT      # User's prompt text (UserPromptSubmit event)
```

### Stdin Data Format

All hooks receive JSON data via stdin with detailed event context:

```json
{
  "session_id": "abc123-def456-789",
  "transcript_path": "/Users/dev/.claude/projects/myapp/transcript.jsonl",
  "cwd": "/Users/dev/myapp",
  "hook_event_name": "PostToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/Users/dev/myapp/src/main.js",
    "content": "const app = require('express')();\n...",
    "edit_type": "str_replace"
  },
  "tool_output": "File edited successfully",
  "timestamp": "2024-01-15T10:30:45Z"
}
```

### Hook Response Format

Hooks can return structured JSON for advanced control:

```json
{
  "continue": true,                    # Whether Claude should continue (default: true)
  "stopReason": "Custom stop message", # Message when continue=false
  "suppressOutput": false              # Hide stdout from transcript (default: false)
}
```

## Best Practices

### Design Principles

#### Single Responsibility

Each hook should have one clear purpose:

```toml
# Good - Focused responsibility
[[hooks]]
event = "PostToolUse"
command = "prettier --write $CLAUDE_FILE_PATHS"
[hooks.matcher]
tool_name = "Edit"
file_paths = ["*.js", "*.ts"]

# Avoid - Multiple responsibilities
[[hooks]]
event = "PostToolUse"
command = "prettier --write $CLAUDE_FILE_PATHS && npm test && git add . && echo 'Done'"
```

#### Idempotent Operations

Hooks should be safe to run multiple times:

```bash
# Good - Idempotent formatting
prettier --write "$file"

# Good - Conditional operations
if [ ! -f "$file.backup" ]; then cp "$file" "$file.backup"; fi

# Avoid - Non-idempotent operations
echo "File edited" >> log.txt  # Appends every time
mv "$file" "$file.old"        # Fails on second run
```

#### Fast Execution

Keep hooks lightweight for responsive development:

```toml
# Good - Fast operations
command = "eslint --fix $CLAUDE_FILE_PATHS"

# Consider background for slow operations
command = "npm test"
run_in_background = true

# Avoid - Blocking slow operations
command = "docker build -t myapp ."  # Very slow, blocks Claude
```

### Configuration Standards

#### Use Specific Matchers

Avoid overly broad hook activation:

```toml
# Good - Specific matching
[hooks.matcher]
tool_name = "Edit"
file_paths = ["src/**/*.py"]

# Avoid - Too broad
[hooks.matcher]
tool_name = ".*"  # Matches everything
```

#### Organize by Purpose

Structure configuration logically:

```toml
# Code Quality Hooks
[[hooks]]
event = "PostToolUse"
command = "black $CLAUDE_FILE_PATHS"
[hooks.matcher]
tool_name = "Edit"
file_paths = ["*.py"]

[[hooks]]
event = "PostToolUse"
command = "prettier --write $CLAUDE_FILE_PATHS"
[hooks.matcher]
tool_name = "Edit"
file_paths = ["*.js", "*.ts"]

# Security Hooks
[[hooks]]
event = "PreToolUse"
command = "python .claude/hooks/security_check.py"
[hooks.matcher]
tool_name = "Bash"
```

#### Version Control Integration

Keep hooks in version control for team sharing:

```bash
# Include hooks in git
git add .claude/settings.toml
git add .claude/hooks/
git commit -m "Add code formatting and security hooks"

# Document team hooks
echo "# Team Hooks" > .claude/hooks/README.md
echo "- security_check.py: Validates bash commands" >> .claude/hooks/README.md
echo "- formatter.py: Auto-formats code files" >> .claude/hooks/README.md
```

### Error Handling

#### Graceful Failures

Handle errors without breaking development flow:

```python
#!/usr/bin/env python3
import json, sys, subprocess

try:
    # Attempt formatting
    result = subprocess.run(['prettier', '--write'] + sys.argv[1:], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode != 0:
        print(f"Formatting warning: {result.stderr}", file=sys.stderr)
        # Don't block on formatting errors
        sys.exit(0)
        
except subprocess.TimeoutExpired:
    print("Formatter timed out, skipping", file=sys.stderr)
    sys.exit(0)
except Exception as e:
    print(f"Formatter error: {e}", file=sys.stderr)
    sys.exit(0)
```

#### Informative Error Messages

Provide clear feedback when hooks block operations:

```python
print(json.dumps({
    "continue": False,
    "stopReason": "Security check failed: Command contains 'rm -rf /'. Please review and try again."
}))
```

### Security Considerations

#### Input Validation

Always validate and sanitize inputs:

```python
import re, os, sys

def validate_file_path(path):
    # Prevent path traversal
    if '..' in path or path.startswith('/'):
        return False
    
    # Ensure file is in project directory
    abs_path = os.path.abspath(path)
    project_root = os.path.abspath('.')
    return abs_path.startswith(project_root)

# Validate all file paths
file_paths = os.environ.get('CLAUDE_FILE_PATHS', '').split()
for path in file_paths:
    if not validate_file_path(path):
        print(f"Invalid file path: {path}", file=sys.stderr)
        sys.exit(1)
```

#### Sensitive File Protection

Block access to sensitive files:

```python
import os, json, sys

sensitive_patterns = [
    '.env', '.env.*',
    '*.key', '*.pem', '*.p12',
    'secrets.*', 'config/secrets.*',
    '.git/config', '.ssh/*'
]

def is_sensitive_file(file_path):
    import fnmatch
    for pattern in sensitive_patterns:
        if fnmatch.fnmatch(file_path, pattern):
            return True
    return False

# Check if any files are sensitive
file_paths = os.environ.get('CLAUDE_FILE_PATHS', '').split()
for path in file_paths:
    if is_sensitive_file(path):
        print(json.dumps({
            "continue": False,
            "stopReason": f"Access to sensitive file blocked: {path}"
        }))
        sys.exit(1)
```

## Integration Patterns

### Slash Command Integration

Combine hooks with slash commands for comprehensive workflows:

```markdown
# .claude/commands/deploy.md
---
allowed-tools: Bash, Read, Write
description: Deploy application with automated quality checks
---

# Deployment Command

Deploy application with pre-deployment validation via hooks.

## Instructions
1. Run deployment preparation
2. Hooks will automatically:
   - Format all code files (PostToolUse)
   - Run security checks (PreToolUse for bash commands)
   - Execute tests (PostToolUse)
3. Proceed with deployment if all hooks pass
```

### Subagent Coordination

Use hooks to monitor and coordinate subagent activities:

```toml
[[hooks]]
event = "SubagentStop"
command = "python .claude/hooks/subagent_coordinator.py"
```

```python
#!/usr/bin/env python3
import json, sys

data = json.loads(sys.stdin.read())
subagent_result = data.get('subagent_output', '')

# Log subagent completion
with open('.claude/logs/subagent_activity.log', 'a') as f:
    f.write(f"Subagent completed: {data.get('subagent_name', 'unknown')}\n")

# Trigger next phase of multi-agent workflow
if 'code-review-complete' in subagent_result:
    # Trigger deployment subagent
    print("Starting deployment phase...")
```

### External Service Integration

Connect Claude Code with external services via hooks:

```toml
[[hooks]]
event = "PostToolUse"
command = "python .claude/hooks/webhook_notify.py"
[hooks.matcher]
tool_name = "Edit"
file_paths = ["src/**/*"]
```

```python
#!/usr/bin/env python3
import json, sys, requests, os

data = json.loads(sys.stdin.read())
file_paths = os.environ.get('CLAUDE_FILE_PATHS', '').split()

# Notify external CI/CD system
webhook_url = os.environ.get('CI_WEBHOOK_URL')
if webhook_url:
    payload = {
        'event': 'code_modified',
        'files': file_paths,
        'session': data['session_id'],
        'timestamp': data.get('timestamp')
    }
    
    try:
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print(f"Webhook notification failed: {e}", file=sys.stderr)
```

## Real-World Examples

### Example 1: Full-Stack Development Workflow

#### Code Quality Automation

```toml
# Frontend formatting
[[hooks]]
event = "PostToolUse"
command = "npx prettier --write $CLAUDE_FILE_PATHS"
[hooks.matcher]
tool_name = "Edit|Write"
file_paths = ["src/**/*.js", "src/**/*.ts", "src/**/*.jsx", "src/**/*.tsx"]

# Backend formatting
[[hooks]]
event = "PostToolUse"
command = "python -m black $CLAUDE_FILE_PATHS && python -m isort $CLAUDE_FILE_PATHS"
[hooks.matcher]
tool_name = "Edit|Write"
file_paths = ["**/*.py"]

# CSS/SCSS formatting
[[hooks]]
event = "PostToolUse"
command = "npx stylelint --fix $CLAUDE_FILE_PATHS"
[hooks.matcher]
tool_name = "Edit|Write"
file_paths = ["**/*.css", "**/*.scss"]
```

#### Testing Automation

```toml
# Run unit tests after code changes
[[hooks]]
event = "PostToolUse"
command = "npm test -- --passWithNoTests --findRelatedTests $CLAUDE_FILE_PATHS"
run_in_background = true
[hooks.matcher]
tool_name = "Edit|Write"
file_paths = ["src/**/*.js", "src/**/*.ts"]

# Python tests
[[hooks]]
event = "PostToolUse"
command = "python -m pytest --tb=short -x"
run_in_background = true
[hooks.matcher]
tool_name = "Edit|Write"
file_paths = ["**/*.py"]
```

### Example 2: Security-First Development

#### Command Validation

```toml
[[hooks]]
event = "PreToolUse"
command = "python .claude/hooks/security_validator.py"
[hooks.matcher]
tool_name = "Bash"
```

```python
#!/usr/bin/env python3
import json, sys, re, os

def analyze_command_safety(command):
    """Analyze bash command for security risks"""
    
    # Critical danger patterns
    critical_patterns = [
        r'rm\s+-rf\s+/',              # Recursive delete from root
        r'sudo\s+rm',                 # Sudo delete operations
        r'>\s*/dev/sd[a-z]',          # Direct disk writing
        r'dd\s+if=.*of=/dev/',        # Disk imaging to devices
        r'mkfs\.',                    # Filesystem creation
        r'fdisk|cfdisk|parted',       # Disk partitioning
    ]
    
    # Network security patterns
    network_patterns = [
        r'curl.*\|\s*sh',             # Pipe to shell
        r'wget.*\|\s*sh',            # Download and execute
        r'nc\s+.*-e\s+/bin/sh',      # Netcat shell
        r'telnet.*\|\s*sh',          # Telnet execution
    ]
    
    # File system risks
    filesystem_patterns = [
        r'chmod\s+777',               # Overly permissive permissions
        r'chown\s+.*:.*\s+/',        # Root ownership changes
        r'find.*-exec\s+rm',         # Find and delete
    ]
    
    all_patterns = critical_patterns + network_patterns + filesystem_patterns
    
    risks = []
    for pattern in all_patterns:
        if re.search(pattern, command, re.IGNORECASE):
            risks.append(pattern)
    
    return risks

# Process the hook data
data = json.loads(sys.stdin.read())
tool_input = data.get('tool_input', {})
command = tool_input.get('command', '')

# Analyze command
risks = analyze_command_safety(command)

if risks:
    print(json.dumps({
        "continue": False,
        "stopReason": f"Security check blocked command. Risks detected: {', '.join(risks)}"
    }))
    sys.exit(1)

# Log all commands for audit
with open('.claude/logs/bash_audit.log', 'a') as f:
    f.write(f"{data['session_id']}: {command}\n")

sys.exit(0)
```

#### File Access Control

```toml
[[hooks]]
event = "PreToolUse"
command = "python .claude/hooks/file_guardian.py"
[hooks.matcher]
tool_name = "Edit|Write|Read"
```

```python
#!/usr/bin/env python3
import json, sys, os, fnmatch

def is_protected_file(file_path):
    """Check if file is protected from modification"""
    
    protected_patterns = [
        # Environment and secrets
        '.env*', 'secrets.*', '*.key', '*.pem', '*.p12',
        
        # System configuration
        '/etc/*', '/var/*', '/usr/*', '/boot/*',
        
        # Version control
        '.git/config', '.git/hooks/*',
        
        # Package managers
        'package-lock.json', 'yarn.lock', 'poetry.lock',
        
        # Build artifacts
        'dist/*', 'build/*', '*.min.js', '*.min.css',
        
        # Database files
        '*.db', '*.sqlite', '*.sqlite3',
        
        # Logs and temporary files
        '*.log', '*.tmp', '/tmp/*'
    ]
    
    # Normalize path
    normalized_path = os.path.normpath(file_path)
    
    for pattern in protected_patterns:
        if fnmatch.fnmatch(normalized_path, pattern):
            return True, pattern
    
    return False, None

def check_project_boundaries(file_path):
    """Ensure file operations stay within project boundaries"""
    try:
        abs_path = os.path.abspath(file_path)
        project_root = os.path.abspath('.')
        return abs_path.startswith(project_root)
    except:
        return False

# Process hook data
data = json.loads(sys.stdin.read())
tool_input = data.get('tool_input', {})

# Get file path from different tool types
file_path = None
if 'file_path' in tool_input:
    file_path = tool_input['file_path']
elif 'path' in tool_input:
    file_path = tool_input['path']

if not file_path:
    sys.exit(0)  # No file path to check

# Check project boundaries
if not check_project_boundaries(file_path):
    print(json.dumps({
        "continue": False,
        "stopReason": f"File access outside project boundaries blocked: {file_path}"
    }))
    sys.exit(1)

# Check protected files
is_protected, pattern = is_protected_file(file_path)
if is_protected:
    print(json.dumps({
        "continue": False,
        "stopReason": f"Access to protected file blocked: {file_path} (matches pattern: {pattern})"
    }))
    sys.exit(1)

# Log file access for audit
with open('.claude/logs/file_access.log', 'a') as f:
    f.write(f"{data['session_id']}: {data['tool_name']} -> {file_path}\n")

sys.exit(0)
```

### Example 3: CI/CD Integration

#### GitHub Actions Trigger

```toml
[[hooks]]
event = "PostToolUse"
command = "python .claude/hooks/github_integration.py"
[hooks.matcher]
tool_name = "Edit|Write|MultiEdit"
file_paths = ["src/**/*", "tests/**/*"]
```

```python
#!/usr/bin/env python3
import json, sys, os, requests, subprocess

def trigger_github_workflow():
    """Trigger GitHub Actions workflow via repository dispatch"""
    
    github_token = os.environ.get('GITHUB_TOKEN')
    repo_owner = os.environ.get('GITHUB_REPO_OWNER')
    repo_name = os.environ.get('GITHUB_REPO_NAME')
    
    if not all([github_token, repo_owner, repo_name]):
        print("GitHub integration not configured", file=sys.stderr)
        return
    
    # Get current commit info
    try:
        commit_sha = subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'], text=True
        ).strip()
        
        branch = subprocess.check_output(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'], text=True
        ).strip()
    except:
        print("Failed to get git info", file=sys.stderr)
        return
    
    # Trigger workflow
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/dispatches"
    headers = {
        'Authorization': f'token {github_token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    payload = {
        'event_type': 'claude-code-changes',
        'client_payload': {
            'commit_sha': commit_sha,
            'branch': branch,
            'trigger': 'claude-code-edit'
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 204:
            print("GitHub workflow triggered successfully")
        else:
            print(f"Failed to trigger workflow: {response.status_code}", file=sys.stderr)
    except Exception as e:
        print(f"GitHub API error: {e}", file=sys.stderr)

# Process hook data
data = json.loads(sys.stdin.read())

# Only trigger on significant file changes
file_paths = os.environ.get('CLAUDE_FILE_PATHS', '').split()
significant_files = [f for f in file_paths if not f.endswith(('.log', '.tmp', '.cache'))]

if significant_files:
    trigger_github_workflow()

sys.exit(0)
```

### Example 4: Real-Time Monitoring & Observability

#### Comprehensive Activity Logger

```toml
[[hooks]]
event = "UserPromptSubmit"
command = "python .claude/hooks/activity_logger.py prompt"

[[hooks]]
event = "PreToolUse"
command = "python .claude/hooks/activity_logger.py pre_tool"

[[hooks]]
event = "PostToolUse"
command = "python .claude/hooks/activity_logger.py post_tool"

[[hooks]]
event = "Stop"
command = "python .claude/hooks/activity_logger.py stop"
```

```python
#!/usr/bin/env python3
import json, sys, os, time
from datetime import datetime
import sqlite3

class ActivityLogger:
    def __init__(self):
        self.db_path = '.claude/logs/activity.db'
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database for activity logging"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS activities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    tool_name TEXT,
                    file_paths TEXT,
                    prompt_length INTEGER,
                    execution_time REAL,
                    metadata TEXT
                )
            ''')
    
    def log_activity(self, event_type, data):
        """Log activity to database"""
        timestamp = datetime.now().isoformat()
        session_id = data.get('session_id', 'unknown')
        tool_name = data.get('tool_name')
        
        # Extract file paths
        file_paths = os.environ.get('CLAUDE_FILE_PATHS', '')
        
        # Calculate execution time for tool events
        execution_time = None
        if event_type in ['post_tool']:
            # Estimate based on tool complexity
            if file_paths:
                execution_time = len(file_paths.split()) * 0.1
        
        # Extract prompt information
        prompt_length = None
        if event_type == 'prompt':
            prompt_length = len(data.get('user_prompt', ''))
        
        # Store metadata as JSON
        metadata = json.dumps({
            'cwd': data.get('cwd'),
            'tool_input': data.get('tool_input', {}),
            'notification': data.get('notification')
        })
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO activities 
                (timestamp, session_id, event_type, tool_name, file_paths, 
                 prompt_length, execution_time, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (timestamp, session_id, event_type, tool_name, file_paths,
                  prompt_length, execution_time, metadata))
    
    def generate_session_summary(self, session_id):
        """Generate summary for completed session"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT event_type, COUNT(*), GROUP_CONCAT(DISTINCT tool_name)
                FROM activities 
                WHERE session_id = ? 
                GROUP BY event_type
            ''', (session_id,))
            
            summary = {}
            for row in cursor:
                event_type, count, tools = row
                summary[event_type] = {
                    'count': count,
                    'tools': tools.split(',') if tools else []
                }
            
            return summary

def main():
    if len(sys.argv) < 2:
        sys.exit(1)
    
    event_type = sys.argv[1]
    data = json.loads(sys.stdin.read())
    
    logger = ActivityLogger()
    logger.log_activity(event_type, data)
    
    # Generate session summary on stop
    if event_type == 'stop':
        session_id = data.get('session_id')
        if session_id:
            summary = logger.generate_session_summary(session_id)
            print(f"Session Summary: {json.dumps(summary, indent=2)}")

if __name__ == '__main__':
    main()
```

## Performance & Resource Management

### Execution Overhead

Hooks add execution overhead that impacts development flow:

#### Measurement & Monitoring

```python
#!/usr/bin/env python3
import time, json, sys

start_time = time.time()

# Your hook logic here
# ...

execution_time = time.time() - start_time

# Log performance metrics
with open('.claude/logs/hook_performance.log', 'a') as f:
    f.write(f"{sys.argv[0]}:{execution_time:.3f}s\n")

# Warn about slow hooks
if execution_time > 2.0:
    print(f"Warning: Hook took {execution_time:.1f}s", file=sys.stderr)
```

#### Optimization Strategies

**Background Execution**: Use for non-blocking operations

```toml
[[hooks]]
event = "PostToolUse"
command = "npm test"
run_in_background = true  # Don't block Claude Code
```

**Conditional Execution**: Only run when necessary

```python
import os, sys

# Skip if no relevant files changed
file_paths = os.environ.get('CLAUDE_FILE_PATHS', '').split()
python_files = [f for f in file_paths if f.endswith('.py')]

if not python_files:
    sys.exit(0)  # Nothing to do

# Run expensive operation only for Python files
subprocess.run(['python', '-m', 'black'] + python_files)
```

**Caching**: Avoid redundant work

```python
import hashlib, os, pickle

def get_file_hash(file_path):
    with open(file_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def should_process_file(file_path):
    cache_file = f'.claude/cache/{file_path.replace("/", "_")}.cache'
    
    try:
        with open(cache_file, 'rb') as f:
            cached_hash = pickle.load(f)
        
        current_hash = get_file_hash(file_path)
        return cached_hash != current_hash
        
    except:
        return True  # No cache, process the file

def update_cache(file_path):
    cache_file = f'.claude/cache/{file_path.replace("/", "_")}.cache'
    os.makedirs(os.path.dirname(cache_file), exist_ok=True)
    
    with open(cache_file, 'wb') as f:
        pickle.dump(get_file_hash(file_path), f)
```

### Resource Limits

#### Timeout Management

```toml
[[hooks]]
event = "PostToolUse"
command = "timeout 30s python .claude/hooks/expensive_operation.py"
```

#### Memory Management

```python
import psutil, os

def check_memory_usage():
    process = psutil.Process(os.getpid())
    memory_mb = process.memory_info().rss / 1024 / 1024
    
    if memory_mb > 100:  # 100MB limit
        print(f"Warning: Hook using {memory_mb:.1f}MB memory", file=sys.stderr)
        return False
    return True

# Monitor memory during expensive operations
if not check_memory_usage():
    sys.exit(1)
```

## Advanced Features

### Multi-Hook Coordination

Coordinate multiple hooks for complex workflows:

```python
#!/usr/bin/env python3
# .claude/hooks/coordinator.py
import json, sys, os, subprocess

class HookCoordinator:
    def __init__(self):
        self.state_file = '.claude/hooks/coordination_state.json'
    
    def get_state(self):
        try:
            with open(self.state_file, 'r') as f:
                return json.load(f)
        except:
            return {}
    
    def set_state(self, key, value):
        state = self.get_state()
        state[key] = value
        
        os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
        with open(self.state_file, 'w') as f:
            json.dump(state, f)
    
    def coordinate_formatting_pipeline(self, file_paths):
        """Run formatting tools in specific order"""
        
        # Phase 1: Basic formatting
        for file_path in file_paths:
            if file_path.endswith('.py'):
                subprocess.run(['python', '-m', 'black', file_path])
                subprocess.run(['python', '-m', 'isort', file_path])
            elif file_path.endswith(('.js', '.ts')):
                subprocess.run(['npx', 'prettier', '--write', file_path])
        
        # Phase 2: Linting
        python_files = [f for f in file_paths if f.endswith('.py')]
        if python_files:
            subprocess.run(['python', '-m', 'flake8'] + python_files)
        
        js_files = [f for f in file_paths if f.endswith(('.js', '.ts'))]
        if js_files:
            subprocess.run(['npx', 'eslint', '--fix'] + js_files)
        
        # Phase 3: Type checking
        if python_files:
            subprocess.run(['python', '-m', 'mypy'] + python_files)
        
        if js_files:
            subprocess.run(['npx', 'tsc', '--noEmit'])
```

### Custom Event Types

Create specialized events for specific workflows:

```python
#!/usr/bin/env python3
# .claude/hooks/custom_event_generator.py
import json, sys, os

def trigger_custom_event(event_name, payload):
    """Trigger custom event that other hooks can respond to"""
    
    event_data = {
        'custom_event': event_name,
        'payload': payload,
        'timestamp': time.time(),
        'session_id': os.environ.get('CLAUDE_SESSION_ID')
    }
    
    # Write to event queue
    event_file = f'.claude/events/{event_name}_{int(time.time())}.json'
    os.makedirs(os.path.dirname(event_file), exist_ok=True)
    
    with open(event_file, 'w') as f:
        json.dump(event_data, f)

# Usage: Trigger deployment-ready event
if all_tests_passed and code_formatted:
    trigger_custom_event('deployment_ready', {
        'files_ready': modified_files,
        'test_results': test_summary
    })
```

### Hook Chaining

Execute hooks in specific sequences:

```toml
# Chain 1: Code Quality Pipeline
[[hooks]]
event = "PostToolUse"
command = "python .claude/hooks/chain_executor.py quality_pipeline"
[hooks.matcher]
tool_name = "Edit"
file_paths = ["src/**/*"]

# Chain 2: Security Validation Pipeline  
[[hooks]]
event = "PreToolUse"
command = "python .claude/hooks/chain_executor.py security_pipeline"
[hooks.matcher]
tool_name = "Bash"
```

```python
#!/usr/bin/env python3
# .claude/hooks/chain_executor.py
import json, sys, subprocess

PIPELINES = {
    'quality_pipeline': [
        'python .claude/hooks/format_code.py',
        'python .claude/hooks/run_linter.py',
        'python .claude/hooks/type_check.py',
        'python .claude/hooks/run_tests.py'
    ],
    'security_pipeline': [
        'python .claude/hooks/validate_command.py',
        'python .claude/hooks/check_file_permissions.py',
        'python .claude/hooks/audit_log.py'
    ]
}

def execute_pipeline(pipeline_name, hook_data):
    """Execute hooks in pipeline sequence"""
    
    if pipeline_name not in PIPELINES:
        print(f"Unknown pipeline: {pipeline_name}", file=sys.stderr)
        return False
    
    for hook_command in PIPELINES[pipeline_name]:
        try:
            # Pass hook data to each pipeline step
            result = subprocess.run(
                hook_command.split(),
                input=json.dumps(hook_data),
                text=True,
                capture_output=True,
                timeout=30
            )
            
            if result.returncode != 0:
                print(f"Pipeline step failed: {hook_command}", file=sys.stderr)
                print(result.stderr, file=sys.stderr)
                return False
                
        except subprocess.TimeoutExpired:
            print(f"Pipeline step timed out: {hook_command}", file=sys.stderr)
            return False
    
    return True

if __name__ == '__main__':
    pipeline_name = sys.argv[1] if len(sys.argv) > 1 else 'quality_pipeline'
    hook_data = json.loads(sys.stdin.read())
    
    success = execute_pipeline(pipeline_name, hook_data)
    sys.exit(0 if success else 1)
```

## Community Resources

### Major Hook Collections

#### Comprehensive Hook Mastery

- **[disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)**: Complete hook lifecycle coverage with all 8 hook events implemented
- **Features**: Security validation, TTS integration, comprehensive logging, practical examples
- **Languages**: Python with UV single-file scripts for portability

#### Multi-Agent Observability

- **[disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)**: Real-time monitoring system for Claude Code agents
- **Architecture**: Agents → Hook Scripts → HTTP POST → Bun Server → SQLite → WebSocket → Vue Client
- **Features**: Session tracking, real-time visualization, multi-criteria filtering

#### Security & Quality Enforcement

- **[decider/claude-hooks](https://github.com/decider/claude-hooks)**: Comprehensive hooks for clean code practices and workflow automation
- **Focus**: Code quality enforcement, security validation, automated workflows

### Hook Libraries & SDKs

#### Multi-Language Support

Community has developed hooks in various languages:

- **Python**: Most popular, excellent for data processing and validation
- **TypeScript/Node.js**: Great for frontend development workflows
- **Go**: High-performance hooks for large codebases
- **PHP**: Web development specific hooks and integrations
- **Shell Scripts**: Lightweight, fast execution for simple operations

#### Framework Integrations

- **React/Next.js**: Component formatting, prop validation, build optimization
- **Django/Flask**: Database migration validation, security checks
- **Express/Fastify**: API endpoint validation, middleware enforcement
- **Spring Boot**: Java code formatting, dependency management

### Installation Patterns

#### Community Collection Installation

```bash
# Install popular hook collection
git clone https://github.com/disler/claude-code-hooks-mastery.git
cp claude-code-hooks-mastery/.claude/hooks/* .claude/hooks/
cp claude-code-hooks-mastery/.claude/settings.toml .claude/

# Or use as git submodule
git submodule add https://github.com/yourteam/shared-hooks.git .claude/shared-hooks
ln -s ../shared-hooks/hooks/* .claude/hooks/
```

#### Selective Hook Installation

```bash
# Install specific hooks only
mkdir -p .claude/hooks
curl -o .claude/hooks/security_check.py \
  https://raw.githubusercontent.com/disler/claude-code-hooks-mastery/main/.claude/hooks/security_check.py
chmod +x .claude/hooks/security_check.py
```

### Community Best Practices

#### Team Adoption Strategies

1. **Start Simple**: Begin with basic formatting and linting hooks
2. **Gradual Enhancement**: Add security and testing hooks incrementally
3. **Team Training**: Document hook behavior and customization options
4. **Feedback Loop**: Collect team feedback and adjust hook sensitivity
5. **Version Control**: Keep hooks in git for team synchronization

## Troubleshooting

### Common Issues

#### Hook Not Executing

**Symptoms**: Hook configured but never runs
**Possible Causes**:

- Matcher pattern too specific
- TOML/JSON syntax errors
- File permissions issues
- Hook timeout/crashes

**Debugging Steps**:

```bash
# Check hook configuration
/hooks

# Verify TOML syntax
python -c "import toml; print(toml.load('.claude/settings.toml'))"

# Test hook manually
echo '{"session_id":"test","tool_name":"Edit"}' | python .claude/hooks/your_hook.py

# Check hook permissions
ls -la .claude/hooks/
chmod +x .claude/hooks/*.py
```

#### Performance Issues

**Symptoms**: Claude Code becomes slow/unresponsive
**Possible Causes**:

- Hooks running synchronously and taking too long
- Memory leaks in hook scripts
- Network calls without timeouts

**Solutions**:

```toml
# Use background execution for slow operations
run_in_background = true

# Add timeouts to prevent hanging
command = "timeout 30s python .claude/hooks/slow_operation.py"

# Profile hook performance
command = "time python .claude/hooks/your_hook.py"
```

#### Hook Blocking Operations

**Symptoms**: Operations blocked unexpectedly
**Possible Causes**:

- Exit codes not properly managed
- Error conditions triggering blocks
- Overly restrictive matchers

**Debugging**:

```python
#!/usr/bin/env python3
import json, sys

# Debug hook execution
print(f"Hook executing: {sys.argv[0]}", file=sys.stderr)
print(f"Environment: {dict(os.environ)}", file=sys.stderr)

data = json.loads(sys.stdin.read())
print(f"Hook data: {json.dumps(data, indent=2)}", file=sys.stderr)

# Your hook logic
# ...

# Always print exit reason
if should_block:
    print(json.dumps({
        "continue": False,
        "stopReason": "Clear explanation of why blocked"
    }))
    sys.exit(1)
else:
    print("Hook completed successfully", file=sys.stderr)
    sys.exit(0)
```

### Configuration Validation

#### TOML Validation

```python
#!/usr/bin/env python3
import toml, sys

try:
    config = toml.load('.claude/settings.toml')
    
    # Validate required fields
    if 'hooks' not in config:
        print("No hooks configuration found")
        sys.exit(1)
    
    for hook in config.get('hooks', []):
        if 'event' not in hook:
            print(f"Hook missing required 'event' field: {hook}")
            sys.exit(1)
        
        if 'command' not in hook:
            print(f"Hook missing required 'command' field: {hook}")
            sys.exit(1)
    
    print("TOML configuration is valid")
    
except toml.TomlDecodeError as e:
    print(f"TOML syntax error: {e}")
    sys.exit(1)
```

#### JSON Validation

```python
#!/usr/bin/env python3
import json, sys

try:
    with open('.claude/settings.json', 'r') as f:
        config = json.load(f)
    
    # Validate structure
    if 'hooks' not in config:
        print("No hooks configuration found")
        sys.exit(1)
    
    for event_type, hooks in config['hooks'].items():
        for hook_config in hooks:
            if 'hooks' not in hook_config:
                print(f"Invalid hook configuration for {event_type}")
                sys.exit(1)
            
            for hook in hook_config['hooks']:
                if 'command' not in hook:
                    print(f"Hook missing command: {hook}")
                    sys.exit(1)
    
    print("JSON configuration is valid")
    
except json.JSONDecodeError as e:
    print(f"JSON syntax error: {e}")
    sys.exit(1)
```

### Debugging Strategies

#### Hook Execution Tracing

```python
#!/usr/bin/env python3
# .claude/hooks/debug_tracer.py
import json, sys, os, time

def trace_hook_execution():
    """Comprehensive hook execution tracing"""
    
    # Create trace entry
    trace_data = {
        'timestamp': time.time(),
        'hook_script': sys.argv[0],
        'event_type': os.environ.get('CLAUDE_EVENT_TYPE'),
        'tool_name': os.environ.get('CLAUDE_TOOL_NAME'),
        'file_paths': os.environ.get('CLAUDE_FILE_PATHS'),
        'cwd': os.getcwd(),
        'env_vars': dict(os.environ),
        'stdin_data': json.loads(sys.stdin.read())
    }
    
    # Log trace
    trace_file = '.claude/logs/hook_traces.jsonl'
    os.makedirs(os.path.dirname(trace_file), exist_ok=True)
    
    with open(trace_file, 'a') as f:
        f.write(json.dumps(trace_data) + '\n')
    
    return trace_data

# Use in any hook for debugging
if __name__ == '__main__':
    trace_data = trace_hook_execution()
    print(f"Hook trace logged: {trace_data['hook_script']}", file=sys.stderr)
```

#### Performance Profiling

```python
#!/usr/bin/env python3
import time, psutil, os, json

class HookProfiler:
    def __init__(self):
        self.start_time = time.time()
        self.process = psutil.Process(os.getpid())
        self.initial_memory = self.process.memory_info().rss
    
    def profile_checkpoint(self, name):
        current_time = time.time()
        current_memory = self.process.memory_info().rss
        
        profile_data = {
            'checkpoint': name,
            'elapsed_time': current_time - self.start_time,
            'memory_usage_mb': current_memory / 1024 / 1024,
            'memory_delta_mb': (current_memory - self.initial_memory) / 1024 / 1024
        }
        
        # Log performance data
        with open('.claude/logs/hook_performance.jsonl', 'a') as f:
            f.write(json.dumps(profile_data) + '\n')
        
        return profile_data

# Usage in hooks
profiler = HookProfiler()

# ... hook logic ...
profiler.profile_checkpoint('validation_complete')

# ... more hook logic ...
profiler.profile_checkpoint('processing_complete')
```

### Getting Help

#### Official Resources

- **Documentation**: <https://docs.anthropic.com/en/docs/claude-code/hooks>
- **Hook Reference**: <https://docs.anthropic.com/en/docs/claude-code/hooks-guide>
- **Best Practices**: <https://www.anthropic.com/engineering/claude-code-best-practices>

#### Community Support

- **GitHub Discussions**: Major hook repositories for community Q&A
- **Discord Communities**: Claude Code and AI development channels
- **Stack Overflow**: Tag questions with `claude-code` and `hooks`

#### Development Workflow

1. **Start Simple**: Begin with basic logging hooks to understand execution
2. **Test Incrementally**: Add one hook at a time and verify behavior
3. **Use Debugging**: Enable comprehensive logging during development
4. **Monitor Performance**: Track execution time and resource usage
5. **Share Solutions**: Contribute successful patterns back to community

---

This guide provides comprehensive coverage of Claude Code hooks from basic concepts to advanced orchestration patterns. Start with simple formatting and logging hooks, then gradually incorporate more sophisticated automation as your development workflows mature. Remember that effective hooks are focused, fast, and designed to enhance rather than impede your development process.
