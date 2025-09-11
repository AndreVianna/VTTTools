# Claude Code Hooks - User Prompt Submit
# Logs user prompts and loads project context

param(
    [switch]$LogOnly,
    [switch]$Validate
)

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$prompt = $data.prompt
$sessionId = $data.session_id

# Log the prompt using shared utility
$detailsObj = @{
    prompt = $prompt
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "Prompt" -Details $details

# Validation mode - check for prompt issues
if ($Validate) {
    # Check for empty prompts
    if ([string]::IsNullOrWhiteSpace($prompt)) {
        Write-Error "Empty prompt submitted"
        exit 2
    }
    
    # Check for prompts that are too long
    if ($prompt.Length -gt 100000) {
        Write-Error "Prompt exceeds maximum length (100k characters)"
        exit 2
    }
}

# Inject context if not log-only mode
if (-not $LogOnly) {
    # Load any context files
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

Write-Host "✓ Prompt logged: $(if ($prompt.Length -gt 50) { $prompt.Substring(0, 50) + '...' } else { $prompt })"
exit 0