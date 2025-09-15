# Claude Code Hooks - Post Tool Use
# Simplified post-tool logging (optional)

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

# Optional: Uncomment the lines below if you want to log tool completions
# $toolName = $data.tool_name
# $toolInput = $data.tool_input
# $toolResponse = $data.tool_response
$sessionId = $data.session_id
& "$PSScriptRoot\send_log.ps1" -SessionId $sessionId -Level "DEBUG" -Message "{`"PostToolUse`": $jsonInput}"

# $details = "completed successfully"
# & "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "PostToolUse" -Details "tool: $toolName, status: success"
exit 0