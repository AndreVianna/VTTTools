# Claude Code Hooks - Session Start
# Initializes session logging and displays project context

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$sessionId = $data.session_id

& "$PSScriptRoot\send_log.ps1" -SessionId $sessionId -Level "DEBUG" -Message "{`"SessionStart`": $jsonInput}"

$source = $data.source  # startup, resume, clear, or compact
$cwd = $data.cwd

# Log session start using shared utility
$detailsObj = @{
    type = $source
    cwd = $cwd
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SessionStart" -Details $details

# Display development context (separate from logging)
Write-Host "⬇️"
Write-Host "Session ID: $sessionId"
Write-Host "Type: $source"
Write-Host "Working Directory: $cwd"

# Git status if available
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "`n=== GIT STATUS ==="
    git status --short
    Write-Host "`n=== RECENT COMMITS ==="
    git log --oneline -5
}

# Project files
Write-Host "`n=== PROJECT STRUCTURE ==="
# Show directories (excluding hidden ones starting with ".")
# Filter out hidden directories starting with "."
Get-ChildItem -Path $cwd -Directory | Where-Object { -not $_.Name.StartsWith('.') } | ForEach-Object {
    Write-Host "  📁 $($_.Name)"
}
Write-Host "⬆️"
exit 0