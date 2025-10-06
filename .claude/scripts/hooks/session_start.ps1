param()
$jsonInput = ""
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

$cwd = (Get-Location).Path
$data = $jsonInput | ConvertFrom-Json
$sessionId = $data.session_id
$source = $data.source

$detailsObj = @{
    type = $source
    cwd = $cwd
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SessionStart" -Details $details

Write-Host "⬇️"
Write-Host "Session ID: $sessionId"
Write-Host "Type: $source"

if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "`n=== GIT STATUS ==="
    git status --short
    Write-Host "`n=== RECENT COMMITS ==="
    git log --oneline -5
}

Write-Host "`n=== PROJECT STRUCTURE ==="
Get-ChildItem -Path $cwd -Directory | Where-Object { -not $_.Name.StartsWith('.') } | ForEach-Object {
    Write-Host "  📁 $($_.Name)"
}
Write-Host "⬆️"
exit 0