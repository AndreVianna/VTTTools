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
$toolName = $data.tool_name

$sessionId = $data.session_id
$detailsObj = @{
    tool = $toolName
    status = success
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation 'ToolComplete' -Details $details
exit 0