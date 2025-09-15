# Claude Code Hooks - Session Stop
# Logs session end with reason and metrics

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$sessionId = $data.session_id

& "$PSScriptRoot\send_log.ps1" -SessionId $sessionId -Level "DEBUG" -Message "{`"Stop`": $jsonInput}"
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "Stop" -Details "{}"
exit 0