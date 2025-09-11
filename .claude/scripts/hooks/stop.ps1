# Claude Code Hooks - Session Stop
# Logs session end with reason and metrics

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$sessionId = $data.session_id
$stopHookActive = $data.stop_hook_active
$reason = if ($data.reason) { $data.reason } else { "other" }

# Don't create infinite loops
if ($stopHookActive -eq $true) {
    exit 0
}

# Calculate session metrics from session log
$logsDir = Join-Path $PSScriptRoot ".." "logs"
$dateStamp = Get-Date -Format "yyyyMMdd"
$shortSessionId = $sessionId.Substring(0, 8)
$sessionLogFile = Join-Path $logsDir "$dateStamp-$shortSessionId.log"

$duration = "unknown"
$toolsUsed = 0

# Try to read session log to calculate metrics
if (Test-Path $sessionLogFile) {
    $logLines = Get-Content $sessionLogFile
    
    # Find session start for duration calculation
    $sessionStartLine = $logLines | Where-Object { $_ -match '\[SessionStart\]' } | Select-Object -First 1
    if ($sessionStartLine) {
        $startTimeStr = ($sessionStartLine -split ' ')[0]
        # Parse time only format (HHmmss) and combine with today's date
        $currentDate = Get-Date -Format "yyyyMMdd"
        $fullStartTimeStr = "$currentDate$startTimeStr"
        $startTime = [datetime]::ParseExact($fullStartTimeStr, "yyyyMMddHHmmss", $null)
        $duration = "{0:F0}m" -f (New-TimeSpan -Start $startTime -End (Get-Date)).TotalMinutes
    }
    
    # Count tool calls (exclude SessionStart, Prompt, SessionEnd, SecurityBlock)
    $toolLines = $logLines | Where-Object { 
        $_ -match '\[(?!SessionStart|Prompt|SessionEnd|SecurityBlock|SubagentStop|Notification\])' 
    }
    $toolsUsed = $toolLines.Count
}

# Log session end
$detailsObj = @{
    reason = $reason
    duration = $duration
    tools_used = $toolsUsed
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SessionEnd" -Details $details

Write-Host "✓ Session complete. Reason: $reason, Duration: $duration, Tools used: $toolsUsed"
exit 0