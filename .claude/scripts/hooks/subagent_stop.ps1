# Claude Code Hooks - Subagent Stop
# Logs subagent completion

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json
$sessionId = $data.session_id

& "$PSScriptRoot\send_log.ps1" -SessionId $sessionId -Level "DEBUG" -Message "{`"SubagentStop`": $jsonInput}"
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SubagentStop" -Details "{}"
exit 0