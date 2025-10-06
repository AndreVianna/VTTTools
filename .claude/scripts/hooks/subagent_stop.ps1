param()
$jsonInput = ''
try {
    if (-not [Console]::IsInputRedirected) {
        exit 0
    }
    $readTask = [Console]::In.ReadToEndAsync()
    if ($readTask.Wait(500)) {
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
$parentSessionId = $data.parent_session_id

$detailsObj = @{
    parent = if ($parentSessionId) { $parentSessionId.Substring(0, 8) } else { "unknown" }
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SubagentStop" -Details $details
exit 0