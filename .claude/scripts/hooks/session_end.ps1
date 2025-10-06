param()
$jsonInput = ''
try {
    if (-not [Console]::IsInputRedirected) {
        exit 0
    }
    $readTask = [Console]::In.ReadToEndAsync()
    if ($readTask.IsCompleted -or $readTask.Wait(500)) {
        $jsonInput = $readTask.Result
    }
    if ([string]::IsNullOrWhiteSpace($jsonInput)) {
        exit 0
    }

}
catch {
    exit 0
}

$data = $jsonInput | ConvertFrom-Json
$sessionId = $data.session_id
$reason = if ($data.reason) { $data.reason } else { 'other' }

if ($stopHookActive -eq $true) {
    exit 0
}

$logsDir = Join-Path $PSScriptRoot '..' ".." "logs"
$shortSessionId = $sessionId.Substring(0, 8)
$logFiles = Get-ChildItem -Path $logsDir -Filter "*-*-$shortSessionId.log" -ErrorAction SilentlyContinue
$sessionLogFile = $logFiles | Select-Object -First 1

$duration = "unknown"
$toolsUsed = 0

if (Test-Path $sessionLogFile) {
    $logLines = Get-Content $sessionLogFile

    $sessionStartLine = $logLines | Where-Object { $_ -match '\[SessionStart\]' } | Select-Object -First 1
    if ($sessionStartLine) {
        $startTimeStr = ($sessionStartLine -split ' ')[0]
        $currentDate = (Split-Path -Path $sessionLogFile -Leaf).Substring(0, 8)
        $fullStartTimeStr = "$currentDate $startTimeStr"
        $startTime = [datetime]::ParseExact($fullStartTimeStr, "yyyyMMdd HH:mm:ss", $null)
        $duration = "{0:F0}s" -f (New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds
    }

    $toolLines = $logLines | Where-Object {
        $_ -match '\[(?!SessionStart|Prompt|SessionEnd|SecurityBlock|Stop|SubagentStop|Notification\])'
    }
    $toolsUsed = $toolLines.Count
}

$detailsObj = @{
    reason = $reason
    duration = $duration
    tools_used = $toolsUsed
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SessionEnd" -Details $details
exit 0