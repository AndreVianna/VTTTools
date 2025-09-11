# Claude Code Hooks - Shared Logging Utility
# Provides consistent session-based logging for all hooks

param(
    [Parameter(Mandatory=$true)]
    [string]$SessionId,
    
    [Parameter(Mandatory=$true)]
    [string]$Operation,
    
    [Parameter(Mandatory=$true)]
    [string]$Details
)

# Create logs directory if it doesn't exist
$logsDir = Join-Path $PSScriptRoot ".." ".." "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Generate session log filename (one per session per day)
$dateStamp = Get-Date -Format "yyyyMMdd"
$shortSessionId = $SessionId.Substring(0, 8)
$sessionLogFile = Join-Path $logsDir "$dateStamp-$shortSessionId.log"

# Generate log entry (time only, date is in filename)
$timeStamp = Get-Date -Format "HH:mm:ss"
$logEntry = "$timeStamp [$Operation] $Details"

# Append to session log file
Add-Content -Path $sessionLogFile -Value $logEntry -Encoding UTF8

# Return success
exit 0