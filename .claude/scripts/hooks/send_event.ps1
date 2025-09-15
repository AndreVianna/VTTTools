# Claude Code Hooks - Shared Logging Utility
# Provides consistent session-based logging for all hooks

param(
    [Parameter(Mandatory = $true)]
    [string]$SessionId,

    [Parameter(Mandatory = $true)]
    [string]$Operation,

    [Parameter(Mandatory = $true)]
    [string]$Details
)

# Create logs directory if it doesn't exist
$logsDir = Join-Path $PSScriptRoot '..' '..' 'logs'
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$shortSessionId = $SessionId.Substring(0, 8)
# Generate session log filename (one per session per day)
$dateStamp = Get-Date -Format 'yyyyMMdd'
# Find existing log files for today and determine next sequence number
$fileExists = Get-ChildItem -Path $logsDir -Filter "$dateStamp-*-$shortSessionId.log" -ErrorAction SilentlyContinue
$sameDateFiles = Get-ChildItem -Path $logsDir -Filter "$dateStamp-*.log" -ErrorAction SilentlyContinue
$sequenceNumber = 1

if (-not $fileExists -and $sameDateFiles) {
    # Extract sequence numbers from existing files
    $sequences = @()
    foreach ($file in $sameDateFiles) {
        if ($file.Name -match "$dateStamp-(\d+)-.*") {
            $sequences += [int]$matches[1]
        }
    }

    # Find the highest sequence number and increment
    if ($sequences.Count -gt 0) {
        $sequenceNumber = [int](($sequences | Measure-Object -Maximum).Maximum + 1)
    }
}

if ($fileExists) {
    $sequenceNumber = [int]$fileExists.Name.Split('-')[1]
}

$sequenceString = '{0:D3}' -f $sequenceNumber
$sessionLogFile = Join-Path $logsDir "$dateStamp-$sequenceString-$shortSessionId.log"

# Generate log entry (time only, date is in filename)
$timeStamp = Get-Date -Format 'HH:mm:ss'
$logEntry = "$timeStamp [$Operation] $Details"

# Append to session log file
Add-Content -Path $sessionLogFile -Value $logEntry -Encoding UTF8

# Return success
exit 0