# Claude Code Log Viewer - Session-Based Format
# Optimized for new session log format: yyyyMMdd-NNN-sessionId.log

param(
    [string]$Session,           # Session ID (full or partial match)
    [string]$Date,              # Date filter (yyyyMMdd)
    [switch]$Latest,            # Show latest session
    [switch]$List,              # List available sessions
    [ValidateSet("Prompt", "Read", "Write", "Edit", "MultiEdit", "Bash", "Glob", "Grep", "Task",
                 "SessionStart", "SessionEnd", "SecurityBlock", "SubagentStop", "Notification", "DEBUG", "INFO", "WARN", "ERROR")]
    [string[]]$Operation,       # Show only these operations
    [string[]]$Exclude,         # Exclude these operations
    [int]$Last = 50,           # Number of entries to show
    [switch]$Follow,           # Follow mode (tail)
    [ValidateSet("compact", "detailed", "json")]
    [string]$Format = "compact", # Display format
    [switch]$Stats,            # Show session statistics
    [string]$Search,           # Search in details/prompts
    [switch]$NoColor,          # Disable colorized output
    [switch]$Help              # Show help information
)

[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding

$logsDir = Join-Path $PSScriptRoot ".." "logs"

# Show help information
if ($Help) {
    Write-Host @"
CLAUDE CODE LOG VIEWER
======================

SYNOPSIS
    view_logs.ps1 [options]
    
DESCRIPTION  
    Displays Claude Code session logs in readable format. Logs are stored as
    session-based files (yyyyMMdd-NNN-sessionId.log) with entries in format:
    HHmmss [Operation] {JSON}

PARAMETERS
    -List                   List all available sessions
    -Latest                 Show latest/current session (default)
    -Session <id>           Show specific session (full or partial ID)
    -Date <yyyyMMdd>        Show sessions from specific date
    
    -Operation <ops>        Show only specified operations
                            Values: Prompt, Read, Write, Edit, MultiEdit, Bash,
                                   Glob, Grep, Task, SessionStart, SessionEnd,
                                   SecurityBlock, SubagentStop, Notification
    -Exclude <ops>          Exclude specified operations
    -Last <n>               Show last N entries (default: 50)
    
    -Follow                 Follow/tail log in real-time
    -Format <format>        Display format: compact, detailed, json
    -Stats                  Show session statistics and summary
    -Search <text>          Search for text in entries
    -NoColor                Disable colorized output
    -Help                   Show this help

EXAMPLES
    view_logs.ps1
        Show latest session (default)
        
    view_logs.ps1 -List
        List all available sessions with dates and IDs
        
    view_logs.ps1 -Session 842c24c5
        Show specific session by ID (partial match supported)
        
    view_logs.ps1 -Date 20250910
        Show all sessions from September 10, 2025
        
    view_logs.ps1 -Operation Prompt
        Show only user prompts from latest session
        
    view_logs.ps1 -Operation Read,Write,Edit
        Show only file operations
        
    view_logs.ps1 -Exclude SecurityBlock,Notification
        Hide security blocks and notifications
        
    view_logs.ps1 -Search "performance"
        Find entries containing "performance"

    view_logs.ps1 -Stats
        Show session statistics and tool usage summary

    view_logs.ps1 -Follow
        Follow latest session in real-time

    view_logs.ps1 -Format detailed
        Show full JSON details for each entry

    view_logs.ps1 -Operation Bash -NoColor
        Show only Bash commands without colors

OPERATIONS
    SessionStart        Session initialization with type indicator
    SessionEnd          Session completion with reason and metrics
    Prompt              User prompt submissions
    Read, Write, Edit   File operations with paths and content
    Bash                Shell command executions
    Task                Subagent task delegations
    SecurityBlock       Blocked dangerous operations
    SubagentStop        Subagent completion notifications
    Notification        System notifications and alerts

LOG FORMAT
    Files: .claude/logs/yyyyMMdd-NNN-sessionId.log
    Entry: HHmmss [Operation] {"key":"value","details":"..."}

"@ -ForegroundColor Cyan
    exit 0
}

# Function to discover session log files
function Get-SessionFiles {
    param(
        [string]$SessionFilter,
        [string]$DateFilter
    )

    $pattern = if ($DateFilter) { "$DateFilter-*-*.log" } else { "????????-*-*.log" }
    $files = Get-ChildItem -Path $logsDir -Name $pattern -ErrorAction SilentlyContinue

    if ($SessionFilter) {
        $files = $files | Where-Object { $_ -like "*$SessionFilter*" }
    }

    return $files | Sort-Object -Descending
}

# Function to parse new log line format
function Parse-LogLine {
    param([string]$Line)

    if ($Line -match '^(\d{2}:\d{2}:\d{2}) \[([^\]]+)\] (.*)$') {
        $timeStr = $matches[1]
        $operation = $matches[2]
        $detailsJson = $matches[3]

        try {
            $details = $detailsJson | ConvertFrom-Json
        } catch {
            $details = @{ raw = $detailsJson }
        }

        return @{
            Time = $timeStr
            Operation = $operation
            Details = $details
            Raw = $Line
        }
    }

    return $null
}

# Function to display log entries with colorization
function Show-Entry {
    param($Entry, [string]$DisplayFormat, [bool]$UseColor = $true)

    $operationColors = @{
        "SessionStart" = "Blue"
        "SessionEnd" = "Blue"
        "Prompt" = "Cyan"
        "Read" = "Blue"
        "Write" = "Magenta"
        "Edit" = "DarkMagenta"
        "Bash" = "Green"
        "Task" = "DarkGreen"
        "TodoWrite" = "DarkMagenta"
        "SecurityBlock" = "DarkRed"
        "SubagentStop" = "DarkYellow"
        "ExitPlanMode" = "DarkYellow"
        "Notification" = "DarkCyan"
        "DEBUG" = "DarkGray"
        "INFO" = "DarkCyan"
        "WARN" = "Yellow"
        "ERROR" = "Red"
    }

    # Default colors for safe PowerShell color handling
    $timeColor = if ($UseColor) { "Gray" } else { "White" }
    $opColor = if ($UseColor -and $operationColors[$Entry.Operation]) { $operationColors[$Entry.Operation] } else { "Gray" }

    switch ($DisplayFormat) {
        "compact" {
            Write-Host "$($Entry.Time) " -NoNewline -ForegroundColor $timeColor
            Write-Host "[$($Entry.Operation)]" -NoNewline -ForegroundColor $opColor
            Write-Host " " -NoNewline

            # Show relevant details based on operation
            switch ($Entry.Operation) {
                "SessionStart" {
                    Write-Host "$($Entry.Details.type), $($Entry.Details.cwd)" -ForegroundColor Gray
                }
                "Prompt" {
                    Write-Host "$($Entry.Details.prompt)" -ForegroundColor Gray
                }
                "Read" {
                    Write-Host "$($Entry.Details.file_path)" -ForegroundColor Gray
                }
                "Write" {
                    Write-Host "$($Entry.Details.file_path)" -ForegroundColor Gray
                }
                "Edit" {
                    Write-Host "$($Entry.Details.file_path)" -ForegroundColor Gray
                }
                "Bash" {
                    Write-Host "$($Entry.Details.command)" -ForegroundColor Gray
                }
                "Task" {
                    Write-Host "$($Entry.Details.subagent_type)" -ForegroundColor Gray
                }
                "SecurityBlock" {
                    Write-Host "$($Entry.Details.tool): $($Entry.Details.reason)" -ForegroundColor DarkRed
                }
                "SessionEnd" {
                    Write-Host "$($Entry.Details.reason), $($Entry.Details.duration), $($Entry.Details.tools_used) tools" -ForegroundColor Gray
                }
                "ExitPlanMode" {
                    Write-Host ""
                    Write-Host "$($Entry.Details.plan)" -ForegroundColor Gray
                }
                "Notification" {
                    Write-Host "$($Entry.Details.message)" -ForegroundColor Gray
                }
                "TodoWrite" {
                    Write-Host ""
                    ForEach ($todo in $Entry.Details.todos) {
                        switch ($todo.status) {
                            "pending" { Write-Host "🔳 " -NoNewline -ForegroundColor Gray }
                            "in_progress" { Write-Host "⚙️ " -NoNewline -ForegroundColor Gray }
                            "completed" { Write-Host "✅ " -NoNewline -ForegroundColor Gray }
                            default { Write-Host "$($todo.status) " -NoNewline -ForegroundColor Gray }
                        }
                        Write-Host "$($todo.content)" -ForegroundColor Gray
                    }
                }
                "DEBUG" {
                    Write-Host "$($Entry.Details.raw)" -ForegroundColor DarkGray
                }
                "INFO" {
                    Write-Host "$($Entry.Details.raw)" -ForegroundColor DarkCyan
                }
                "WARN" {
                    Write-Host "$($Entry.Details.raw)" -ForegroundColor Yellow
                }
                "ERROR" {
                    Write-Host "$($Entry.Details.raw)" -ForegroundColor Red
                }
                default {
                    Write-Host ""
                    Write-Host "$($Entry.Details | ConvertTo-Json)" -ForegroundColor Gray
                }
            }
        }
        "detailed" {
            Write-Host "[$($Entry.Time.Substring(0,2)):$($Entry.Time.Substring(2,2)):$($Entry.Time.Substring(4,2))] " -NoNewline -ForegroundColor $timeColor
            Write-Host $Entry.Operation -ForegroundColor $opColor
            $Entry.Details | ConvertTo-Json | Format-Json | Write-Host -ForegroundColor DarkGray
            Write-Host ""
        }
        "json" {
            Write-Host ($Entry.Details | ConvertTo-Json -Compress)
        }
    }
}

# Function to get session statistics
function Get-SessionStats {
    param($Entries)

    $sessionStart = $Entries | Where-Object { $_.Operation -eq "SessionStart" } | Select-Object -First 1
    $sessionEnd = $Entries | Where-Object { $_.Operation -eq "SessionEnd" } | Select-Object -First 1

    $operationCounts = $Entries | Group-Object Operation | Sort-Object Count -Descending
    $toolCounts = $Entries | Where-Object { $_.Operation -notin @("SessionStart", "SessionEnd", "Prompt", "SecurityBlock", "SubagentStop", "Notification") } | Group-Object Operation | Sort-Object Count -Descending

    Write-Host "=== SESSION STATISTICS ===" -ForegroundColor Yellow
    if ($sessionStart) {
        Write-Host "Start: $($sessionStart.Details.type) at $($sessionStart.Time)" -ForegroundColor Green
        Write-Host "CWD: $($sessionStart.Details.cwd)" -ForegroundColor Gray
    }
    if ($sessionEnd) {
        Write-Host "End: $($sessionEnd.Details.reason) - Duration: $($sessionEnd.Details.duration)" -ForegroundColor Red
        Write-Host "Tools used: $($sessionEnd.Details.tools_used)" -ForegroundColor Gray
    }

    Write-Host "`nOperation Counts:" -ForegroundColor Cyan
    $operationCounts | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor White
    }

    if ($toolCounts) {
        Write-Host "`nTool Usage:" -ForegroundColor Cyan
        $toolCounts | ForEach-Object {
            Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor White
        }
    }

    Write-Host "=========================" -ForegroundColor Yellow
}

# Main script logic
if (-not (Test-Path $logsDir)) {
    Write-Host "Logs directory not found: $logsDir" -ForegroundColor Red
    exit 1
}

# List available sessions
if ($List) {
    Write-Host "Available Sessions:" -ForegroundColor Yellow
    $sessionFiles = Get-SessionFiles
    if ($sessionFiles) {
        $sessionFiles | ForEach-Object {
            $parts = $_ -replace '\.log$' -split '-'
            $dateStr = $parts[0]
            $sequence = $parts[1]
            $sessionId = $parts[2]

            # Format date as yyyy-MM-dd
            $formattedDate = "$($dateStr.Substring(0,4))-$($dateStr.Substring(4,2))-$($dateStr.Substring(6,2))"
            Write-Host "  $formattedDate - $sequence - $sessionId" -ForegroundColor White
        }
    } else {
        Write-Host "No session log files found." -ForegroundColor Gray
    }
    exit 0
}

# Determine which session file to use
$sessionFile = $null

if ($Latest) {
    $sessionFiles = Get-SessionFiles
    $sessionFile = $sessionFiles | Select-Object -First 1
} elseif ($Session) {
    $sessionFiles = Get-SessionFiles -SessionFilter $Session
    Write-Host "SessionFiles: $sessionFiles"
    if ($sessionFiles.Count -eq 1) {
        $sessionFile = $sessionFiles | Select-Object -First 1
    } elseif ($sessionFiles.Count -gt 1) {
        Write-Host "Multiple sessions found matching '$Session':" -ForegroundColor Yellow
        $sessionFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        exit 1
    }
} elseif ($Date) {
    $sessionFiles = Get-SessionFiles -DateFilter $Date
    if ($sessionFiles.Count -eq 1) {
        $sessionFile = $sessionFiles | Select-Object -First 1
    } elseif ($sessionFiles.Count -gt 1) {
        Write-Host "Multiple sessions found for date '$Date':" -ForegroundColor Yellow
        $sessionFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        exit 1
    }
} else {
    # Default to latest session
    $sessionFiles = Get-SessionFiles
    $sessionFile = $sessionFiles | Select-Object -First 1
}

if (-not $sessionFile) {
    Write-Host "No session log files found." -ForegroundColor Red
    exit 1
}

$sessionLogPath = Join-Path $logsDir $sessionFile
Write-Host "Viewing session: $sessionFile" -ForegroundColor Green

# Read and parse log entries
if ($Follow) {
    Write-Host "Following log file (Ctrl+C to stop)..." -ForegroundColor Yellow
    Get-Content $sessionLogPath -Wait | ForEach-Object {
        $entry = Parse-LogLine $_
        if ($entry) {
            # Apply filters
            $include = $true
            if ($Operation -and $entry.Operation -notin $Operation) { $include = $false }
            if ($Exclude -and $entry.Operation -in $Exclude) { $include = $false }
            if ($Search -and $entry.Raw -notmatch [regex]::Escape($Search)) { $include = $false }

            if ($include) {
                Show-Entry $entry $Format (-not $NoColor)
            }
        }
    }
} else {
    if (-not (Test-Path $sessionLogPath)) {
        Write-Host "Session log file not found: $sessionLogPath" -ForegroundColor Red
        exit 1
    }

    $lines = Get-Content $sessionLogPath
    $entries = $lines | ForEach-Object { Parse-LogLine $_ } | Where-Object { $_ -ne $null }

    # Apply filters
    if ($Operation) {
        $entries = $entries | Where-Object { $_.Operation -in $Operation }
    }
    if ($Exclude) {
        $entries = $entries | Where-Object { $_.Operation -notin $Exclude }
    }
    if ($Search) {
        $entries = $entries | Where-Object { $_.Raw -match [regex]::Escape($Search) }
    }

    # Show statistics if requested
    if ($Stats) {
        Get-SessionStats $entries
        Write-Host ""
    }

    # Show entries
    $entriesToShow = $entries | Select-Object -Last $Last
    $entriesToShow | ForEach-Object {
        Show-Entry $_ $Format (-not $NoColor)
    }

    if (-not $Stats) {
        Write-Host "`nShowing last $Last entries. Total: $($entries.Count)" -ForegroundColor DarkGray
    }
}