# Claude Code Hooks - Session Stop
# Logs session end with reason and metrics

param()

$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json
$sessionId = $data.session_id
$reason = if ($data.reason) { $data.reason } else { "other" }

& "$PSScriptRoot\send_log.ps1" -SessionId $sessionId -Level "DEBUG" -Message "{`"SessionEnd`": $jsonInput}"

# Don't create infinite loops
if ($stopHookActive -eq $true) {
    exit 0
}

# Calculate session metrics from session log
$logsDir = Join-Path $PSScriptRoot '..' ".." "logs"
$shortSessionId = $sessionId.Substring(0, 8)
$logFiles = Get-ChildItem -Path $logsDir -Filter "*-*-$shortSessionId.log" -ErrorAction SilentlyContinue
$sessionLogFile = $logFiles | Select-Object -First 1

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
        $currentDate = (Split-Path -Path $sessionLogFile -Leaf).Substring(0, 8)
        $fullStartTimeStr = "$currentDate $startTimeStr"
        $startTime = [datetime]::ParseExact($fullStartTimeStr, "yyyyMMdd HH:mm:ss", $null)
        $duration = "{0:F0}s" -f (New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds
    }

    # Count tool calls (exclude SessionStart, Prompt, SessionEnd, SecurityBlock)
    $toolLines = $logLines | Where-Object {
        $_ -match '\[(?!SessionStart|Prompt|SessionEnd|SecurityBlock|Stop|SubagentStop|Notification\])'
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
exit 0