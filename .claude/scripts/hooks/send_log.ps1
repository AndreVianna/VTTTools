# Generic Logging Utility - Writes level-based log entries to the session log file
# Mirrors naming/rotation scheme used by send_event.ps1

param(
    [Parameter(Mandatory = $true)]
    [string]$SessionId,

    [Parameter(Mandatory = $true)]
    [ValidateSet('DEBUG','INFO','WARN','ERROR')]
    [string]$Level,

    [Parameter(Mandatory = $true)]
    [string]$Message
)

# Ensure logs directory exists (same relative location as send_event.ps1)
$logsDir = Join-Path $PSScriptRoot '..' '..' 'logs'
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Short session id for filename
$shortSessionId = $SessionId.Substring(0, [Math]::Min(8, $SessionId.Length))

# Determine date + existing sequence number (shared per day across sessions)
$dateStamp = Get-Date -Format 'yyyyMMdd'
$fileExists = Get-ChildItem -Path $logsDir -Filter "$dateStamp-*-$shortSessionId.log" -ErrorAction SilentlyContinue | Select-Object -First 1
$sameDateFiles = Get-ChildItem -Path $logsDir -Filter "$dateStamp-*.log" -ErrorAction SilentlyContinue
$sequenceNumber = 1

if (-not $fileExists -and $sameDateFiles) {
    $sequences = foreach ($file in $sameDateFiles) { if ($file.Name -match "$dateStamp-(\d+)-.*") { [int]$matches[1] } }
    if ($sequences.Count -gt 0) { $sequenceNumber = ([int]($sequences | Measure-Object -Maximum).Maximum) + 1 }
}

if ($fileExists) { $sequenceNumber = [int]$fileExists.Name.Split('-')[1] }

$sequenceString = '{0:D3}' -f $sequenceNumber
$sessionLogFile = Join-Path $logsDir "$dateStamp-$sequenceString-$shortSessionId.log"

# Compose entry
$timeStamp = Get-Date -Format 'HH:mm:ss'
$logEntry = "$timeStamp [$Level] $Message"

# Append
Add-Content -Path $sessionLogFile -Value $logEntry -Encoding UTF8

exit 0
