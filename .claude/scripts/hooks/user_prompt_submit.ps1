param(
    [switch]$LogOnly,
    [switch]$Validate
)
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
$prompt = $data.prompt
$sessionId = $data.session_id

$detailsObj = @{
    prompt = $prompt
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "Prompt" -Details $details

# Validation mode - check for prompt issues
if ($Validate) {
    if ([string]::IsNullOrWhiteSpace($prompt)) {
        Write-Error "Empty prompt submitted"
        exit 2
    }

    if ($prompt.Length -gt 100000) {
        Write-Error "Prompt exceeds maximum length (100k characters)"
        exit 2
    }
}

# Inject context if not log-only mode
if (-not $LogOnly) {
    $contextDir = Join-Path $PSScriptRoot ".." "context"
    if (Test-Path $contextDir) {
        Write-Host "=== PROJECT CONTEXT ==="
        Get-ChildItem $contextDir -Filter "*.md" | ForEach-Object {
            Write-Host "Loading context from: $($_.Name)"
            Get-Content $_.FullName -Raw
        }
        Write-Host "======================="
    }
}
exit 0