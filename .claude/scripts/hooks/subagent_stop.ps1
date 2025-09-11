# Claude Code Hooks - Subagent Stop
# Logs subagent completion

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$sessionId = $data.session_id
$parentSessionId = $data.parent_session_id

# Log subagent completion
$detailsObj = @{
    parent = if ($parentSessionId) { $parentSessionId.Substring(0, 8) } else { "unknown" }
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SubagentStop" -Details $details

Write-Host "✓ Subagent task complete"
exit 0